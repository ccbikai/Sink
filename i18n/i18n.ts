import type { LocaleObject } from '@nuxtjs/i18n'

const locales: LocaleObject[] = [
  {
    code: 'zh-CN',
    file: 'zh-CN.json',
    name: '简体中文',
    emoji: '🇨🇳',
  },
  {
    code: 'en-US',
    file: 'en-US.json',
    name: 'English',
    emoji: '🇺🇸',
  },
]

function buildLocales() {
  const useLocales = Object.values(locales).reduce((acc, data) => {
    acc.push(data)

    return acc
  }, <LocaleObject[]>[])

  return useLocales.sort((a, b) => a.code.localeCompare(b.code))
}

export const currentLocales = buildLocales()
