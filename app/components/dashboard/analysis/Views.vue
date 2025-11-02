<script setup>
import { AreaChart } from '@/components/ui/chart-area'
import { BarChart } from '@/components/ui/chart-bar'

const props = defineProps({
  mode: {
    type: String,
    default: 'full',
  },
  chartType: {
    type: String,
    default: 'area',
  },
})

const views = ref([])
const chart = computed(() => (props.chartType === 'area' && views.value.length > 1) ? AreaChart : BarChart)

const id = inject('id')
const time = inject('time')
const filters = inject('filters')

const OneHour = 60 * 60 // 1 hour in seconds
const OneDay = 24 * 60 * 60 // 1 day in seconds
function getUnit(startAt, endAt) {
  if (startAt && endAt && endAt - startAt <= OneHour)
    return 'minute'

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

watch([time, filters], getLinkViews, {
  deep: true,
})

onMounted(async () => {
  getLinkViews()
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
  <Card
    class="
      px-0 py-6
      md:px-6
    "
  >
    <CardTitle
      v-if="mode === 'full'" class="
        px-6
        md:px-0
      "
    >
      {{ $t('dashboard.views') }}
    </CardTitle>
    <component
      :is="chart"
      class="h-full w-full"
      index="time"
      :data="views"
      :categories="mode === 'full' ? ['visits', 'visitors'] : ['visits']"
      :x-formatter="formatTime"
      :y-formatter="formatNumber"
      :show-grid-line="mode === 'full'"
      :show-legend="mode === 'full'"
    />
  </Card>
</template>
