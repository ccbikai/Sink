<script setup>
import { useElementSize } from '@vueuse/core'
import { scaleSequentialSqrt } from 'd3-scale'
import { interpolateYlOrRd } from 'd3-scale-chromatic'
import Globe from 'globe.gl'
import { debounce } from 'lodash-es'
import { MeshPhongMaterial } from 'three'

const props = defineProps({
  minutes: {
    type: Number,
    default: 60,
  },
})

const time = inject('time')
const filters = inject('filters')

const countries = ref({})
const locations = ref([])

const el = useTemplateRef('globeEl')
const { width } = useElementSize(el)
const size = computed(() => ({
  width: width.value,
  height: width.value > 768 ? width.value * 0.6 : width.value,
}))

const globeEl = ref()
const hexAltitude = ref(0.001)
const highest = computed(() => {
  return locations.value.reduce((acc, curr) => Math.max(acc, curr.count), 0) || 1
})

let globe = null

async function getGlobeJSON() {
  const data = await $fetch('/countries.geojson')
  countries.value = data
}

async function getLiveLocations() {
  const { data } = await useAPI('/api/logs/locations', {
    query: {
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  locations.value = data?.map(e => ({
    lat: e.latitude,
    lng: e.longitude,
    count: Math.max(1, +e.count / highest.value),
  }))
}

function initGlobe() {
  const normalized = 5 / props.minutes
  const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([0, highest.value * normalized * 15])

  globe = new Globe(globeEl.value)
    .width(size.value.width)
    .height(size.value.height)
    // .globeOffset([width.value > 768 ? -100 : 0, width.value > 768 ? 0 : 100])
    .atmosphereColor('rgba(170, 170, 200, 1)')
    .globeMaterial(new MeshPhongMaterial({
      color: 'rgb(228, 228, 231)',
      transparent: false,
      opacity: 1,
    }))
    .backgroundColor('rgba(0,0,0,0)')
    .hexPolygonsData(countries.value.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.2)
    .hexBinResolution(3)
    .hexBinPointsData(locations.value)
    .hexPolygonAltitude(() => hexAltitude.value)
    .hexBinMerge(true)
    .hexBinPointWeight('count')
    .hexPolygonColor(() => `rgba(120, 140, 110, ${Math.random() / 2 + 0.5})`)
    .hexTopColor(d => weightColor(d.sumWeight))
    .hexSideColor(d => weightColor(d.sumWeight))
    .onGlobeReady(() => {
      globe.pointOfView({ lat: 20, lng: -36, altitude: width.value > 768 ? 2 : 3 })
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.2
    })

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
}

function stopRotation() {
  if (globe) {
    globe.controls().autoRotate = false
  }
}

const stopWatchQueryChange = watch([time, filters], getLiveLocations, {
  deep: true,
})

watch(width, () => {
  if (globe) {
    globe.width(size.value.width)
    globe.height(size.value.height)
  }
})

watch(locations, () => {
  if (globe) {
    globe.hexBinPointsData(locations.value)
  }
})

onMounted(async () => {
  await Promise.all([getGlobeJSON(), getLiveLocations()])
  initGlobe()
})

onBeforeUnmount(() => {
  stopWatchQueryChange()
})
</script>

<template>
  <div ref="globeEl" @mousedown="stopRotation" />
</template>
