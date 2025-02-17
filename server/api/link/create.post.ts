import { LinkSchema, nanoid } from '@/schemas/link'

export default eventHandler(async (event) => {
  const body = await readBody(event)

  // If no slug provided, generate one with default length from env or fall back to default
  if (!body.slug) {
    const { slugDefaultLength } = useRuntimeConfig().public
    body.slug = slugDefaultLength ? nanoid(+slugDefaultLength)() : nanoid()()
  }

  const link = await LinkSchema.parse(body)

  const { caseSensitive } = useRuntimeConfig(event)

  if (!caseSensitive) {
    link.slug = link.slug.toLowerCase()
  }

  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const existingLink = await KV.get(`link:${link.slug}`)
  if (existingLink) {
    throw createError({
      status: 409, // Conflict
      statusText: 'Link already exists',
    })
  }

  else {
    const expiration = getExpiration(event, link.expiration)

    await KV.put(`link:${link.slug}`, JSON.stringify(link), {
      expiration,
      metadata: {
        expiration,
        url: link.url,
        comment: link.comment,
      },
    })
    setResponseStatus(event, 201)
    const shortLink = `${getRequestProtocol(event)}://${getRequestHost(event)}/${link.slug}`
    return { link, shortLink }
  }
})
