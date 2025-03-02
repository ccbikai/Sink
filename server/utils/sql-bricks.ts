import type SqlBricks from 'sql-bricks'
// @ts-expect-error use SqlBricks as a type
import MySqlBricks from 'mysql-bricks'

const Bricks = MySqlBricks as unknown as typeof SqlBricks

export { Bricks as SqlBricks }
