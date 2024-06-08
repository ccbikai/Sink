import { writeFileSync } from 'fs'
import { join } from 'path'
import { WorldMapSimplestTopoJSON } from '@unovis/ts/maps.js'
import WorldMapTopoJSON from '../assets/location/world.json' with { type: "json" } // https://github.com/apache/echarts/blob/master/test/data/map/json/world.json

WorldMapTopoJSON.objects.states.geometries.map((state) => {
  const name = state.properties.name
  const country = WorldMapSimplestTopoJSON.objects.countries.geometries.find(country => country.properties.name === name)
  state.id = state.name || ''
  if (country) {
    state.id = country.id || ''
    state.properties = {
      name: country.properties?.name || '',
    }
  }
  return state
})

writeFileSync(join(import.meta.dirname, '../assets/location/world-topo.json'), JSON.stringify(WorldMapTopoJSON), 'utf8')
