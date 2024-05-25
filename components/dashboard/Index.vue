<script setup>
import { now } from '@internationalized/date'

defineProps({
  link: {
    type: Object,
    default: () => null,
  },
})

const startAt = ref(date2unix(now().subtract({ days: 7 })))
const endAt = ref(date2unix(now()))

provide('startAt', startAt)
provide('endAt', endAt)

function changeDate(time) {
  // console.log('dashboard date', new Date(time[0] * 1000), new Date(time[1] * 1000))
  startAt.value = time[0]
  endAt.value = time[1]
}
</script>

<template>
  <main class="space-y-6">
    <DashboardNav>
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
    <DashboardCounters />
    <DashboardViews />
    <DashboardMetrics />
  </main>
</template>
