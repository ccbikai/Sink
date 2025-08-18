import { getCookie, setCookie } from 'h3'

defineRouteMeta({
  openAPI: {
    description: 'Logout user and clear authentication token',
  },
})

export default eventHandler(async (event) => {
  // 清除cookie
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1,
    path: '/',
  })
  
  return {
    success: true,
    message: 'Logout successful',
  }
})