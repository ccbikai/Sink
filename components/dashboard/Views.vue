<script setup>
import { AreaChart } from '@/components/ui/chart-area'
import { BarChart } from '@/components/ui/chart-bar'

const views = ref([])
const chart = computed(() => views.value.length > 1 ? AreaChart : BarChart)

const id = inject('id')
const time = inject('time')
const filters = inject('filters')

const OneDay = 24 * 60 * 60 // 1 day in seconds
function getUnit(startAt, endAt) {
  if (startAt && endAt && endAt - startAt <= OneDay)
    return 'hour'

  return 'day'
}

async function getLinkViews() {
  views.value = []
  const { data } = await useAPI('/api/stats/views', {
    query: {
      id: id.value,
      unit: getUnit(time.value.startAt, time.value.endAt),
      clientTimezone: getTimeZone(),
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  views.value = (data || []).map((item) => {
    item.visitors = +item.visitors
    item.visits = +item.visits
    return item
  })
}

const stopWatchQueryChange = watch([time, filters], getLinkViews, {
  deep: true,
})

onMounted(async () => {
  getLinkViews()
})

onBeforeUnmount(() => {
  stopWatchQueryChange()
})

function formatTime(tick) {
  if (Number.isInteger(tick) && views.value[tick]) {
    if (getUnit(time.value.startAt, time.value.endAt) === 'hour')
      return views.value[tick].time.split(' ')[1] || ''

    return views.value[tick].time
  }
  return ''
}
</script>

<template>
  <Card class="px-0 py-6 md:px-6">
    <CardTitle class="px-6 md:px-0">
      Views
    </CardTitle>
    <component
      :is="chart"
      :data="views"
      index="time"
      :categories="['visitors', 'visits']"
      :x-formatter="formatTime"
      :y-formatter="formatNumber"
    />
  </Card>
</template>
