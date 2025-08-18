import type { H3Event } from 'h3'
import { createError, getCookie, setCookie } from 'h3'
import { createHash } from 'crypto'
import { UserSchema } from '../../schemas/user'

// JWT相关配置
import { useRuntimeConfig } from '#imports'
const JWT_SECRET = useRuntimeConfig().jwtSecret || 'default-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // 7天有效期

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  const hash = createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

// 验证密码
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const hash = createHash('sha256')
  hash.update(plainPassword)
  return hash.digest('hex') === hashedPassword
}

// 生成JWT令牌 (简化版实现，实际项目中应使用更安全的JWT库)
export async function generateToken(userId: string, role: string): Promise<string> {
  const payload = {
    id: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7天
  }
  
  // 这里使用简化的JWT实现，实际项目中应使用如jsonwebtoken库
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHash('sha256')
    .update(encodedPayload + JWT_SECRET)
    .digest('base64url')
  
  return `${encodedPayload}.${signature}`
}

// 验证JWT令牌
export async function verifyToken(token: string): Promise<{ id: string; role: string }> {
  try {
    const [encodedPayload, signature] = token.split('.')
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    
    // 验证签名
    const expectedSignature = createHash('sha256')
      .update(encodedPayload + JWT_SECRET)
      .digest('base64url')
    
    if (signature !== expectedSignature || payload.exp < Date.now() / 1000) {
      throw new Error('Invalid token')
    }
    
    return { id: payload.id, role: payload.role }
  } catch (error) {
    throw createError({
      status: 401,
      statusText: 'Invalid or expired token',
    })
  }
}

// 从请求中获取当前用户
export async function getUserFromToken(event: H3Event) {
  const token = getCookie(event, 'auth_token') || 
                getHeader(event, 'Authorization')?.replace(/^Bearer\s+/, '')
  
  if (!token) {
    throw createError({
      status: 401,
      statusText: 'Authentication token is required',
    })
  }
  
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  const { id } = await verifyToken(token)
  
  const userData = await KV.get(`user:id:${id}`, { type: 'json' })
  if (!userData) {
    throw createError({
      status: 401,
      statusText: 'User not found',
    })
  }
  
  return UserSchema.parse(userData)
}

// 检查用户是否为管理员
export async function checkAdminAccess(event: H3Event) {
  const user = await getUserFromToken(event)
  if (user.role !== 'admin') {
    throw createError({
      status: 403,
      statusText: 'Admin access required',
    })
  }
  return user
}