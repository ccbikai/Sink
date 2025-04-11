import type { H3Event } from 'h3'
import { QuerySchema } from '@@/schemas/query'

const { select } = SqlBricks

function query2sql(query: Query, event: H3Event): string {
  const filter = query2filter(query)
  const { dataset } = useRuntimeConfig(event)
  // visitors did not consider sampling
  const sql = select(`SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors, COUNT(DISTINCT ${logsMap.referer}) as referers`).from(dataset).where(filter)
  appendTimeFilter(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const sql = query2sql(query, event)
  return useWAE(event, sql)
})
