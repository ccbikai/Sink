import { defu } from 'defu'
import { toast } from 'vue-sonner'
import { useAuth } from '@vueuse/firebase'

export async function useAPI(api: string, options?: object): Promise<unknown> {
  const { $auth } = useNuxtApp()
  if (!$auth) return Promise.reject(new Error('Firebase not initialized'))

  const { user, isAuthenticated } = useAuth($auth)
  if (!user || !isAuthenticated) return Promise.reject(new Error('Auth state not ready'))
  if (!isAuthenticated.value || !user.value) {
    return Promise.reject(new Error('Not authenticated'))
  }

  // Получаем настоящий ID Token
  const idToken = await user.value.getIdToken()

  return $fetch(api, defu(options || {}, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })).catch((error) => {
    if (error?.status === 401) {
      navigateTo('/dashboard/login')
    }
    if (error?.data?.statusMessage) {
      toast(error?.data?.statusMessage)
    }
    return Promise.reject(error)
  })
}
