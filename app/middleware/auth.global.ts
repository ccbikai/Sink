import { useAuth } from '@vueuse/firebase'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  const { $auth } = useNuxtApp()
  if (!$auth) return

  // Ждем восстановления сессии Firebase
  await new Promise<void>((resolve) => {
    const unsub = $auth.onAuthStateChanged(() => {
      unsub()
      resolve()
    })
  })

  const authState = useAuth($auth)
  if (!authState) return

  if (to.path.startsWith('/dashboard') && to.path !== '/dashboard/login') {
    if (!authState.isAuthenticated.value)
      return navigateTo('/dashboard/login')
  }

  if (to.path === '/dashboard/login') {
    if (authState.isAuthenticated.value)
      return navigateTo('/dashboard')
  }
})
