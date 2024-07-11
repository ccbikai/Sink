import type { H3Event } from 'h3'
import { parseURL } from 'ufo'
import { UAParser } from 'ua-parser-js'
import {
  CLIs,
  Crawlers,
  Emails,
  ExtraDevices,
  Fetchers,
  InApps,
  MediaPlayers,
  Modules,
} from 'ua-parser-js/extensions'
import { parseAcceptLanguage } from 'intl-parse-accept-language'
import { getFlag } from '@/utils/flag'

function toBlobNumber(blob: string) {
  return +blob.replace(/\D/g, '')
}

export const blobsMap = {
  blob1: 'slug',
  blob2: 'url',
  blob3: 'ua',
  blob4: 'ip',
  blob5: 'referer',
  blob6: 'country',
  blob7: 'region',
  blob8: 'city',
  blob9: 'timezone',
  blob10: 'language',
  blob11: 'os',
  blob12: 'browser',
  blob13: 'browserType',
  blob14: 'device',
  blob15: 'deviceType',
} as const

export type BlobsMap = typeof blobsMap
export type BlobsKey = keyof BlobsMap
export type LogsKey = BlobsMap[BlobsKey]
export type LogsMap = { [key in LogsKey]: string | undefined }

export const logsMap: LogsMap = Object.entries(blobsMap).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {}) as LogsMap

function logs2blobs(logs: LogsMap) {
  // @ts-expect-error todo
  return Object.keys(blobsMap).sort((a, b) => toBlobNumber(a) - toBlobNumber(b)).map(key => logs[blobsMap[key]] || '')
}

function blobs2logs(blobs: string[]) {
  const logsList = Object.keys(blobsMap)

  // @ts-expect-error todo
  return blobs.reduce((logs: LogsMap, blob, i) => {
    // @ts-expect-error todo
    logs[blobsMap[logsList[i]]] = blob
    return logs
  }, {})
}

export function useAccessLog(event: H3Event) {
  const ip = getHeader(event, 'x-real-ip') || getRequestIP(event, { xForwardedFor: true })

  const { host: referer } = parseURL(getHeader(event, 'referer'))

  const acceptLanguage = getHeader(event, 'accept-language') || ''
  const language = (parseAcceptLanguage(acceptLanguage) || [])[0]

  const userAgent = getHeader(event, 'user-agent') || ''
  const uaInfo = (new UAParser(userAgent, {
    browser: [Crawlers.browser || [], CLIs.browser || [], Emails.browser || [], Fetchers.browser || [], InApps.browser || [], MediaPlayers.browser || [], Modules.browser || []].flat(),
    device: [ExtraDevices.device || []].flat(),
  })).getResult()

  const { request: { cf } } = event.context.cloudflare
  const link = event.context.link || {}

  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const countryName = regionNames.of(cf?.country || 'WD') // fallback to "Worldwide"
  const accessLogs = {
    url: link.url,
    slug: link.slug,
    ua: userAgent,
    ip,
    referer,
    country: cf?.country,
    region: `${getFlag(cf?.country)} ${[cf?.region, countryName].filter(Boolean).join(',')}`,
    city: `${getFlag(cf?.country)} ${[cf?.city, countryName].filter(Boolean).join(',')}`,
    timezone: cf?.timezone,
    language,
    os: uaInfo?.os?.name,
    browser: uaInfo?.browser?.name,
    browserType: uaInfo?.browser?.type,
    device: uaInfo?.device?.model,
    deviceType: uaInfo?.device?.type,
  }

  if (process.env.NODE_ENV === 'production') {
    return hubAnalytics().put({
      indexes: [link.id], // only one index
      blobs: logs2blobs(accessLogs),
    })
  }
  else {
    console.log('access logs:', logs2blobs(accessLogs), blobs2logs(logs2blobs(accessLogs)))
    return Promise.resolve()
  }
}
