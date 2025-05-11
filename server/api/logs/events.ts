import type { H3Event } from 'h3'
import { QuerySchema } from '@@/schemas/query'

const { select } = SqlBricks

function query2sql(query: Query, event: H3Event): string {
  const filter = query2filter(query)
  const { dataset } = useRuntimeConfig(event)
  const sql = select(`*`).from(dataset).where(filter)
  appendTimeFilter(sql, query)
  return sql.toString()
}

interface WAEEvents {
  [key: string]: string
}

function events2logs(events: WAEEvents[]) {
  return events.map((event) => {
    const blobs = Array.from({ length: Object.keys(blobsMap).length }).fill(0).reduce((_, _c, i) => {
      _.push(event[`blob${i + 1}`])
      return _
    }, [])
    return {
      ...blobs2logs(blobs),
      id: event.index1,
      timestamp: event.timestamp,
      _sample_interval: event._sample_interval,
    }
  })
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const sql = query2sql(query, event)

  const logs = await useWAE(event, sql) as { data: WAEEvents[] }
  return events2logs(logs?.data || [])
})
