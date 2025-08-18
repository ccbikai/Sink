export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  // 检查是否为仪表板页面但不是登录或注册页面
  if (to.path.startsWith('/dashboard') && 
      to.path !== '/dashboard/login' && 
      to.path !== '/dashboard/register') {
    // 检查是否有用户信息
    const user = window.localStorage.getItem('SinkUser')
    if (!user) {
      return navigateTo('/dashboard/login')
    }
  }

  // 如果是登录或注册页面，但已有用户信息，则重定向到仪表板
  if ((to.path === '/dashboard/login' || to.path === '/dashboard/register')) {
    try {
      const user = window.localStorage.getItem('SinkUser')
      if (user) {
        // 尝试验证用户会话是否有效
        // 在实际应用中，这里可能需要调用验证API
        return navigateTo('/dashboard')
      }
    }
    catch (e) {
      console.warn(e)
    }
  }
})
