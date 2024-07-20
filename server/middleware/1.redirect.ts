import type { z } from 'zod'
import { parsePath, withQuery } from 'ufo'
import type { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.slice(1)) // remove leading slash
  const { slugRegex, reserveSlug } = useAppConfig(event)
  const { homeURL, linkCacheTtl, redirectWithQuery } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  if (slug && !reserveSlug.includes(slug) && slugRegex.test(slug) && cloudflare) {
    const { KV } = cloudflare.env
    const link: z.infer<typeof LinkSchema> | null = await KV.get(`link:${slug}`, { type: 'json', cacheTtl: linkCacheTtl })
    if (link) {
      event.context.link = link
      try {
        await useAccessLog(event)
      }
      catch (error) {
        console.error('Failed write access log:', error)
      }
      const target = redirectWithQuery ? withQuery(link.url, getQuery(event)) : link.url
      return sendRedirect(event, target, +useRuntimeConfig(event).redirectStatusCode)
    }
  }
})
