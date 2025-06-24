/* eslint-disable no-alert */

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  const isLoginPage = to.path === '/dashboard/login'
  const isDashboardRoute = to.path.startsWith('/dashboard')

  // httpswrd access
  if (isLoginPage) {
    const alreadyAuthed = localStorage.getItem('httpswrd-ok')

    if (!alreadyAuthed) {
      const username = prompt('Username:')
      const password = prompt('Password:')

      try {
        const res = await $fetch<{ success: boolean }>('/api/check-httpswrd', {
          method: 'POST',
          body: { username, password },
        })

        if (!res.success) {
          alert('Unauthorized')
          return navigateTo('/')
        }

        localStorage.setItem('httpswrd-ok', 'true')
      }
      catch {
        alert('Login error')
        return navigateTo('/')
      }
    }

    try {
      await useAPI('/api/verify')
      return navigateTo('/dashboard')
    }
    catch {
    }
  }

  if (isDashboardRoute && !isLoginPage) {
    const sinkToken = localStorage.getItem('SinkSiteToken')
    if (!sinkToken) {
      return navigateTo('/dashboard/login')
    }
  }
})
