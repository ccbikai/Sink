<script setup>
import AnimatedList from '@/components/spark-ui/AnimatedList.vue'
import Notification from '@/components/spark-ui/Notification.vue'

const time = inject('time')
const filters = inject('filters')
const logs = ref([])
const logskey = ref(0)

async function getEvents() {
  const data = await useAPI('/api/logs/events', {
    query: {
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  logs.value = data?.reverse()
  logskey.value = Date.now()
}

const stopWatchQueryChange = watch([time, filters], getEvents, {
  deep: true,
})

onMounted(async () => {
  getEvents()
})

onBeforeUnmount(() => {
  stopWatchQueryChange()
})
</script>

<template>
  <AnimatedList v-if="logs.length" :key="logskey" class="md:w-72">
    <template #default>
      <Notification
        v-for="item in logs"
        :key="item.id"
        :name="item.slug"
        :description="[item.os, item.browser].filter(Boolean).join(' ')"
        :icon="getFlag(item.country)"
        :time="item.timestamp"
        class="w-full"
      />
    </template>
  </AnimatedList>
</template>
