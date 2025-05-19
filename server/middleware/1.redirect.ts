import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'
import { parsePath, withQuery } from 'ufo'
import { createError } from 'h3'
import { UAParser } from 'ua-parser-js'
import {
  CLIs,
  Crawlers,
  Emails,
  ExtraDevices,
  Fetchers,
  InApps,
  MediaPlayers,
  Vehicles,
} from 'ua-parser-js/extensions'

export default eventHandler(async (event) => {
  const { pathname: slug } = parsePath(event.path.replace(/^\/|\/$/g, '')) // remove leading and trailing slashes
  const { slugRegex, reserveSlug } = useAppConfig(event)
  const { homeURL, linkCacheTtl, redirectWithQuery, caseSensitive } = useRuntimeConfig(event)
  const { cloudflare } = event.context

  if (event.path === '/' && homeURL)
    return sendRedirect(event, homeURL)

  if (slug && !reserveSlug.includes(slug) && slugRegex.test(slug) && cloudflare) {
    const { KV } = cloudflare.env

    let link: z.infer<typeof LinkSchema> | null = null

    const getLink = async (key: string) =>
      await KV.get(`link:${key}`, { type: 'json', cacheTtl: linkCacheTtl })

    const lowerCaseSlug = slug.toLowerCase()
    link = await getLink(caseSensitive ? slug : lowerCaseSlug)

    // fallback to original slug if caseSensitive is false and the slug is not found
    if (!caseSensitive && !link && lowerCaseSlug !== slug) {
      console.log('original slug fallback:', `slug:${slug} lowerCaseSlug:${lowerCaseSlug}`)
      link = await getLink(slug)
    }

    if (link) {
      // Max views logic
      if (link.max_views && link.max_views > 0) {
        const userAgent = getHeader(event, 'user-agent') || ''
        const uaInfo = (new UAParser(userAgent, {
          browser: [Crawlers.browser || [], CLIs.browser || [], Emails.browser || [], Fetchers.browser || [], InApps.browser || [], MediaPlayers.browser || [], Vehicles.browser || []].flat(),
          device: [ExtraDevices.device || []].flat(),
        })).getResult()

        const { request: { cf } } = event.context.cloudflare
        const isBot = cf?.botManagement?.verifiedBot ||
                      ['crawler', 'fetcher'].includes(uaInfo?.browser?.type || '') ||
                      ['spider', 'bot'].includes(uaInfo?.browser?.name?.toLowerCase() || '')

        if (!isBot) {
          const viewsKey = `views:${link.slug}` // link.slug is the canonical key
          const currentViewsStr = await KV.get(viewsKey)
          const currentViews = currentViewsStr ? parseInt(currentViewsStr, 10) : 0

          if (currentViews >= link.max_views) {
            throw createError({ statusCode: 429, statusMessage: 'Too Many Requests: View limit reached for this link.' })
          }
          else {
            await KV.put(viewsKey, (currentViews + 1).toString())
          }
        }
      }

      // Original logic: only proceeds if not blocked by max_views error
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
