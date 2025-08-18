import { LoginSchema } from '../../../schemas/user'
import { verifyPassword, generateToken } from '../../utils/auth'
import { setCookie } from 'h3'

defineRouteMeta({
  openAPI: {
    description: 'Login user and get authentication token',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
                description: 'User email',
              },
              password: {
                type: 'string',
                description: 'User password',
              },
            },
          },
        },
      },
    },
  },
})

export default eventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, LoginSchema.parse)
  
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  
  // 查找用户ID
  const userId = await KV.get(`user:email:${email.toLowerCase()}`)
  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Invalid email or password',
    })
  }
  
  // 获取用户数据
  const userData = await KV.get(`user:id:${userId}`, { type: 'json' })
  if (!userData || !userData.isActive) {
    throw createError({
      status: 401,
      statusText: 'Invalid email or password',
    })
  }
  
  // 验证密码
  const passwordMatch = await verifyPassword(password, userData.password)
  if (!passwordMatch) {
    throw createError({
      status: 401,
      statusText: 'Invalid email or password',
    })
  }
  
  // 生成JWT令牌
  const token = await generateToken(userData.id, userData.role)
  
  // 设置cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7天
    path: '/',
  })
  
  return {
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
    },
  }
})