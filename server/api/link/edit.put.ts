import type { z } from 'zod'
import { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot edit links.',
    })
  }

  // Read raw body first to get oldSlug
  const body = await readBody(event)
  const oldSlug = body.oldSlug

  // Validate the link data
  const link = await LinkSchema.parse(body)
  const { cloudflare } = event.context
  const { KV } = cloudflare.env

  // If we're updating the slug
  if (oldSlug && oldSlug !== link.slug) {
    // Get the old link
    const oldLink: z.infer<typeof LinkSchema> | null = await KV.get(`link:${oldSlug}`, { type: 'json' })
    if (!oldLink) {
      throw createError({
        status: 404,
        statusText: 'Original link not found',
      })
    }

    // Check if new slug already exists
    const slugExists = await KV.get(`link:${link.slug}`, { type: 'json' })
    if (slugExists) {
      throw createError({
        status: 409,
        statusText: 'New slug already exists',
      })
    }

    // Create updated link
    const newLink = {
      ...oldLink,
      ...link,
      id: oldLink.id,
      createdAt: oldLink.createdAt,
      updatedAt: Math.floor(Date.now() / 1000),
    }

    const expiration = getExpiration(event, newLink.expiration)

    // Write new entry first
    await KV.put(`link:${link.slug}`, JSON.stringify(newLink), {
      expiration,
      metadata: {
        expiration,
        url: newLink.url,
        comment: newLink.comment,
      },
    })

    // Then delete old entry
    await KV.delete(`link:${oldSlug}`)

    setResponseStatus(event, 201)
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${newLink.slug}`
    return { link: newLink, shortLink }
  }

  // Regular update (no slug change)
  const existingLink: z.infer<typeof LinkSchema> | null = await KV.get(`link:${link.slug}`, { type: 'json' })
  if (!existingLink) {
    throw createError({
      status: 404,
      statusText: 'Link not found',
    })
  }

  const updatedLink = {
    ...existingLink,
    ...link,
    id: existingLink.id,
    createdAt: existingLink.createdAt,
    updatedAt: Math.floor(Date.now() / 1000),
  }

  const expiration = getExpiration(event, updatedLink.expiration)
  await KV.put(`link:${link.slug}`, JSON.stringify(updatedLink), {
    expiration,
    metadata: {
      expiration,
      url: updatedLink.url,
      comment: updatedLink.comment,
    },
  })

  setResponseStatus(event, 201)
  const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${updatedLink.slug}`
  return { link: updatedLink, shortLink }
})
