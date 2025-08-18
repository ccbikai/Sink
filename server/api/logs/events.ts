import type { H3Event } from 'h3'
import { QuerySchema } from '@@/schemas/query'
import { date2unix } from '~/utils/time'
import { getUserFromToken } from '../../utils/auth'
import { checkAdminAccess } from '../../utils/auth'
import { and, eq, or } from 'sql-bricks'

const { select } = SqlBricks

async function query2sql(query: Query, event: H3Event): Promise<string> {
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
          return select(`*`).from(dataset).where('1=0').orderBy('timestamp DESC').toString()
        }
      } else {
        // 如果没有索引或索引为空，返回空结果
        return select(`*`).from(dataset).where('1=0').orderBy('timestamp DESC').toString()
      }
    }
  
  const sql = select(`*`).from(dataset).where(filter).orderBy('timestamp DESC')
  appendTimeFilter(sql, query)
  return sql.toString()
  } catch (error) {
    console.error('Error in query2sql:', error)
    throw error
  }
}

interface WAEEvents {
  [key: string]: string
}

function events2logs(events: WAEEvents[]) {
  return events.map((event) => {
    const blobs = Array.from({ length: Object.keys(blobsMap).length }).fill(0).reduce<string[]>((_, _c, i) => {
      _.push(event[`blob${i + 1}`])
      return _
    }, [])
    const doubles = Array.from({ length: Object.keys(doublesMap).length }).fill(0).reduce<number[]>((_, _c, i) => {
      _.push(+event[`double${i + 1}`])
      return _
    }, [])
    return {
      ...blobs2logs(blobs),
      ...doubles2logs(doubles),
      ip: undefined,
      id: crypto.randomUUID(),
      timestamp: date2unix(new Date(`${event.timestamp}Z`)),
    }
  })
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const sql = await query2sql(query, event)

  const logs = await useWAE(event, sql) as { data: WAEEvents[] }
  // 确保即使没有数据也返回一个包含0值的对象，而不是空数组
  const result = events2logs(logs?.data || [])
  // 如果结果为空数组，返回一个包含默认值的数组
  return result.length > 0 ? result : [{
    ip: '',
    id: '',
    timestamp: 0,
    url: '',
    slug: '',
    referer: '',
    userAgent: '',
    device: '',
    os: '',
    browser: '',
    country: '',
    region: '',
    city: '',
    language: '',
    isBot: false
  }]
})
