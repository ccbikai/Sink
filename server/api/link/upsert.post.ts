import { LinkSchema } from '../../../schemas/link'
import { getUserFromToken } from '../../utils/auth'
import { getExpiration } from '../../utils/time'
import { eventHandler, readValidatedBody, getRequestProtocol, getRequestHost, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  // 获取当前登录用户
  const user = await getUserFromToken(event)
  
  const link = await readValidatedBody(event, (data: any) => {
    // 确保data是一个对象
    const validatedData = typeof data === 'object' && data !== null ? data : {};
    return LinkSchema.parse({
      ...validatedData,
      userId: user.id
    })
  })
  const { caseSensitive } = useRuntimeConfig(event)

  if (!caseSensitive) {
    link.slug = link.slug.toLowerCase()
  }

  const { cloudflare } = event.context
  const { KV } = cloudflare.env

  // Check if link exists
  const existingLink = await KV.get(`link:${link.slug}`, { type: 'json' })

  if (existingLink) {
    // If link exists, return it along with the short link
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
    return { link: existingLink, shortLink, status: 'existing' }
  }

  // If link doesn't exist, create it
  const expiration = getExpiration(event, link.expiration)

  await KV.put(`link:${link.slug}`, JSON.stringify(link), {
    expiration,
    metadata: {
        expiration,
        url: link.url,
        comment: link.comment,
        userId: link.userId
      },
  })

  setResponseStatus(event, 201)
  const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
  return { link, shortLink, status: 'created' }
})
