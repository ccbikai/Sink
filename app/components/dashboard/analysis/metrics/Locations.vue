<script setup>
import { VisSingleContainer, VisTopoJSONMap, VisTopoJSONMapSelectors } from '@unovis/vue'
import { ChartTooltip } from '@/components/ui/chart'

const id = inject('id')
const time = inject('time')
const filters = inject('filters')

const worldMapTopoJSON = ref({})
const areaData = ref([])

async function getWorldMapJSON() {
  const data = await $fetch('/world.json')
  worldMapTopoJSON.value = data
}

async function getMapData() {
  areaData.value = []
  const { data } = await useAPI('/api/stats/metrics', {
    query: {
      type: 'country',
      id: id.value,
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  if (Array.isArray(data)) {
    areaData.value = data.map((country) => {
      country.id = country.name
      return country
    })
  }
}

watch([time, filters], getMapData, {
  deep: true,
})

onMounted(() => {
  getWorldMapJSON()
  getMapData()
})

const valueFormatter = v => v
const Tooltip = {
  props: ['title', 'data'],
  setup(props) {
    const title = props.data[1]?.value?.name
    const data = [{
      name: props.title,
      value: props.data[3]?.value?.count,
      color: 'black',
    }]
    return () => h(ChartTooltip, { title, data })
  },
}
</script>

<template>
  <Card class="flex flex-col md:h-[500px]">
    <CardHeader>
      <CardTitle>{{ $t('dashboard.locations') }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-1 flex [&_[data-radix-aspect-ratio-wrapper]]:flex-1">
      <AspectRatio :ratio="65 / 30">
        <VisSingleContainer
          v-if="worldMapTopoJSON.type"
          :data="{ areas: areaData }"
          class="h-full"
        >
          <VisTopoJSONMap
            :topojson="worldMapTopoJSON"
            map-feature-name="countries"
          />
          <ChartSingleTooltip
            index="id"
            :selector="VisTopoJSONMapSelectors.feature"
            :items="areaData"
            :value-formatter="valueFormatter"
            :custom-tooltip="Tooltip"
          />
        </VisSingleContainer>
      </AspectRatio>
    </CardContent>
  </Card>
</template>
