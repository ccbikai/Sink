<script setup>
import { now } from '@internationalized/date'

defineProps({
  link: {
    type: Object,
    default: () => null,
  },
})

const time = ref({
  startAt: date2unix(now().subtract({ days: 7 })),
  endAt: date2unix(now()),
})

provide('time', time)

function changeDate(dateRange) {
  console.log('changeDate', dateRange)
  // console.log('dashboard date', new Date(time[0] * 1000), new Date(time[1] * 1000))
  time.value.startAt = dateRange[0]
  time.value.endAt = dateRange[1]
}

const filters = ref({})

provide('filters', filters)

function changeFilter(type, value) {
  console.log('changeFilter', type, value)
  filters.value[type] = value
}
</script>

<template>
  <main class="space-y-6">
    <div class="flex flex-col gap-6 sm:gap-2 sm:flex-row sm:justify-between">
      <DashboardNav class="flex-1">
        <template
          v-if="link"
          #left
        >
          <h3 class="text-xl font-bold leading-10">
            {{ link.slug }}'s Stats
          </h3>
        </template>
        <DashboardDatePicker @update:date-range="changeDate" />
      </DashboardNav>
      <DashboardFilter v-if="!link" @change="changeFilter" />
    </div>
    <DashboardCounters />
    <DashboardViews />
    <DashboardMetrics />
  </main>
</template>
