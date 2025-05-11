<script setup>
import { scaleSequentialSqrt } from 'd3-scale'
import { interpolateYlOrRd } from 'd3-scale-chromatic'
import Globe from 'globe.gl'
import { debounce } from 'lodash-es'

const countries = ref({})

async function getWorldMapJSON() {
  const data = await $fetch('/countries.geojson')
  countries.value = data
}

const liveSessionLocations = computed(() => {
  const map = new Map()
  // data.forEach((item) => {
  //   if (!item.country)
  //     return
  //   if (!map.has(item.country))
  //     map.set(item.country, { lat: 37.75100, lon: -122.4194, count: 1 })

  //   map.get(item.country).count += 1
  // })

  return Array.from(map.values())
})

const highest = computed(() => {
  return liveSessionLocations.value.reduce((acc, curr) => Math.max(acc, curr.count), 0) || 1
})

const normalized = 5 / 5
const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([0, highest.value * normalized * 15])

const globeEl = ref()
const hexAltitude = ref(0.001)

onMounted(async () => {
  await getWorldMapJSON()
  const globe = new Globe(globeEl.value)
    .backgroundColor('rgba(0,0,0,0)')
    .hexPolygonsData(countries.value.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.2)
    .hexBinResolution(3)
    .hexBinPointsData(liveSessionLocations.value)
    .hexPolygonAltitude(() => hexAltitude.value)
    .hexBinMerge(true)
    .hexBinPointWeight('count')
    .hexPolygonColor(() => `rgba(120, 140, 110, ${Math.random() / 2 + 0.5})`)
    .hexTopColor(d => weightColor(d.sumWeight))
    .hexSideColor(d => weightColor(d.sumWeight))
    .onGlobeReady(() => {
      globe.pointOfView({ lat: 20, lng: -36, altitude: 2 })
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.2
    })

  // 监听缩放，动态调整 hexAltitude
  globe.controls().addEventListener('end', debounce(() => {
    const distance = Math.round(globe.controls().getDistance())
    let nextAlt = 0.005
    if (distance <= 300)
      nextAlt = 0.001
    else if (distance >= 600)
      nextAlt = 0.02
    if (nextAlt !== hexAltitude.value)
      hexAltitude.value = nextAlt
  }, 200))
})
</script>

<template>
  <div ref="globeEl" style="width: 100%; height: 600px;" />
</template>
