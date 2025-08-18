import { LinkSchema } from '../../../schemas/link'
import { getUserFromToken } from '../../utils/auth'
import { getExpiration } from '../../utils/time'
import { eventHandler, readValidatedBody, createError, setResponseStatus, getRequestProtocol, getRequestHost } from 'h3'
import { useRuntimeConfig } from '#imports'

defineRouteMeta({
  openAPI: {
    description: 'Create a new short link',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          // Need: https://github.com/nitrojs/nitro/issues/2974
          schema: {
            type: 'object',
            required: ['url'],
            properties: {
              url: {
                type: 'string',
                description: 'The URL to shorten',
              },
            },
          },
        },
      },
    },
  },
})

export default eventHandler(async (event) => {
  console.log('开始创建短链接...')
  // 获取当前登录用户
  try {
    const user = await getUserFromToken(event)
    console.log('成功获取用户信息:', { userId: user.id, username: user.username })
    
    const link = await readValidatedBody(event, (data: any) => {
      // 确保data是一个对象
      const validatedData = typeof data === 'object' && data !== null ? data : {};
      console.log('验证前的请求数据:', validatedData)
      const parsedData = LinkSchema.parse({
        ...validatedData,
        userId: user.id
      })
      console.log('验证后的链接数据:', parsedData)
      return parsedData
    })

    const { caseSensitive } = useRuntimeConfig(event)

    if (!caseSensitive) {
      link.slug = link.slug.toLowerCase()
      console.log('转换为小写后的slug:', link.slug)
    }

    const { cloudflare } = event.context
    const { KV } = cloudflare.env
    console.log('检查KV存储中是否存在相同slug的链接:', link.slug)
    const existingLink = await KV.get(`link:${link.slug}`)
    if (existingLink) {
      console.log('发现相同slug的链接，抛出409错误')
      throw createError({
        status: 409,
        statusText: 'A link with this slug already exists',
      })
    }

    const expiration = getExpiration(event, link.expiration)
    console.log('设置链接过期时间:', expiration ? new Date(expiration * 1000) : '永不过期')

    await KV.put(`link:${link.slug}`, JSON.stringify(link), {
      expiration,
      metadata: {
        expiration,
        url: link.url,
        comment: link.comment,
        userId: link.userId
      },
    })
    console.log('链接成功存储到KV:', `link:${link.slug}`)

    // 添加到用户的链接索引
    try {
      const userLinksIndex = await KV.get(`user:${user.id}:links`, { type: 'json' }) || []
      console.log('当前用户链接索引:', userLinksIndex)
      if (Array.isArray(userLinksIndex)) {
        userLinksIndex.push(link.slug)
        await KV.put(`user:${user.id}:links`, JSON.stringify(userLinksIndex))
        console.log('更新后的用户链接索引:', userLinksIndex)
      }
    } catch (error) {
      console.error('Failed to update user links index:', error)
    }

    setResponseStatus(event, 201)
    const protocol = getRequestProtocol(event)
    const host = getRequestHost(event)
    const shortLink = `${protocol}://${host}/${link.slug}`
    console.log('短链接创建成功:', shortLink)
    
    return {
      link,
      shortLink,
    }
  } catch (error) {
    console.error('创建短链接过程中发生错误:', error)
    throw error;
  }
})
