export default defineAppConfig({
  title: 'Sink',
  twitter: 'https://x.com/0xKaiBi',
  github: 'https://github.com/ccbikai/sink',
  email: 'sink.cool@miantiao.me',
  telegram: 'https://t.me/htmlzone',
  mastodon: 'https://c.im/@mt',
  blog: 'https://mt.ci',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: 'https://sink.cool/banner.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
