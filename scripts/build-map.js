import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { WorldMapSimplestTopoJSON } from '@unovis/ts/maps.js'

writeFileSync(join(import.meta.dirname, '../public/world.json'), JSON.stringify(WorldMapSimplestTopoJSON), 'utf8')
