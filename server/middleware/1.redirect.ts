import type { z } from 'zod'
import { parsePath } from 'ufo'
import type { LinkSchema } from '@/schemas/link'

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.slice(1)) // remove leading slash
  const { slugRegex, reserveSlug } = useAppConfig(event)
  const { homeURL } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  if (slug && !reserveSlug.includes(slug) && slugRegex.test(slug) && cloudflare) {
    const { KV } = cloudflare.env
    const link: z.infer<typeof LinkSchema> | null = await KV.get(`link:${slug}`, { type: 'json' })
    if (link) {
      event.context.link = link
      try {
        await useAccessLog(event)
      }
      catch (error) {
        console.error('Failed write access log:', error)
      }
      return sendRedirect(event, link.url, +useRuntimeConfig(event).redirectStatusCode)
    }
  }
})
