import { getUserFromToken } from '../../utils/auth'

defineRouteMeta({
  openAPI: {
    description: 'Get all links created by the current user',
  },
})

export default eventHandler(async (event) => {
  // 获取当前登录用户
  const user = await getUserFromToken(event)
  
  const { cloudflare } = event.context
  const { KV } = cloudflare.env
  
  try {
    // 尝试使用索引获取用户链接（推荐的方法）
    const userLinksIndex = await KV.get(`user:${user.id}:links`, { type: 'json' })
    const links = []
    
    if (userLinksIndex && Array.isArray(userLinksIndex)) {
      // 如果有索引，使用索引获取链接
      for (const slug of userLinksIndex) {
        try {
          const link = await KV.get(`link:${slug}`, { type: 'json' })
          if (link) {
            links.push(link)
          }
        } catch (error) {
          console.error(`Error fetching link ${slug}:`, error)
        }
      }
    } else {
      // 没有索引时的备选方案：遍历所有链接并过滤属于当前用户的链接
      // 注意：这种方法效率较低，只在没有索引时使用
      console.warn(`No links index found for user ${user.id}, using fallback method`)
      
      try {
        // 列出所有链接键（最多1000个）
        const { keys } = await KV.list({
          prefix: 'link:',
          limit: 1000
        })
        
        if (Array.isArray(keys)) {
          // 收集用户的链接
          for (const key of keys) {
            try {
              const link = await KV.get(key.name, { type: 'json' })
              if (link && link.userId === user.id) {
                links.push(link)
              }
            } catch (error) {
              console.error(`Error checking link ${key.name}:`, error)
            }
          }
        }
      } catch (listError) {
        console.error('Error listing links:', listError)
      }
    }
    
    return {
      success: true,
      data: links,
      total: links.length,
    }
  } catch (error) {
    console.error('Error fetching user links:', error)
    return {
      success: false,
      message: 'Failed to fetch user links',
      data: [],
      total: 0
    }
  }
})