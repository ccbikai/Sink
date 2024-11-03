export default defineAppConfig({
  title: 'Sink',
  email: 'sink.cool@miantiao.me',
  twitter: 'https://sink.cool/kai',
  github: 'https://sink.cool/github',
  telegram: 'https://sink.cool/telegram',
  mastodon: 'https://sink.cool/mastodon',
  blog: 'https://sink.cool/blog',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: 'https://sink.cool/banner.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
