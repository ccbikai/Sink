export interface AppConfig {
  iosAppId?: string
  iosUrlScheme?: string
  iosUniversalLink?: string
  androidPackageName?: string
  androidAppName?: string
  androidUrlScheme?: string
  androidHost?: string
  webUrl: string
  name: string
  description?: string
  logo?: string
  displayName?: string
  themeColor?: string
}

export interface AppEnvironmentConfig {
  production: AppConfig
  staging?: AppConfig
  development?: AppConfig
}

export type MultiAppConfig = Record<string, AppEnvironmentConfig>

// Default fallback configuration
const DEFAULT_CONFIG: AppConfig = {
  webUrl: 'https://example.com',
  name: 'Default App',
  description: 'Default application configuration',
  themeColor: '#6b46c1',
}

export const APP_CONFIGS: MultiAppConfig = {
  safeyou: {
    production: {
      iosAppId: '1491665304',
      iosUrlScheme: 'com.eif.safeyou',
      iosUniversalLink: 'https://safeyou.page.link',
      androidPackageName: 'fambox.pro',
      androidAppName: 'Safe YOU',
      androidUrlScheme: 'https',
      androidHost: 'safeyou.page.link',
      webUrl: 'https://safeyou.space',
      name: 'Safe YOU',
      displayName: 'SafeYou',
      logo: 'SY',
      description: 'Safe YOU mobile application',
      themeColor: '#6b46c1',
    },
    staging: {
      iosAppId: '1491665304',
      iosUrlScheme: 'com.eif.safeyou.qa',
      iosUniversalLink: 'https://safeyou.page.link',
      androidPackageName: 'fambox.pro',
      androidAppName: 'Safe YOU',
      androidUrlScheme: 'https',
      androidHost: 'safeyou.page.link',
      webUrl: 'https://qa.safeyou.space',
      name: 'Safe YOU (Staging)',
      displayName: 'SafeYou',
      logo: 'SY',
      description: 'Safe YOU staging environment',
      themeColor: '#dc2626',
    },
    development: {
      iosAppId: '1491665304',
      iosUrlScheme: 'com.eif.safeyou.dev',
      iosUniversalLink: 'https://safeyou.page.link',
      androidPackageName: 'fambox.pro',
      androidAppName: 'Safe YOU',
      androidUrlScheme: 'https',
      androidHost: 'safeyou.page.link',
      webUrl: 'https://dev.safeyou.space',
      name: 'Safe YOU (Dev)',
      displayName: 'SafeYou',
      logo: 'SY',
      description: 'Safe YOU development environment',
      themeColor: '#059669',
    },
  },
  youtube: {
    production: {
      iosAppId: '544007664',
      iosUrlScheme: 'youtube',
      iosUniversalLink: 'https://www.youtube.com',
      androidPackageName: 'com.google.android.youtube',
      androidAppName: 'YouTube',
      androidUrlScheme: 'https',
      androidHost: 'www.youtube.com',
      webUrl: 'https://www.youtube.com',
      name: 'YouTube',
      displayName: 'YouTube',
      logo: '📺',
      description: 'YouTube video streaming application',
      themeColor: '#ff0000',
    },
  },
  facebook: {
    production: {
      iosAppId: '284882215',
      iosUrlScheme: 'fb',
      iosUniversalLink: 'https://www.facebook.com',
      androidPackageName: 'com.facebook.katana',
      androidAppName: 'Facebook',
      androidUrlScheme: 'https',
      androidHost: 'www.facebook.com',
      webUrl: 'https://www.facebook.com',
      name: 'Facebook',
      displayName: 'Facebook',
      logo: '📘',
      description: 'Facebook social media application',
      themeColor: '#1877f2',
    },
  },
  whatsapp: {
    production: {
      iosAppId: '310633997',
      iosUrlScheme: 'whatsapp',
      androidPackageName: 'com.whatsapp',
      androidAppName: 'WhatsApp',
      androidUrlScheme: 'whatsapp',
      webUrl: 'https://web.whatsapp.com',
      name: 'WhatsApp',
      displayName: 'WhatsApp',
      logo: '💬',
      description: 'WhatsApp messaging application',
      themeColor: '#25d366',
    },
  },
  spotify: {
    production: {
      iosAppId: '324684580',
      iosUrlScheme: 'spotify',
      androidPackageName: 'com.spotify.music',
      androidAppName: 'Spotify',
      androidUrlScheme: 'spotify',
      webUrl: 'https://open.spotify.com',
      name: 'Spotify',
      displayName: 'Spotify',
      logo: '🎵',
      description: 'Spotify music streaming application',
      themeColor: '#1db954',
    },
  },
}

