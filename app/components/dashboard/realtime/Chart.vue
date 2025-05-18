<script setup>
import NumberFlow from '@number-flow/vue'
import { MousePointerClick } from 'lucide-vue-next'

provide('id', ref())

const time = inject('time')
const filters = inject('filters')
const stats = ref({ visits: 0 })

async function getRealtimeStats() {
  const { data } = await useAPI('/api/stats/counters', {
    query: {
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })

  stats.value = data?.[0] || {}
}

watch([time, filters], getRealtimeStats, {
  deep: true,
})

onMounted(async () => {
  getRealtimeStats()
})
</script>

<template>
  <Card class="md:w-80 h-72 flex flex-col p-4 md:m-2">
    <div class="h-24">
      <CardHeader v-if="stats.visits" class="flex flex-row justify-between items-center pb-2 space-y-0 px-0 pt-2">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <span class="size-1.5 inline-flex animate-ping rounded-full bg-green-400 opacity-75" />
          {{ $t('dashboard.visits') }}
        </CardTitle>
        <MousePointerClick class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent class="px-0 pb-4">
        <NumberFlow class="text-2xl font-bold" :class="{ 'blur-md opacity-60': !stats.visits }" :value="stats.visits" />
      </CardContent>
    </div>
    <DashboardAnalysisViews
      class="w-full h-40 border-none !p-0"
      mode="simple"
      chart-type="bar"
    />
  </Card>
</template>
