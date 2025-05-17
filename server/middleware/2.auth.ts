import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { eventHandler, getHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  if (event.path.startsWith('/api/') && !event.path.startsWith('/api/_')) {
    const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        status: 401,
        statusText: 'Unauthorized',
      })
    }

    try {
      const config = useRuntimeConfig(event)
      
      // Проверяем наличие конфигурации
      if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
        throw createError({
          status: 500,
          statusText: 'Firebase Admin configuration is missing',
        })
      }

      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey: config.firebasePrivateKey,
          }),
        })
      }

      const auth = getAuth()
      await auth.verifyIdToken(token)
    }
    catch (e) {
      console.error('Auth error:', e)
      throw createError({
        status: 401,
        statusText: 'Invalid token',
      })
    }
  }
})
