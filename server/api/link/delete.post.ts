import { getUserFromToken } from '../../utils/auth'
import { eventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  // 获取当前登录用户
  const user = await getUserFromToken(event)
  
  const { previewMode } = useRuntimeConfig(event).public
  if (previewMode) {
    throw createError({
      status: 403,
      statusText: 'Preview mode cannot delete links.',
    })
  }
  const { slug } = await readBody(event)
  if (slug) {
    const { cloudflare } = event.context
    const { KV } = cloudflare.env
    
    // 检查链接是否属于当前用户
    const link = await KV.get(`link:${slug}`, { type: 'json' })
    if (!link || link.userId !== user.id) {
      throw createError({
        status: 403,
        statusText: 'You are not authorized to delete this link.',
      })
    }
    
    // 删除链接
    await KV.delete(`link:${slug}`)
    
    // 从用户链接索引中移除
    try {
      const userLinksIndex = await KV.get(`user:${user.id}:links`, { type: 'json' }) || []
      if (Array.isArray(userLinksIndex)) {
        const updatedLinksIndex = userLinksIndex.filter(s => s !== slug)
        await KV.put(`user:${user.id}:links`, JSON.stringify(updatedLinksIndex))
      }
    } catch (error) {
      console.error('Failed to update user links index after deletion:', error)
    }
  }
})
