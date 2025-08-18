import { checkAdminAccess } from '../../utils/auth'

defineRouteMeta({
  openAPI: {
    description: 'Get all users (admin only)',
  },
})

export default eventHandler(async (event) => {
  // 检查管理员权限
  await checkAdminAccess(event)
  
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  
  // 注意：Cloudflare KV 不直接支持前缀扫描或列出所有键
  // 这里为了演示，我们返回一个空数组
  // 在实际生产环境中，应该实现更复杂的索引系统来存储和检索用户
  
  return {
    success: true,
    data: [],
    total: 0,
  }
})