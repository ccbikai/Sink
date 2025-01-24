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

  const link = await readValidatedBody(event, LinkSchema.parse)
  const { cloudflare } = event.context
  const { KV } = cloudflare.env

  const existingLink: z.infer<typeof LinkSchema> | null = await KV.get(`link:${link.slug}`, { type: 'json' })

  // If updating to a new slug
  if (existingLink === null) {
    // Try to find the link by the old slug from the request body
    const oldSlug = event.context.body.oldSlug
    if (!oldSlug) {
      throw createError({
        status: 404,
        statusText: 'Link not found',
      })
    }

    const oldLink: z.infer<typeof LinkSchema> | null = await KV.get(`link:${oldSlug}`, { type: 'json' })
    if (!oldLink) {
      throw createError({
        status: 404,
        statusText: 'Link not found',
      })
    }

    // Check if new slug already exists
    const newSlugExists = await KV.get(`link:${link.slug}`, { type: 'json' })
    if (newSlugExists) {
      throw createError({
        status: 409,
        statusText: 'Slug already exists',
      })
    }

    // Create new link entry with updated slug
    const newLink = {
      ...oldLink,
      ...link,
      id: oldLink.id, // preserve original id
      createdAt: oldLink.createdAt, // preserve original creation time
      updatedAt: Math.floor(Date.now() / 1000),
    }

    const expiration = getExpiration(event, newLink.expiration)

    // Write new entry first
    await KV.put(`link:${newLink.slug}`, JSON.stringify(newLink), {
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

  // Regular update without slug change
  const newLink = {
    ...existingLink,
    ...link,
    id: existingLink.id,
    createdAt: existingLink.createdAt,
    updatedAt: Math.floor(Date.now() / 1000),
  }

  const expiration = getExpiration(event, newLink.expiration)
  await KV.put(`link:${newLink.slug}`, JSON.stringify(newLink), {
    expiration,
    metadata: {
      expiration,
      url: newLink.url,
      comment: newLink.comment,
    },
  })

  setResponseStatus(event, 201)
  const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${newLink.slug}`
  return { link: newLink, shortLink }
})
