export default defineAppConfig({
  title: 'Slink',
  telegram: 'https://t.me/AccessDeny_bot',
  description: '本页面为引导页面，请联系tgbot发送您需要缩短的链接。',
  image: 'https://sink.cool/banner.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
