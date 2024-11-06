export default defineAppConfig({
  title: 'Kug.ie',
  email: 'company@kugie.app',
  blog: 'https://kugie.app/blog',
  description: 'Kug.ie is Kugie\'s Link Shortener Service',
  image: 'https://kugie.app/og-image.png',
  previewTTL: 24 * 3600, // 24h
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
