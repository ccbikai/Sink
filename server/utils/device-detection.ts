import { UAParser } from 'ua-parser-js'

export interface AppConfig {
  iosAppId?: string
  iosUrlScheme?: string
  iosUniversalLink?: string
  androidPackageName?: string
  androidAppName?: string
  androidUrlScheme?: string
  fallbackUrl?: string
}

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
}

const APP_CONFIGS = Object.freeze({
  whatsapp: {
    iosAppId: '310633997',
    iosUrlScheme: 'whatsapp',
    androidPackageName: 'com.whatsapp',
    androidAppName: 'WhatsApp',
    androidUrlScheme: 'whatsapp',
  },
  instagram: {
    iosAppId: '389801252',
    iosUrlScheme: 'instagram',
    androidPackageName: 'com.instagram.android',
    androidAppName: 'Instagram',
    androidUrlScheme: 'instagram',
  },
  facebook: {
    iosAppId: '284882215',
    iosUrlScheme: 'fb',
    androidPackageName: 'com.facebook.katana',
    androidAppName: 'Facebook',
    androidUrlScheme: 'fb',
  },
  messenger: {
    iosAppId: '454638411',
    iosUrlScheme: 'fb-messenger',
    androidPackageName: 'com.facebook.orca',
    androidAppName: 'Messenger',
    androidUrlScheme: 'fb-messenger',
  },
  linkedin: {
    iosAppId: '288429040',
    iosUrlScheme: 'linkedin',
    androidPackageName: 'com.linkedin.android',
    androidAppName: 'LinkedIn',
    androidUrlScheme: 'linkedin',
  },
  snapchat: {
    iosAppId: '447188370',
    iosUrlScheme: 'snapchat',
    androidPackageName: 'com.snapchat.android',
    androidAppName: 'Snapchat',
    androidUrlScheme: 'snapchat',
  },
  pinterest: {
    iosAppId: '429047995',
    iosUrlScheme: 'pinterest',
    androidPackageName: 'com.pinterest',
    androidAppName: 'Pinterest',
    androidUrlScheme: 'pinterest',
  },
} as const)

const URL_PATTERNS = Object.freeze({
  whatsapp: [/wa\.me/i, /whatsapp\.com/i, /api\.whatsapp\.com/i, /chat\.whatsapp\.com/i],
  instagram: [/instagram\.com/i, /instagr\.am/i],
  facebook: [/facebook\.com/i, /fb\.com/i, /m\.facebook\.com/i, /www\.facebook\.com/i],
  messenger: [/messenger\.com/i, /fbmessenger/i, /fb-messenger/i, /m\.me/i],
  twitter: [/twitter\.com/i, /t\.co/i],
  x: [/x\.com/i],
  tiktok: [/tiktok\.com/i, /vm\.tiktok\.com/i, /www\.tiktok\.com/i],
  youtube: [/youtube\.com/i, /youtu\.be/i, /m\.youtube\.com/i],
  linkedin: [/linkedin\.com/i, /lnkd\.in/i],
  snapchat: [/snapchat\.com/i, /snap\.com/i],
  pinterest: [/pinterest\.com/i, /pin\.it/i],
} as const)

const USER_AGENT_PATTERNS = Object.freeze({
  whatsapp: [/whatsapp/i, /wa\.me/i],
  instagram: [/instagram/i, /ig/i],
  facebook: [/facebook/i, /fb/i, /fban/i, /fbav/i],
  messenger: [/messenger/i, /fbmessenger/i],
  twitter: [/twitter/i],
  x: [/x\.com/i],
  tiktok: [/tiktok/i, /musically/i],
  youtube: [/youtube/i],
  linkedin: [/linkedin/i],
  snapchat: [/snapchat/i],
  pinterest: [/pinterest/i],
} as const)

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
] as const

const MOBILE_PATTERNS = /iPad|iPhone|iPod|Android|Mobile|Tablet/i
const IOS_PATTERNS = /iPad|iPhone|iPod/i
const ANDROID_PATTERNS = /Android/i

const uaCache = new Map<string, DeviceInfo>()
const MAX_CACHE_SIZE = 1000

function extractNestedUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const redirectParams = ['url', 'u', 'q', 'redirect', 'link', 'target', 'destination']

    for (const param of redirectParams) {
      const paramValue = urlObj.searchParams.get(param)
      if (paramValue) {
        try {
          const decodedUrl = decodeURIComponent(paramValue)
          if (decodedUrl.startsWith('http')) {
            return extractNestedUrl(decodedUrl)
          }
        }
        catch {
        }
      }
    }

    return url
  }
  catch {
    return url
  }
}

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

  uaCache.set(userAgent, deviceInfo)

  return deviceInfo
}

export function detectIfInTargetApp(userAgent: string, appPatterns?: RegExp[]): boolean {
  const defaultPatterns = [
    /MyAppName/i,
    /YourAppIdentifier/i,
    /WebView.*YourApp/i,
  ]

  const patterns = appPatterns || defaultPatterns
  return patterns.some(pattern => pattern.test(userAgent))
}

export function detectAppFromUserAgent(userAgent: string): AppConfig {
  const ua = userAgent.toLowerCase()

  for (const [appName, patterns] of Object.entries(USER_AGENT_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(ua))) {
      const config = APP_CONFIGS[appName as keyof typeof APP_CONFIGS]
      if (config) {
        return { ...config }
      }
    }
  }

  return {}
}

export function detectAppFromUrl(url: string): AppConfig {
  const actualUrl = extractNestedUrl(url)
  const urlLower = actualUrl.toLowerCase()

  for (const [appName, patterns] of Object.entries(URL_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(urlLower))) {
      const config = APP_CONFIGS[appName as keyof typeof APP_CONFIGS]
      if (config) {
        return { ...config }
      }
    }
  }

  return {}
}

export function detectApp(url: string, userAgent: string): AppConfig {
  // URL detection takes precedence over user agent detection
  const urlConfig = detectAppFromUrl(url)
  if (Object.keys(urlConfig).length > 0) {
    return urlConfig
  }

  return detectAppFromUserAgent(userAgent)
}

export function validateAppConfig(config: AppConfig): boolean {
  const hasIosConfig = Boolean(config.iosAppId && config.iosUrlScheme)
  const hasAndroidConfig = Boolean(config.androidPackageName && config.androidUrlScheme)

  return hasIosConfig || hasAndroidConfig
}

export function getAppDisplayName(config: AppConfig): string {
  return config.androidAppName || config.iosUrlScheme || 'App'
}

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
