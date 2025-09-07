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
  <Card
    class="
      flex h-72 flex-col gap-0 p-4
      md:m-2 md:w-80
    "
  >
    <div class="h-24">
      <CardHeader
        v-if="stats.visits" class="
          flex flex-row items-center justify-between space-y-0 px-0 pt-2 pb-2
        "
      >
        <CardTitle class="flex items-center gap-2 text-sm font-medium">
          <span
            class="
              inline-flex size-1.5 animate-ping rounded-full bg-green-400
              opacity-75
            "
          />
          {{ $t('dashboard.visits') }}
        </CardTitle>
        <MousePointerClick class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent class="px-0 pb-4">
        <NumberFlow class="text-2xl font-bold" :class="{ 'opacity-60 blur-md': !stats.visits }" :value="stats.visits" />
      </CardContent>
    </div>
    <DashboardAnalysisViews
      class="h-40 w-full border-none p-0! shadow-none"
      mode="simple"
      chart-type="bar"
    />
  </Card>
</template>
