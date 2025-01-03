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
const startAt = inject('startAt')
const endAt = inject('endAt')

async function getLinkCounters() {
  counters.value = defaultData
  const { data } = await useAPI('/api/stats/counters', {
    query: {
      id: id.value,
      startAt: startAt.value,
      endAt: endAt.value,
    },
  })
  counters.value = data?.[0]
}

const stopWatchTime = watch([startAt, endAt], getLinkCounters)

onMounted(async () => {
  getLinkCounters()
})

onBeforeUnmount(() => {
  stopWatchTime()
})
</script>

<template>
  <div class="grid gap-4 sm:gap-3 lg:gap-4 sm:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          Visits
        </CardTitle>
        <MousePointerClick class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'blur-md opacity-60': !counters.visits }" :value="counters.visits" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          Visitors
        </CardTitle>
        <Users class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'blur-md opacity-60': !counters.visitors }" :value="counters.visitors" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle class="text-sm font-medium">
          Referers
        </CardTitle>
        <Flame class="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <NumberFlow class="text-2xl font-bold" :class="{ 'blur-md opacity-60': !counters.referers }" :value="counters.referers" />
      </CardContent>
    </Card>
  </div>
</template>
