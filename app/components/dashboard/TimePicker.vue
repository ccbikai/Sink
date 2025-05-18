<script setup>
import { now } from '@internationalized/date'
import { useUrlSearchParams } from '@vueuse/core'

const emit = defineEmits(['update:timeRange'])

const timeRange = ref('last-1h')

watch(timeRange, (newValue) => {
  switch (newValue) {
    case 'today':
      emit('update:timeRange', [date2unix(now(), 'start'), date2unix(now())], newValue)
      break
    case 'last-5m':
      emit('update:timeRange', [date2unix(now().subtract({ minutes: 5 })), date2unix(now())], newValue)
      break
    case 'last-10m':
      emit('update:timeRange', [date2unix(now().subtract({ minutes: 10 })), date2unix(now())], newValue)
      break
    case 'last-30m':
      emit('update:timeRange', [date2unix(now().subtract({ minutes: 30 })), date2unix(now())], newValue)
      break
    case 'last-1h':
      emit('update:timeRange', [date2unix(now().subtract({ hours: 1 })), date2unix(now())], newValue)
      break
    case 'last-6h':
      emit('update:timeRange', [date2unix(now().subtract({ hours: 6 })), date2unix(now())], newValue)
      break
    case 'last-12h':
      emit('update:timeRange', [date2unix(now().subtract({ hours: 12 })), date2unix(now())], newValue)
      break
    case 'last-24h':
      emit('update:timeRange', [date2unix(now().subtract({ hours: 24 })), date2unix(now())], newValue)
      break
    default:
      break
  }
}, { deep: true })

function restoreTimeRange() {
  try {
    const searchParams = useUrlSearchParams('history')
    if (searchParams.time) {
      timeRange.value = searchParams.time
      triggerRef(timeRange)
    }
  }
  catch (error) {
    console.error('restore searchParams error', error)
  }
}

defineExpose({
  restoreTimeRange,
})

onBeforeMount(() => {
  restoreTimeRange()
})
</script>

<template>
  <Select v-model="timeRange">
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="last-5m">
        {{ $t('dashboard.time_picker.last_5m') }}
      </SelectItem>
      <SelectItem value="last-10m">
        {{ $t('dashboard.time_picker.last_10m') }}
      </SelectItem>
      <SelectItem value="last-30m">
        {{ $t('dashboard.time_picker.last_30m') }}
      </SelectItem>
      <SelectItem value="last-1h">
        {{ $t('dashboard.time_picker.last_1h') }}
      </SelectItem>
      <SelectItem value="last-6h">
        {{ $t('dashboard.time_picker.last_6h') }}
      </SelectItem>
      <SelectItem value="last-12h">
        {{ $t('dashboard.time_picker.last_12h') }}
      </SelectItem>
      <SelectItem value="last-24h">
        {{ $t('dashboard.time_picker.last_24h') }}
      </SelectItem>
      <SelectSeparator />
      <SelectItem value="today">
        {{ $t('dashboard.time_picker.today') }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
