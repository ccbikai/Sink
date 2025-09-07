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
  counters.value = data?.[0]
}

watch([time, filters], getLinkCounters, {
  deep: true,
})

onMounted(async () => {
  getLinkCounters()
})
</script>

<template>
  <div
    class="
      grid gap-4
      sm:grid-cols-3 sm:gap-3
      lg:gap-4
    "
  >
    <Card class="gap-0">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visits') }}
        </CardTitle>
        <MousePointerClick class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'opacity-60 blur-md': !counters.visits }" :value="counters.visits" />
      </CardContent>
    </Card>
    <Card class="gap-0">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.visitors') }}
        </CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'opacity-60 blur-md': !counters.visitors }" :value="counters.visitors" />
      </CardContent>
    </Card>
    <Card class="gap-0">
      <CardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <CardTitle class="text-sm font-medium">
          {{ $t('dashboard.referers') }}
        </CardTitle>
        <Flame class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'opacity-60 blur-md': !counters.referers }" :value="counters.referers" />
      </CardContent>
    </Card>
  </div>
</template>
