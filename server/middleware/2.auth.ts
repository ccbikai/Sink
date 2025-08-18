import { verifyToken } from '../utils/auth'
import { eventHandler, getHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  // 跳过认证的路径
  if (event.path.startsWith('/api/_') || 
      event.path.startsWith('/api/auth/login') || 
      event.path.startsWith('/api/auth/register') ||
      event.path.startsWith('/api/verify')) {
    return
  }
  
  // 检查Authorization头
  const token = getHeader(event, 'Authorization')?.replace(/^Bearer\s+/, '')
  const runtimeConfig = useRuntimeConfig(event)
  
  // 检查是否需要认证
  if (event.path.startsWith('/api/')) {
    // 尝试JWT令牌认证
    if (token) {
      try {
        // 验证JWT令牌
        const user = await verifyToken(token)
        // 将用户信息添加到请求上下文中
        event.context.user = user
        return
      } catch (error) {
        // JWT验证失败，继续尝试siteToken验证
        if (token !== runtimeConfig.siteToken) {
          throw createError({
            status: 401,
            statusText: 'Unauthorized: Invalid token',
          })
        }
      }
    }
    
    // 使用原始的siteToken验证
    if (!token || token !== runtimeConfig.siteToken) {
      throw createError({
        status: 401,
        statusText: 'Unauthorized',
      })
    }
    
    if (token && token.length < 8) {
      throw createError({
        status: 401,
        statusText: 'Token is too short',
      })
    }
  }
})
