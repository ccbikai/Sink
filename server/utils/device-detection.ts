import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  isInAppBrowser: boolean
  isBot: boolean
  isInApp: boolean
  browserName: string
  osName: string
  osVersion?: string
  deviceModel?: string
}

export interface SmartLinkOptions extends AppConfig {
  slug: string
  target: string
  environment?: string
  appName?: string
}

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /crawling/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /googlebot/i,
  /bingbot/i,
  /slackbot/i,
  /discordbot/i,
  /skypebot/i,
] as const

const IN_APP_PATTERNS = [
  /FBAN/i,
  /FBAV/i,
  /Instagram/i,
  /Line/i,
  /KAKAOTALK/i,
  /Twitter/i,
  /Pinterest/i,
  /Snapchat/i,
  /TikTok/i,
  /WhatsApp/i,
  /LinkedIn/i,
  /Messenger/i,
  /WeChat/i,
  /Telegram/i,
  /Discord/i,
  /Slack/i,
  /SafeYOU/i,
  /YouTube/i,
  /Facebook/i,
] as const

const MOBILE_PATTERNS = /iPad|iPhone|iPod|Android|Mobile|Tablet/i
const IOS_PATTERNS = /iPad|iPhone|iPod/i
const ANDROID_PATTERNS = /Android/i

const uaCache = new Map<string, DeviceInfo>()
const MAX_CACHE_SIZE = 1000

export function parseUserAgent(userAgent: string): DeviceInfo {
  if (uaCache.has(userAgent)) {
    return uaCache.get(userAgent)!
  }

  if (uaCache.size >= MAX_CACHE_SIZE) {
    uaCache.clear()
  }

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent))
  const isIOS = IOS_PATTERNS.test(userAgent)
  const isAndroid = ANDROID_PATTERNS.test(userAgent)
  const isMobile = isIOS || isAndroid || MOBILE_PATTERNS.test(userAgent)
  const isInAppBrowser = IN_APP_PATTERNS.some(pattern => pattern.test(userAgent))
  const isInApp = detectIfInTargetApp(userAgent)

  const deviceInfo: DeviceInfo = {
    isIOS,
    isAndroid,
    isMobile,
    isInAppBrowser,
    isBot,
    isInApp,
    browserName: result.browser.name || 'Unknown',
    osName: result.os.name || 'Unknown',
    osVersion: result.os.version,
    deviceModel: result.device.model,
  }

  // Enhanced logging for debugging deep linking
  if (process.env.NODE_ENV === 'development') {
    console.log('Device analysis:', {
      userAgent: `${userAgent.substring(0, 100)}...`,
      parsed: {
        isIOS,
        isAndroid,
        isMobile,
        isInAppBrowser,
        isInApp,
        isBot,
      },
      capabilities: {
        canDeepLink: isMobile && !isBot && !isInAppBrowser,
        supportsUniversalLinks: isIOS && !isInAppBrowser,
        supportsAppLinks: isAndroid && !isInAppBrowser,
        supportsCustomSchemes: isMobile && !isBot,
      },
      details: {
        browserName: deviceInfo.browserName,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.deviceModel,
      },
    })
  }

  uaCache.set(userAgent, deviceInfo)
  return deviceInfo
}

// Restored utility functions for analytics
export function getDeviceCapabilities(device: DeviceInfo) {
  const supportsAppLinks = device.isAndroid && !device.isInAppBrowser
  const supportsUniversalLinks = device.isIOS && !device.isInAppBrowser
  const supportsCustomSchemes = device.isMobile && !device.isBot

  const recommendedStrategy: 'app' | 'browser' = device.isMobile && !device.isBot ? 'app' : 'browser'

  return {
    supportsAppLinks,
    supportsUniversalLinks,
    supportsCustomSchemes,
    recommendedStrategy,
  } as const
}

export function validateAppConfig(config: AppConfig): boolean {
  const hasIosConfig = Boolean(config.iosAppId && config.iosUrlScheme)
  const hasAndroidConfig = Boolean(config.androidPackageName && config.androidUrlScheme)
  const hasWebConfig = Boolean(config.webUrl)
  return hasIosConfig || hasAndroidConfig || hasWebConfig
}

export function detectIfInTargetApp(userAgent: string, appPatterns?: RegExp[]): boolean {
  const defaultPatterns = [
    /SafeYou/i,
    /SafeYOU/i,
    /fambox/i,
    /YouTube/i,
    /Facebook/i,
    /FBAV/i,
    /FBAN/i,
    /WhatsApp/i,
    /Spotify/i,
  ]

  const patterns = appPatterns || defaultPatterns
  const detected = patterns.some(pattern => pattern.test(userAgent))

  if (detected) {
    console.log('Target app detected in user agent:', userAgent.substring(0, 100))
  }

  return detected
}

// export function getDeviceCapabilities(device: DeviceInfo) {
//   const supportsAppLinks = device.isAndroid && !device.isInAppBrowser
//   const supportsUniversalLinks = device.isIOS && !device.isInAppBrowser
//   const supportsCustomSchemes = device.isMobile && !device.isBot
//
//   const recommendedStrategy: 'app' | 'browser' = device.isMobile && !device.isBot ? 'app' : 'browser'
//
//   return {
//     supportsAppLinks,
//     supportsUniversalLinks,
//     supportsCustomSchemes,
//     recommendedStrategy,
//   } as const
// }
//
// export function validateAppConfig(config: AppConfig): boolean {
//   const hasIosConfig = Boolean(config.iosAppId && config.iosUrlScheme)
//   const hasAndroidConfig = Boolean(config.androidPackageName && config.androidUrlScheme)
//   const hasWebConfig = Boolean(config.webUrl)
//   return hasIosConfig || hasAndroidConfig || hasWebConfig
// }
