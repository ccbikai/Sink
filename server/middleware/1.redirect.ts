import type { LinkSchema } from '@@/schemas/link'
import type { z } from 'zod'
import type { SmartLinkOptions } from '../utils/device-detection'
import { parsePath, withQuery } from 'ufo'
import { useAccessLog } from '../utils/access-log'
import { detectAppFromHost, detectAppFromUrl, detectEnvironmentFromHost, getConfigForLink } from '../utils/apps.config'
import { parseUserAgent } from '../utils/device-detection'

import { generateAutoRedirectResponse, generateSocialMetaResponse } from '../utils/redirect-response'

interface ProcessingContext {
  slug: string
  userAgent: string
  startTime: number
  environment: string
  requestHost: string
  appName: string
  device?: ReturnType<typeof parseUserAgent>
}

export default eventHandler(async (event) => {
  const startTime = Date.now()
  const requestHost = getHeader(event, 'host') || 'safeyou.space'

  const context: ProcessingContext = {
    slug: '',
    userAgent: getHeader(event, 'user-agent') || '',
    startTime,
    environment: 'production',
    requestHost,
    appName: 'safeyou',
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

      const appName = detectAppFromHost(requestHost)
      const appConfig = getConfigForLink({ app: appName }, requestHost)

      return sendRedirect(event, appConfig.webUrl)
    }

    if (!isValidRequest(slug, reserveSlug, slugRegex, event.context.cloudflare?.env?.KV)) {
      return
    }

    const link = await getLinkFromKV(
      event.context.cloudflare.env.KV,
      slug,
      caseSensitive,
      linkCacheTtl,
    )
    let detectedApp = 'safeyou' // default

    if (link.url) {
      detectedApp = detectAppFromUrl(link.url)
      console.log(`[REDIRECT] App detected from URL: ${detectedApp}`)
    }
    if (!detectedApp || detectedApp === 'safeyou') {
      const hostApp = detectAppFromHost(requestHost)
      if (hostApp && hostApp !== 'unknown') {
        detectedApp = hostApp
        console.log(`[REDIRECT] App detected from host: ${detectedApp}`)
      }
    }
    if (link.app && typeof link.app === 'string') {
      detectedApp = link.app
      console.log(`[REDIRECT] Using explicit link app: ${detectedApp}`)
    }

    context.appName = detectedApp
    context.environment = detectEnvironmentFromHost(requestHost, detectedApp)

    setImmediate(() => logAccess(event, link, context))

    const target = redirectWithQuery
      ? withQuery(link.url, getQuery(event))
      : link.url

    const enhancedLink = {
      ...link,
      app: detectedApp,
    }

    const appConfig = getConfigForLink(enhancedLink, requestHost)

    console.log('Processing link redirect:', {
      slug: context.slug,
      appName: context.appName,
      linkEnvironment: link.env || 'not specified',
      hostEnvironment: context.environment,
      targetUrl: target,
      configUsed: {
        name: appConfig.name,
        displayName: appConfig.displayName,
        iosAppId: appConfig.iosAppId,
        iosUrlScheme: appConfig.iosUrlScheme,
        androidPackage: appConfig.androidPackageName,
        androidHost: appConfig.androidHost,
        webUrl: appConfig.webUrl,
      },
    })

    return await handleSmartRedirect(event, {
      slug,
      target,
      fallbackUrl: target,
      appName: context.appName,
      ...appConfig,
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
    const device = context.device || parseUserAgent(context.userAgent)

    event.context.link = link
    event.context.accessLog = {
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event),
      referer: getHeader(event, 'referer'),
      slug: link.slug,
      appName: context.appName,
      environment: context.environment,
      requestHost: context.requestHost,
      linkEnvironment: link.env || null,

      // Enhanced device information
      device: {
        isIOS: device.isIOS,
        isAndroid: device.isAndroid,
        isMobile: device.isMobile,
        isInAppBrowser: device.isInAppBrowser,
        isBot: device.isBot,
        isInApp: device.isInApp,
        browserName: device.browserName,
        osName: device.osName,
        osVersion: device.osVersion,
        deviceModel: device.deviceModel,
      },

      // Deep linking context
      deepLink: {
        appDetected: context.appName,
        targetUrl: link.url,
        redirectType: device.isMobile ? (device.isInApp ? 'in-app-redirect' : 'deep-link-attempt') : 'browser-redirect',
        detectionMethod: determineDetectionMethod(link, context),
        canLaunchApp: device.isMobile && !device.isBot && !device.isInAppBrowser,
      },

      // Processing metrics
      processingTime: Date.now() - context.startTime,
    }

    console.log('Access log created:', {
      slug: link.slug,
      appName: context.appName,
      device: event.context.accessLog.device,
      deepLink: event.context.accessLog.deepLink,
      processingTime: `${event.context.accessLog.processingTime}ms`,
    })

    // This is where useAccessLog gets called
    await useAccessLog(event)
  }
  catch (error) {
    console.error('Access logging failed:', {
      error: error instanceof Error ? error.message : String(error),
      slug: link?.slug,
      appName: context.appName,
      environment: context.environment,
      processingTime: context.startTime ? `${Date.now() - context.startTime}ms` : 'unknown',
    })
  }
}

function determineDetectionMethod(link: any, context: ProcessingContext): string {
  if (link.app) {
    return 'explicit-link-app'
  }
  if (link.url && detectAppFromUrl(link.url) !== 'safeyou') {
    return 'url-pattern-detection'
  }
  if (detectAppFromHost(context.requestHost) !== 'safeyou') {
    return 'host-pattern-detection'
  }
  return 'default-fallback'
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
      appName: context.appName,
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
        webUrl: options.webUrl,
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
      appName: context.appName,
    }

    if (device.isInApp) {
      console.log('In-app browser detected, direct redirect')
      return sendRedirect(event, finalConfig.target, 302)
    }

    if (device.isMobile) {
      console.log(`Mobile device detected, using ${context.appName} smart redirect for ${context.environment} environment`)
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
      appName: context.appName,
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
    appName: context.appName,
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
      appName: context.appName,
      environment: context.environment,
      host: context.requestHost,
      processingTime: `${processingTime}ms`,
    },
  })
}
