import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'
import type { SmartLinkOptions } from '../utils/device-detection'
import { parsePath, withQuery } from 'ufo'
import { parseUserAgent } from '../utils/device-detection'
import { generateAutoRedirectResponse, generateSocialMetaResponse } from '../utils/redirect-response'
import { detectEnvironmentFromHost, getConfigForLink, getSafeYouConfig } from '../utils/safeyou.config'

interface ProcessingContext {
  slug: string
  userAgent: string
  startTime: number
  environment: string
  requestHost: string
  device?: ReturnType<typeof parseUserAgent>
}

export default eventHandler(async (event) => {
  const startTime = Date.now()
  const requestHost = getHeader(event, 'host') || 'safeyou.space'

  const context: ProcessingContext = {
    slug: '',
    userAgent: getHeader(event, 'user-agent') || '',
    startTime,
    environment: 'production', // Will be updated after fetching link
    requestHost,
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
    } = useRuntimeConfig(event)

    if (event.path === '/') {
      if (homeURL) {
        return sendRedirect(event, homeURL)
      }
      const hostEnv = detectEnvironmentFromHost(requestHost)
      const envConfig = getSafeYouConfig(hostEnv)
      return sendRedirect(event, envConfig.webUrl)
    }

    if (!isValidRequest(slug, reserveSlug, slugRegex, event.context.cloudflare?.env?.KV)) {
      return
    }

    // Fetch link from KV (without environment filtering)
    const link = await getLinkFromKV(
      event.context.cloudflare.env.KV,
      slug,
      caseSensitive,
      linkCacheTtl,
    )

    if (!link) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Link not found',
        data: {
          host: requestHost,
        },
      })
    }

    // Now determine the actual environment to use (link env takes priority)
    const actualEnvironment = detectEnvironmentFromHost(requestHost)
    context.environment = actualEnvironment

    // Log access with environment context
    setImmediate(() => logAccess(event, link, context))

    const target = redirectWithQuery
      ? withQuery(link.url, getQuery(event))
      : link.url

    const safeYouConfig = getConfigForLink(link, requestHost)

    console.log('Processing link redirect:', {
      slug: context.slug,
      linkEnvironment: link.env || 'not specified',
      hostEnvironment: detectEnvironmentFromHost(requestHost),
      finalEnvironment: actualEnvironment,
      targetUrl: target,
      configUsed: {
        iosAppId: safeYouConfig.iosAppId,
        iosUrlScheme: safeYouConfig.iosUrlScheme,
        androidPackage: safeYouConfig.androidPackageName,
        androidHost: safeYouConfig.androidHost,
      },
    })

    return await handleSmartRedirect(event, {
      slug,
      target,
      fallbackUrl: target,
      ...safeYouConfig,
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
      catch (error) {
        console.error('KV fetch error:', error)
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
  catch (error) {
    console.error('getLinkFromKV error:', error)
    return null
  }
}

async function logAccess(event: any, link: any, context: ProcessingContext): Promise<void> {
  try {
    event.context.link = link
    event.context.accessLog = {
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event),
      referer: getHeader(event, 'referer'),
      slug: link.slug,
      environment: context.environment,
      requestHost: context.requestHost,
      linkEnvironment: link.env || null,
    }

    await useAccessLog?.(event)
  }
  catch (error) {
    console.error('Access logging failed:', {
      error: error instanceof Error ? error.message : String(error),
      slug: link?.slug,
      environment: context.environment,
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

    console.log('Smart redirect initiated:', {
      environment: context.environment,
      slug: context.slug,
      device: {
        isIOS: device.isIOS,
        isAndroid: device.isAndroid,
        isMobile: device.isMobile,
        isBot: device.isBot,
        isInApp: device.isInApp,
      },
      appConfig: {
        iosAppId: options.iosAppId,
        iosUrlScheme: options.iosUrlScheme,
        androidPackage: options.androidPackageName,
        androidHost: options.androidHost,
        universalLink: options.iosUniversalLink,
      },
    })

    if (device.isBot) {
      console.log('Bot detected, serving social meta response')
      return generateSocialMetaResponse(event, options)
    }

    const finalConfig = {
      ...options,
      environment: context.environment,
      requestHost: context.requestHost,
    }

    if (device.isInApp) {
      console.log('In-app browser detected, direct redirect')
      return sendRedirect(event, finalConfig.target, 302)
    }

    if (device.isMobile) {
      console.log(`Mobile device detected, using SafeYou smart redirect for ${context.environment} environment`)
      return generateAutoRedirectResponse(event, finalConfig, device, context)
    }

    // Desktop users go directly to target
    console.log('Desktop user, direct redirect')
    const { redirectStatusCode } = useRuntimeConfig(event)
    return sendRedirect(event, finalConfig.target, +redirectStatusCode || 308)
  }
  catch (error) {
    console.error('Smart redirect failed:', {
      error: error instanceof Error ? error.message : String(error),
      slug: context.slug,
      environment: context.environment,
      processingTime: `${Date.now() - context.startTime}ms`,
    })

    // Fallback to direct redirect
    const { redirectStatusCode } = useRuntimeConfig(event)
    return sendRedirect(event, options.target, +redirectStatusCode || 308)
  }
}

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
    environment: context.environment,
    host: context.requestHost,
    processingTime: `${processingTime}ms`,
  })

  throw createError({
    statusCode: 500,
    statusMessage: 'Link processing failed',
    data: {
      timestamp: new Date().toISOString(),
      environment: context.environment,
      host: context.requestHost,
      processingTime: `${processingTime}ms`,
    },
  })
}
