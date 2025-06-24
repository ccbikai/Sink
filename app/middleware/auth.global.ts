/* eslint-disable no-alert */

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  // httpswrd auth //TODO MOVE TO ENV
  if (to.path === '/dashboard/login') {
    const alreadyAuthed = localStorage.getItem('httpswrd-ok')

    if (!alreadyAuthed) {
      const username = prompt('Username:')
      const password = prompt('Password:')

      if (username !== 'fortune' || password !== 'ynRrICAahmsU0iUvzGNp') {
        alert('Unauthorized')
        return navigateTo('/')
      }

      localStorage.setItem('httpswrd-ok', 'true')
    }

    try {
      await useAPI('/api/verify')
      return navigateTo('/dashboard')
    }
    catch (e) {
      console.warn(e)
    }
  }

  if (to.path.startsWith('/dashboard') && to.path !== '/dashboard/login') {
    if (!window.localStorage.getItem('SinkSiteToken')) {
      return navigateTo('/dashboard/login')
    }
  }
})