export const HOST_TO_APP_MAP: Record<string, string> = {
  // SafeYou domains
  'safeyou.space': 'safeyou',
  'qa.safeyou.space': 'safeyou',
  'dev.safeyou.space': 'safeyou',
  'safeyou.page.link': 'safeyou',

  // Other app domains
  'web.whatsapp.com': 'whatsapp',
  'wa.me': 'whatsapp',
  'open.spotify.com': 'spotify',
  'spotify.link': 'spotify',
  'www.youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'm.youtube.com': 'youtube',

  // Localhost mappings - more flexible patterns
  'localhost': 'safeyou', // Will match any localhost
  '127.0.0.1': 'safeyou',
  'whatsapp.localhost': 'whatsapp',
  'spotify.localhost': 'spotify',
  'youtube.localhost': 'youtube',
}

// App-specific patterns for detecting if already inside the app
export const APP_DETECTION_PATTERNS: Record<string, RegExp[]> = {
  safeyou: [/SafeYou/i, /SafeYOU/i, /fambox/i],
  whatsapp: [/WhatsApp/i],
  spotify: [/Spotify/i],
  youtube: [/YouTube/i, /YoutubeMobile/i],
}

export function detectAppFromHost(host: string): string {
  console.log(`[APP_DETECTION] Analyzing host: ${host}`)
  const normalizedHost = host.toLowerCase()

  // Direct host mapping first
  for (const [hostPattern, appId] of Object.entries(HOST_TO_APP_MAP)) {
    if (normalizedHost === hostPattern.toLowerCase()
      || normalizedHost.includes(hostPattern.toLowerCase())) {
      console.log(`[APP_DETECTION] Direct match found: ${hostPattern} -> ${appId}`)
      return appId
    }
  }

  // Pattern-based detection
  if (normalizedHost.includes('whatsapp'))
    return 'whatsapp'
  if (normalizedHost.includes('spotify'))
    return 'spotify'
  if (normalizedHost.includes('youtube'))
    return 'youtube'
  if (normalizedHost.includes('facebook'))
    return 'facebook'

  // SafeYou detection (should be more specific)
  if (normalizedHost.includes('safeyou') || normalizedHost.includes('page.link')) {
    console.log(`[APP_DETECTION] SafeYou domain detected: ${host}`)
    return 'safeyou'
  }

  // Default to SafeYou for localhost and unknown domains
  console.log(`[APP_DETECTION] No specific app detected for host: ${host}, defaulting to safeyou`)
  return 'safeyou' // Changed back to 'safeyou' as default
}

