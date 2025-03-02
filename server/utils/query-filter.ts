import type { QuerySchema } from '@/schemas/query'
import type { SelectStatement } from 'sql-bricks'
import type { z } from 'zod'

const { in: $in, and, eq } = SqlBricks

export type Query = z.infer<typeof QuerySchema>

export function query2filter(query: Query) {
  const filter = []
  if (query.id)
    filter.push(eq('index1', query.id))

  Object.keys(logsMap).forEach((key) => {
    // @ts-expect-error todo
    if (query[key]) {
      // @ts-expect-error todo
      filter.push($in(logsMap[key], query[key].split(',')))
    }
  })
  return filter.length ? and(...filter) : []
}

export function appendTimeFilter(sql: SelectStatement, query: Query): unknown {
  if (query.startAt)
    sql.where(SqlBricks.gte('timestamp', SqlBricks(`toDateTime(${query.startAt})`)))

  if (query.endAt)
    sql.where(SqlBricks.lte('timestamp', SqlBricks(`toDateTime(${query.endAt})`)))

  return sql
}
