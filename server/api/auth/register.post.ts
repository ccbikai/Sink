import { RegisterSchema } from '../../../schemas/user'
import { hashPassword } from '../../utils/auth'

defineRouteMeta({
  openAPI: {
    description: 'Register a new user',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
              username: {
                type: 'string',
                description: 'User username',
              },
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
  const userData = await readValidatedBody(event, RegisterSchema.parse)
  
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  
  // 检查邮箱是否已注册
  const existingUserId = await KV.get(`user:email:${userData.email.toLowerCase()}`)
  if (existingUserId) {
    throw createError({
      status: 409,
      statusText: 'Email already registered',
    })
  }
  
  // 检查用户名是否已存在
  const existingUsernameId = await KV.get(`user:username:${userData.username.toLowerCase()}`)
  if (existingUsernameId) {
    throw createError({
      status: 409,
      statusText: 'Username already taken',
    })
  }
  
  // 加密密码
  const hashedPassword = await hashPassword(userData.password)
  
  // 创建完整用户对象
  const user = {
    ...userData,
    password: hashedPassword,
    role: 'user',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
    isActive: true,
    id: crypto.randomUUID().substring(0, 20), // 生成一个简短的ID
  }
  
  // 存储用户数据
  await KV.put(`user:id:${user.id}`, JSON.stringify(user))
  await KV.put(`user:email:${userData.email.toLowerCase()}`, user.id)
  await KV.put(`user:username:${userData.username.toLowerCase()}`, user.id)
  
  return {
    success: true,
    message: 'User registered successfully',
    userId: user.id,
  }
})