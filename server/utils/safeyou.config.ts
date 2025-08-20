// export interface SafeYouConfig {
//   iosAppId: string
//   iosUrlScheme: string
//   iosUniversalLink: string
//   androidPackageName: string
//   androidAppName: string
//   androidUrlScheme: string
//   androidHost: string
//   webUrl: string
// }
//
// export const SAFEYOU_CONFIGS: Record<string, SafeYouConfig> = {
//   production: {
//     iosAppId: '1491665304',
//     iosUrlScheme: 'com.eif.safeyou',
//     iosUniversalLink: 'https://safeyou.page.link',
//     androidPackageName: 'fambox.pro',
//     androidAppName: 'Safe YOU',
//     androidUrlScheme: 'https',
//     androidHost: 'safeyou.page.link',
//     webUrl: 'https://safeyou.space',
//   },
//   staging: {
//     iosAppId: '1491665304',
//     iosUrlScheme: 'com.eif.safeyou.qa',
//     iosUniversalLink: 'https://safeyou.page.link',
//     androidPackageName: 'fambox.pro',
//     androidAppName: 'Safe YOU',
//     androidUrlScheme: 'https',
//     androidHost: 'safeyou.page.link',
//     webUrl: 'https://qa.safeyou.space',
//   },
//   development: {
//     iosAppId: '1491665304',
//     iosUrlScheme: 'com.eif.safeyou.dev',
//     iosUniversalLink: 'https://safeyou.page.link',
//     androidPackageName: 'fambox.pro',
//     androidAppName: 'Safe YOU',
//     androidUrlScheme: 'https',
//     androidHost: 'safeyou.page.link',
//     webUrl: 'https://dev.safeyou.space',
//   },
// }
//
// export function detectEnvironmentFromHost(host: string): string {
//   if (host.includes('dev.safeyou.space')) {
//     return 'development'
//   }
//   if (host.includes('qa.safeyou.space')) {
//     return 'staging'
//   }
//   if (host.includes('safeyou.space')) {
//     return 'production'
//   }
//
//   // Default fallback based on common development patterns
//   if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('.local')) {
//     return 'development'
//   }
//
//   return 'production'
// }
//
// export function getSafeYouConfig(environment: string): SafeYouConfig {
//   return SAFEYOU_CONFIGS[environment] || SAFEYOU_CONFIGS.production
// }
//
// export function getConfigForLink(link: any, requestHost: string): SafeYouConfig {
//   // If link has specific environment, use it
//   if (link.env && SAFEYOU_CONFIGS[link.env]) {
//     return SAFEYOU_CONFIGS[link.env]
//   }
//
//   // Otherwise detect from host
//   const detectedEnv = detectEnvironmentFromHost(requestHost)
//   return getSafeYouConfig(detectedEnv)
// }
//
// export function getEnvironmentBadge(host: string): string {
//   if (host.includes('dev.safeyou.space')) {
//     return 'DEV'
//   }
//   if (host.includes('qa.safeyou.space')) {
//     return 'QA'
//   }
//   if (host.includes('localhost') || host.includes('127.0.0.1')) {
//     return 'LOCAL'
//   }
//   return 'PROD'
// }
