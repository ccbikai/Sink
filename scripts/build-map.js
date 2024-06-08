import { writeFileSync } from 'fs'
import { join } from 'path'
import { WorldMapSimplestTopoJSON } from '@unovis/ts/maps.js'

writeFileSync(join(import.meta.dirname, '../public/world.json'), JSON.stringify(WorldMapSimplestTopoJSON), 'utf8')
