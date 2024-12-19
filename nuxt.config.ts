// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxthub/core',
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],

  colorMode: {
    classSuffix: '',
  },

  routeRules: {
    '/': {
      prerender: true,
    },
    '/dashboard/**': {
      ssr: false,
    },
    '/dashboard': {
      redirect: '/dashboard/links',
    },
  },

  hub: {
    ai: true,
    analytics: true,
    blob: false,
    cache: false,
    database: false,
    kv: true,
  },

  eslint: {
    config: {
      stylistic: true,
      standalone: false,
    },
  },

  nitro: {
    experimental: {
      // Enable Server API documentation within NuxtHub
      openAPI: true,
    },
  },

  runtimeConfig: {
    siteToken: 'SinkCool',
    redirectStatusCode: '301',
    linkCacheTtl: 60,
    redirectWithQuery: false,
    homeURL: '',
    cfAccountId: '',
    cfApiToken: '',
    dataset: 'sink',
    aiModel: '@cf/meta/llama-3.1-8b-instruct',
    aiPrompt: `You are a URL shortening assistant, please shorten the URL provided by the user into a SLUG. The SLUG information must come from the URL itself, do not make any assumptions. A SLUG is human-readable and should not exceed three words and can be validated using regular expressions {slugRegex} . Only the best one is returned, the format must be JSON reference {"slug": "example-slug"}`,
    caseSensitive: false,
    public: {
      previewMode: '',
      slugDefaultLength: '6',
    },
  },

  compatibilityDate: '2024-07-08',
})
