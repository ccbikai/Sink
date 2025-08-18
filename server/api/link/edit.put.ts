import type { z } from 'zod'
import { LinkSchema } from '../../../schemas/link'
import { getUserFromToken } from '../../utils/auth'
import { getExpiration } from '../../utils/time'
import { eventHandler, createError, readValidatedBody, setResponseStatus, getRequestProtocol, getRequestHost } from 'h3'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  // 获取当前登录用户
  const user = await getUserFromToken(event)
  
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot edit links.',
    })
  }
  const link = await readValidatedBody(event, (data: any) => {
    // 确保data是一个对象
    const validatedData = typeof data === 'object' && data !== null ? data : {};
    return LinkSchema.parse({
      ...validatedData,
      userId: user.id
    })
  })
  const { cloudflare } = event.context
  const { KV } = cloudflare.env

  const existingLink: z.infer<typeof LinkSchema> | null = await KV.get(`link:${link.slug}`, { type: 'json' })
  if (existingLink) {
    const newLink = {
      ...existingLink,
      ...link,
      id: existingLink.id, // don't update id
      createdAt: existingLink.createdAt, // don't update createdAt
      updatedAt: Math.floor(Date.now() / 1000),
    }
    const expiration = getExpiration(event, newLink.expiration)
    await KV.put(`link:${newLink.slug}`, JSON.stringify(newLink), {
      expiration,
      metadata: {
        expiration,
        url: newLink.url,
        comment: newLink.comment,
        userId: newLink.userId
      },
    })
    setResponseStatus(event, 201)
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${newLink.slug}`
    return { link: newLink, shortLink }
  }
})
