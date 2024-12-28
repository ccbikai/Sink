export default defineAppConfig({
  title: '8oo Short',
  email: '',
  github: 'https://github.com/didingqd/Sink',
  twitter: '',
  telegram: '',
  mastodon: '',
  blog: '',
  description: 'Url Short',
  image: 'https://sink.cool/banner.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
