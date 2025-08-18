import { getUserFromToken } from '../utils/auth'
import { eventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

defineRouteMeta({
  openAPI: {
    description: 'Verify the user authentication status',
    responses: {
      200: {
        description: 'User is authenticated',
      },
      401: {
        description: 'User is not authenticated',
      },
    },
  },
})

export default eventHandler(async (event) => {
  try {
    // 尝试从token中获取用户信息
    const user = await getUserFromToken(event)
    
    // 获取配置的URL
    const { homeURL } = useRuntimeConfig()
    
    return {
      success: true,
      name: 'Sink',
      url: homeURL || 'https://sink.cool', // 使用配置的URL，如果没有则使用默认值
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error) {
    // 如果是H3错误，直接抛出
    if (error instanceof Error && 'status' in error && error.status === 401) {
      throw error;
    }
    
    // 其他错误转为401未授权错误
    throw createError({
      status: 401,
      statusText: 'User is not authenticated',
      message: error instanceof Error ? error.message : 'Authentication failed',
    })
  }
})
