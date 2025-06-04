export default defineAppConfig({
  title: 'Flyto.My',
  email: 'noreply@gmail.com',
  github: 'https://flyto.my/github',
  twitter: 'https://flyto.my/twitter',
  telegram: 'https://flyto.my/telegram',
  mastodon: 'https://flyto.my/mastodon',
  blog: 'https://flyto.my/blog',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: 'https://flyto.my/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
