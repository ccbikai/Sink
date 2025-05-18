import type { H3Event } from 'h3'
import { QuerySchema } from '@@/schemas/query'

const { select, and, notEq } = SqlBricks

function query2sql(query: Query, event: H3Event): string {
  const filter = query2filter(query)
  const { dataset } = useRuntimeConfig(event)
  const sql = select(`blob8 as ${blobsMap.blob8},double1 as ${doublesMap.double1},double2 as ${doublesMap.double2},count() as count`)
    .from(dataset)
    .where(and([notEq('double1', 0), notEq('double2', 0), filter]))
    .groupBy([blobsMap.blob8, doublesMap.double1, doublesMap.double2])
  appendTimeFilter(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const sql = query2sql(query, event)

  return useWAE(event, sql)
})
