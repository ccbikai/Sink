export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    window.location.href = 'https://fortunebox.com'
  }
})