export function detectAppFromUrl(url: string): string {
  if (!url)
    return 'safeyou' // Default fallback

  const normalizedUrl = url.toLowerCase()
  console.log(`[URL_DETECTION] Analyzing URL: ${normalizedUrl}`)

  // YouTube URL patterns (most specific first)
  if (normalizedUrl.includes('youtube.com/')
    || normalizedUrl.includes('youtu.be/')
    || normalizedUrl.includes('m.youtube.com/')) {
    console.log(`[URL_DETECTION] YouTube URL detected`)
    return 'youtube'
  }

  // Facebook URL patterns
  if (normalizedUrl.includes('facebook.com/')
    || normalizedUrl.includes('fb.me/')
    || normalizedUrl.includes('m.facebook.com/')) {
    console.log(`[URL_DETECTION] Facebook URL detected`)
    return 'facebook'
  }

  // WhatsApp URL patterns
  if (normalizedUrl.includes('wa.me/')
    || normalizedUrl.includes('api.whatsapp.com/')
    || normalizedUrl.includes('web.whatsapp.com/')
    || normalizedUrl.includes('chat.whatsapp.com/')) {
    console.log(`[URL_DETECTION] WhatsApp URL detected`)
    return 'whatsapp'
  }

  // Spotify URL patterns
  if (normalizedUrl.includes('open.spotify.com/')
    || normalizedUrl.includes('spotify.com/')) {
    console.log(`[URL_DETECTION] Spotify URL detected`)
    return 'spotify'
  }

  // SafeYou URL patterns
  if (normalizedUrl.includes('safeyou.space/')
    || normalizedUrl.includes('safeyou.page.link/')
    || normalizedUrl.includes('fambox.pro')) {
    console.log(`[URL_DETECTION] SafeYou URL detected`)
    return 'safeyou'
  }

  return 'safeyou' // Default fallback
}

export function getConfigForLink(link: any, requestHost: string): AppConfig {
  console.log(`[CONFIG] Getting config for link:`, {
    linkUrl: link?.url,
    requestHost,
    linkApp: link?.app,
  })

  // Priority 1: Explicit app in link
  if (link?.app && APP_CONFIGS[link.app]) {
    const environment = detectEnvironmentFromHost(requestHost, link.app)
    const config = getAppConfig(link.app, environment)
    console.log(`[CONFIG] Using explicit link app: ${link.app}`)
    return config
  }

  // Priority 2: Detect from target URL
  if (link?.url) {
    const appFromUrl = detectAppFromUrl(link.url)
    const environment = detectEnvironmentFromHost(requestHost, appFromUrl)
    const config = getAppConfig(appFromUrl, environment)
    console.log(`[CONFIG] Using URL-detected app: ${appFromUrl}`)
    return config
  }

  // Priority 3: Detect from host
  const appFromHost = detectAppFromHost(requestHost)
  const environment = detectEnvironmentFromHost(requestHost, appFromHost)
  const config = getAppConfig(appFromHost, environment)
  console.log(`[CONFIG] Using host-detected app: ${appFromHost}`)
  return config
}

// export function detectAppFromUrl(url: string): string | null {
//   if (!url) return null
//
//   const normalizedUrl = url.toLowerCase()
//
//   console.log(`[URL_DETECTION] Analyzing URL: ${normalizedUrl}`)
//
//   // WhatsApp URL patterns
//   if (normalizedUrl.includes('wa.me/') ||
//     normalizedUrl.includes('api.whatsapp.com/') ||
//     normalizedUrl.includes('web.whatsapp.com/') ||
//     normalizedUrl.includes('whatsapp://') ||
//     normalizedUrl.includes('chat.whatsapp.com/')) {
//     console.log(`[URL_DETECTION] WhatsApp URL detected`)
//     return 'whatsapp'
//   }
//
//   // Spotify URL patterns
//   if (normalizedUrl.includes('open.spotify.com/') ||
//     normalizedUrl.includes('spotify:') ||
//     normalizedUrl.includes('spotify.com/')) {
//     console.log(`[URL_DETECTION] Spotify URL detected`)
//     return 'spotify'
//   }
//
//   // YouTube URL patterns
//   if (normalizedUrl.includes('youtube.com/') ||
//     normalizedUrl.includes('youtu.be/') ||
//     normalizedUrl.includes('youtube://') ||
//     normalizedUrl.includes('m.youtube.com/')) {
//     console.log(`[URL_DETECTION] YouTube URL detected`)
//     return 'youtube'
//   }
//
//   // SafeYou URL patterns
//   if (normalizedUrl.includes('safeyou.space/') ||
//     normalizedUrl.includes('safeyou.page.link/') ||
//     normalizedUrl.includes('fambox.pro')) {
//     console.log(`[URL_DETECTION] SafeYou URL detected`)
//     return 'safeyou'
//   }
//
//   console.log(`[URL_DETECTION] No specific app detected from URL`)
//   return null
// }

