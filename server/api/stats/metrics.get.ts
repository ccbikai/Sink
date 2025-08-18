import type { H3Event } from 'h3'
import { QuerySchema } from '@@/schemas/query'
import { z } from 'zod'
import { getUserFromToken } from '../../utils/auth'
import { checkAdminAccess } from '../../utils/auth'
import { and, eq, or } from 'sql-bricks'

const { select } = SqlBricks

const MetricsQuerySchema = QuerySchema.extend({
  type: z.string(),
})

async function query2sql(query: z.infer<typeof MetricsQuerySchema>, event: H3Event): Promise<string> {
  let filter = query2filter(query)
  const { dataset } = useRuntimeConfig(event)

  try {
    // 尝试检查管理员权限
    const admin = await checkAdminAccess(event).catch(() => null)
    
    if (!admin) {
      // 非管理员，只能查看自己的链接数据
      const user = await getUserFromToken(event)
      
      // 获取用户的所有链接ID
      const { cloudflare } = event.context
      const { KV } = cloudflare.env
      const userLinksIndex = await KV.get(`user:${user.id}:links`, { type: 'json' }) || []
      
      if (Array.isArray(userLinksIndex) && userLinksIndex.length > 0) {
        // 获取所有链接对象以获取link.id
        const userLinks = []
        for (const slug of userLinksIndex) {
          try {
            const link = await KV.get(`link:${slug}`, { type: 'json' })
            if (link && link.id) {
              userLinks.push(link.id)
            }
          } catch (error) {
            console.error(`Error fetching link ${slug}:`, error)
          }
        }
        
        if (userLinks.length > 0) {
          // 添加用户链接ID过滤
          const linkFilter = or(userLinks.map(id => eq('index1', id)))
          // 使用安全的方式合并过滤器，不依赖length属性
          filter = Array.isArray(filter) && filter.length > 0 ? and(filter, linkFilter) : linkFilter
        } else {
          // 如果用户没有链接，返回空结果
          return select(`'' as name, 0 as count`).where('1=0').toString()
        }
      } else {
        // 如果没有索引或索引为空，返回空结果
        return select(`'' as name, 0 as count`).where('1=0').toString()
      }
    }

    // @ts-expect-error todo
    const sql = select(`${logsMap[query.type]} as name, SUM(_sample_interval) as count`).from(dataset).where(filter).groupBy('name').orderBy('count DESC').limit(query.limit)
    appendTimeFilter(sql, query)
    return sql.toString()
  } catch (error) {
    console.error('Error in query2sql:', error)
    throw error
  }
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, MetricsQuerySchema.parse)
  const sql = await query2sql(query, event)
  
  const result = await useWAE(event, sql) as { data: any[] }
  // 确保即使没有数据也返回一个包含0值的对象数组
  return result?.data && result.data.length > 0 ? result.data : [{ name: '', count: 0 }]
})
