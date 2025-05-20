<script setup>
import { now } from '@internationalized/date'
import { useIntervalFn, useUrlSearchParams } from '@vueuse/core'
import { safeDestr } from 'destr'

const searchParams = useUrlSearchParams('history')

const timePicker = ref(null)

const time = ref({
  startAt: date2unix(now().subtract({ hours: 1 })),
  endAt: date2unix(now()),
})

provide('time', time)

function changeTime(timeRange, timeName) {
  console.log('changeTime', timeRange, timeName)
  time.value.startAt = timeRange[0]
  time.value.endAt = timeRange[1]

  searchParams.time = timeName
}

const filters = ref({})

provide('filters', filters)

function changeFilter(type, value) {
  console.log('changeFilter', type, value)
  filters.value[type] = value

  searchParams.filters = JSON.stringify(filters.value)
}

useIntervalFn(() => {
  timePicker.value?.restoreTimeRange()
}, 5 * 60 * 1000)

function restoreSearchParams() {
  try {
    if (searchParams.filters) {
      filters.value = safeDestr(searchParams.filters)
    }
  }
  catch (error) {
    console.error('restore searchParams error', error)
  }
}

onBeforeMount(() => {
  restoreSearchParams()
})
</script>

<template>
  <main class="space-y-6">
    <div class="flex flex-col gap-6 sm:gap-2 sm:flex-row sm:justify-between">
      <DashboardNav class="flex-1">
        <DashboardTimePicker ref="timePicker" @update:time-range="changeTime" />
      </DashboardNav>
      <DashboardFilters @change="changeFilter" />
    </div>
    <div class="relative space-y-4">
      <DashboardRealtimeChart class="md:absolute top-0 left-0 z-10" />
      <LazyDashboardRealtimeGlobe />
      <DashboardRealtimeLogs class="md:absolute top-0 right-0 h-full z-10" />
    </div>
  </main>
</template>
