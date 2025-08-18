<script setup>
import NumberFlow from '@number-flow/vue'
import { Flame, MousePointerClick, Users } from 'lucide-vue-next'

const defaultData = Object.freeze({
  visits: 0,
  visitors: 0,
  referers: 0,
})

const counters = ref(defaultData)

const id = inject('id')
const time = inject('time')
const filters = inject('filters')
async function getLinkCounters() {
  counters.value = defaultData
  const { data } = await useAPI('/api/stats/counters', {
    query: {
      id: id.value,
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  // 确保即使API返回数据不完整，所有字段也有默认值0
  counters.value = {
    visits: Number(data?.[0]?.visits) || 0,
    visitors: Number(data?.[0]?.visitors) || 0,
    referers: Number(data?.[0]?.referers) || 0,
  }
}

watch([time, filters], getLinkCounters, {
  deep: true,
})

onMounted(async () => {
  getLinkCounters()
})
</script>

<template>
  <div class="grid gap-4 sm:gap-3 lg:gap-4 sm:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row justify-between items-center pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visits') }}
        </CardTitle>
        <MousePointerClick class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :value="counters.visits" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row justify-between items-center pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visitors') }}
        </CardTitle>
        <Users class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :value="counters.visitors" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row justify-between items-center pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.referers') }}
        </CardTitle>
        <Flame class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :value="counters.referers" />
      </CardContent>
    </Card>
  </div>
</template>
