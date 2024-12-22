export default defineAppConfig({
  title: 'Kugie',
  email: 'company@kugie.app',
  blog: 'https://kugie.app/blog',
  description: 'kugie.dev is Kugie\'s Link Shortener Service',
  image: 'https://kugie.app/og-image.png',
  github: 'https://github.com/ccbikai/sink',
  twitter: 'https://sink.cool/kai',
  telegram: 'https://sink.cool/telegram',
  mastodon: 'https://sink.cool/mastodon',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
