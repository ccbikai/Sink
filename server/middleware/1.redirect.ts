import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'
import type { SmartLinkOptions } from '../utils/device-detection'
import { parsePath, withQuery } from 'ufo'
import {
  detectApp,
  parseUserAgent,
  validateAppConfig,
} from '../utils/device-detection'
import { generateAutoRedirectResponse, generateSocialMetaResponse } from '../utils/redirect-response'

interface ProcessingContext {
  slug: string
  userAgent: string
  startTime: number
  device?: ReturnType<typeof parseUserAgent>
}

export default eventHandler(async (event) => {
  const startTime = Date.now()
  const context: ProcessingContext = {
    slug: '',
    userAgent: getHeader(event, 'user-agent') || '',
    startTime,
  }

  try {
    const { pathname: slug } = parsePath(event.path.replace(/^\/|\/$/g, ''))
    context.slug = slug

    const { slugRegex, reserveSlug } = useAppConfig(event)
    const {
      homeURL,
      linkCacheTtl,
      redirectWithQuery,
      caseSensitive,
      redirectStatusCode,
      ...appConfig
    } = useRuntimeConfig(event)

    if (event.path === '/' && homeURL) {
      return sendRedirect(event, homeURL)
    }

    if (!isValidRequest(slug, reserveSlug, slugRegex, event.context.cloudflare?.env?.KV)) {
      return
    }

    // Fetch link from KV
    const link = await getLinkFromKV(
      event.context.cloudflare.env.KV,
      slug,
      caseSensitive,
      linkCacheTtl,
    )

    if (!link) {
      return
    }

    setImmediate(() => logAccess(event, link))

    const target = redirectWithQuery
      ? withQuery(link.url, getQuery(event))
      : link.url
    return await handleSmartRedirect(event, {
      slug,
      target,
      fallbackUrl: target,
      ...extractAppConfig(appConfig),
    }, context)
  }
  catch (error: unknown) {
    return handleError(error, event, context)
  }
})

function isValidRequest(
  slug: string,
  reserveSlug: string[],
  slugRegex: RegExp,
  kv?: any,
): boolean {
  return Boolean(
    slug
    && !reserveSlug.includes(slug)
    && slugRegex.test(slug)
    && kv,
  )
}

function extractAppConfig(runtimeConfig: any): Partial<SmartLinkOptions> {
  return {
    iosAppId: runtimeConfig.iosAppId,
    iosUrlScheme: runtimeConfig.iosUrlScheme,
    iosUniversalLink: runtimeConfig.iosUniversalLink,
    androidPackageName: runtimeConfig.androidPackageName,
    androidAppName: runtimeConfig.androidAppName,
    androidUrlScheme: runtimeConfig.androidUrlScheme,
  }
}

async function getLinkFromKV(
  KV: any,
  slug: string,
  caseSensitive: boolean,
  cacheTtl: number,
): Promise<z.infer<typeof LinkSchema> | null> {
  if (!KV)
    return null

  try {
    const fetchLink = async (key: string): Promise<any> => {
      try {
        return await KV.get(`link:${key}`, { type: 'json', cacheTtl })
      }
      catch {
        return null
      }
    }

    const searchKey = caseSensitive ? slug : slug.toLowerCase()
    let link = await fetchLink(searchKey)

    if (!caseSensitive && !link && searchKey !== slug) {
      link = await fetchLink(slug)
    }

    return link
  }
  catch {
    return null
  }
}

async function logAccess(event: any, link: any): Promise<void> {
  try {
    event.context.link = link
    event.context.accessLog = {
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event),
      referer: getHeader(event, 'referer'),
      slug: link.slug,
    }

    await useAccessLog?.(event)
  }
  catch (error) {
    console.error('Access logging failed:', {
      error: error instanceof Error ? error.message : String(error),
      slug: link?.slug,
    })
  }
}

async function handleSmartRedirect(
  event: any,
  options: SmartLinkOptions,
  context: ProcessingContext,
): Promise<any> {
  try {
    const device = parseUserAgent(context.userAgent)
    context.device = device

    if (device.isBot) {
      return generateSocialMetaResponse(event, options)
    }

    const detectedConfig = detectApp(options.target, context.userAgent)

    const finalConfig = Object.keys(detectedConfig).length > 0
      ? { ...options, ...detectedConfig }
      : options

    console.log('Final config:', finalConfig) // Add for debugging

    if (device.isInApp) {
      return sendRedirect(event, finalConfig.target, 302)
    }

    if (device.isMobile && validateAppConfig(finalConfig)) {
      console.log('Using smart redirect for mobile with app config') // Debug
      return generateAutoRedirectResponse(event, finalConfig, device)
    }

    if (device.isMobile) {
      console.log('Using smart redirect for mobile without app config') // Debug
      return generateAutoRedirectResponse(event, finalConfig, device)
    }

    const { redirectStatusCode } = useRuntimeConfig(event)
    return sendRedirect(event, finalConfig.target, +redirectStatusCode || 308)
  }
  catch (error) {
    console.error('Smart redirect failed:', {
      error: error instanceof Error ? error.message : String(error),
      slug: context.slug,
      processingTime: `${Date.now() - context.startTime}ms`,
    })

    const { redirectStatusCode } = useRuntimeConfig(event)
    return sendRedirect(event, options.target, +redirectStatusCode || 308)
  }
}

// function mergeAppConfig(
//   base: SmartLinkOptions,
//   detected: Partial<SmartLinkOptions>
// ): SmartLinkOptions {
//   return {
//     ...base,
//     ...(detected.iosAppId && { iosAppId: detected.iosAppId }),
//     ...(detected.iosUrlScheme && { iosUrlScheme: detected.iosUrlScheme }),
//     ...(detected.iosUniversalLink && { iosUniversalLink: detected.iosUniversalLink }),
//     ...(detected.androidPackageName && { androidPackageName: detected.androidPackageName }),
//     ...(detected.androidAppName && { androidAppName: detected.androidAppName }),
//     ...(detected.androidUrlScheme && { androidUrlScheme: detected.androidUrlScheme }),
//   }
// }

function getClientIP(event: any): string {
  const headers = [
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
  ]

  for (const header of headers) {
    const value = getHeader(event, header)
    if (value) {
      return value.split(',')[0].trim()
    }
  }

  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

function handleError(error: unknown, event: any, context: ProcessingContext): never {
  const processingTime = Date.now() - context.startTime
  const errorMessage = error instanceof Error ? error.message : String(error)

  console.error('Redirect handler error:', {
    error: errorMessage,
    slug: context.slug,
    path: event.path,
    processingTime: `${processingTime}ms`,
  })

  throw createError({
    statusCode: 500,
    statusMessage: 'Link processing failed',
    data: {
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`,
    },
  })
}