// export function getAppFromQuery(query: Record<string, any>): string | undefined {
//   if (query.app && typeof query.app === 'string') {
//     const requestedApp = query.app.toLowerCase().trim()
//     if (APP_CONFIGS[requestedApp]) {
//       console.log(`[CONFIG] App override from query: ${requestedApp}`)
//       return requestedApp
//     }
//     console.warn(`[CONFIG] Invalid app requested in query: ${requestedApp}`)
//   }
//   return undefined
// }

export function detectEnvironmentFromHost(host: string, appId?: string): string {
  // App-specific environment detection
  if (appId === 'safeyou') {
    if (host.includes('dev.safeyou.space') || host.includes('development'))
      return 'development'
    if (host.includes('qa.safeyou.space') || host.includes('staging'))
      return 'staging'
    if (host.includes('safeyou.space'))
      return 'production'
  }

  // Generic patterns
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('.local')) {
    return 'development'
  }
  if (host.includes('staging') || host.includes('qa') || host.includes('test')) {
    return 'staging'
  }
  if (host.includes('dev') || host.includes('development')) {
    return 'development'
  }

  return 'production'
}

export function getAppConfig(appId: string, environment: string): AppConfig {
  console.log(`[CONFIG] Getting config for appId: ${appId}, environment: ${environment}`)

  const appConfig = APP_CONFIGS[appId]
  if (!appConfig) {
    console.warn(`App configuration not found for: ${appId}`)
    return { ...DEFAULT_CONFIG, name: `Unknown App (${appId})` }
  }

  const envConfig = appConfig[environment as keyof AppEnvironmentConfig]
  if (!envConfig) {
    console.warn(`Environment configuration not found for: ${appId}/${environment}, falling back to production`)
    return appConfig.production || DEFAULT_CONFIG
  }

  console.log(`[CONFIG] Found config:`, {
    name: envConfig.name,
    displayName: envConfig.displayName,
    iosAppId: envConfig.iosAppId,
    androidPackageName: envConfig.androidPackageName,
    themeColor: envConfig.themeColor,
  })

  return envConfig
}

export function getConfigForRequest(requestHost: string, linkAppId?: string): {
  config: AppConfig
  appId: string
  environment: string
} {
  // Use link's app ID if provided, otherwise detect from host
  const appId = linkAppId || detectAppFromHost(requestHost)
  const environment = detectEnvironmentFromHost(requestHost, appId)
  const config = getAppConfig(appId, environment)

  console.log(`[CONFIG] Request config:`, {
    requestHost,
    linkAppId: linkAppId || 'not provided',
    detectedAppId: appId,
    environment,
    configName: config.name,
  })

  return {
    config,
    appId,
    environment,
  }
}

export function getEnvironmentBadge(host: string, appId?: string): string {
  const environment = detectEnvironmentFromHost(host, appId)

  switch (environment) {
    case 'development':
      return host.includes('localhost') ? 'LOCAL' : 'DEV'
    case 'staging':
      return 'QA'
    default:
      return 'PROD'
  }
}

// export function getAppDetectionPatterns(appId: string): RegExp[] {
//   return APP_DETECTION_PATTERNS[appId] || []
// }
//
// export function getAllApps(): string[] {
//   return Object.keys(APP_CONFIGS)
// }

// export function getAppEnvironments(appId: string): string[] {
//   const appConfig = APP_CONFIGS[appId]
//   if (!appConfig) return []
//   return Object.keys(appConfig)
// }
//
// export function addAppConfig(appId: string, config: AppEnvironmentConfig): void {
//   APP_CONFIGS[appId] = config
// }
//
// export function addHostMapping(host: string, appId: string): void {
//   HOST_TO_APP_MAP[host] = appId
// }
//
// export function addAppDetectionPattern(appId: string, patterns: RegExp[]): void {
//   APP_DETECTION_PATTERNS[appId] = patterns
// }
// export function getSafeYouConfig(environment: string): AppConfig {
//   return getAppConfig('safeyou', environment)
// }
