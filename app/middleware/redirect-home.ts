export default defineNuxtRouteMiddleware(() => {
  return navigateTo('https://fortunebox.com', { external: true })
})
