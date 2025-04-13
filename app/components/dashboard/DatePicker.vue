<script setup>
import { now, startOfMonth, startOfWeek } from '@internationalized/date'
import { useUrlSearchParams } from '@vueuse/core'
import { safeDestr } from 'destr'

const emit = defineEmits(['update:dateRange'])

const time = inject('time')

const dateRange = ref('last-7d')
const openCustomDateRange = ref(false)
const customDate = ref()
const customDateRange = ref()

const locale = getLocale()

function updateCustomDate(customDateValue) {
  emit('update:dateRange', [date2unix(customDateValue, 'start'), date2unix(customDateValue, 'end')])
  openCustomDateRange.value = false
  customDate.value = undefined
}

function updateCustomDateRange(customDateRangeValue) {
  if (customDateRangeValue.start && customDateRangeValue.end) {
    emit('update:dateRange', [date2unix(customDateRangeValue.start, 'start'), date2unix(customDateRangeValue.end, 'end')])
    openCustomDateRange.value = false
    customDateRange.value = undefined
  }
}

function isDateDisabled(dateValue) {
  return dateValue.toDate() > new Date()
}

watch(dateRange, (newValue) => {
  switch (newValue) {
    case 'today':
      emit('update:dateRange', [date2unix(now(), 'start'), date2unix(now())])
      break
    case 'last-24h':
      emit('update:dateRange', [date2unix(now().subtract({ hours: 24 })), date2unix(now())])
      break
    case 'this-week':
      emit('update:dateRange', [date2unix(startOfWeek(now(), locale), 'start'), date2unix(now())])
      break
    case 'last-7d':
      emit('update:dateRange', [date2unix(now().subtract({ days: 7 })), date2unix(now())])
      break
    case 'this-month':
      emit('update:dateRange', [date2unix(startOfMonth(now()), 'start'), date2unix(now())])
      break
    case 'last-30d':
      emit('update:dateRange', [date2unix(now().subtract({ days: 30 })), date2unix(now())])
      break
    case 'last-90d':
      emit('update:dateRange', [date2unix(now().subtract({ days: 90 })), date2unix(now())])
      break
    case 'custom':
      openCustomDateRange.value = true
      dateRange.value = null
      break
    default:
      break
  }
})

function restoreDateRange() {
  try {
    const searchParams = useUrlSearchParams('history')
    if (searchParams.time) {
      const time = safeDestr(searchParams.time)
      emit('update:dateRange', [time.startAt, time.endAt])
      dateRange.value = 'custom'
      nextTick(() => {
        openCustomDateRange.value = false
        customDateRange.value = undefined
      })
    }
  }
  catch (error) {
    console.error('restore searchParams error', error)
  }
}

onBeforeMount(() => {
  restoreDateRange()
})
</script>

<template>
  <Select v-model="dateRange">
    <SelectTrigger>
      <SelectValue v-if="dateRange" />
      <div v-else>
        {{ shortDate(time.startAt) }} - {{ shortDate(time.endAt) }}
      </div>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="today">
        {{ $t('dashboard.date_picker.today') }}
      </SelectItem>
      <SelectItem value="last-24h">
        {{ $t('dashboard.date_picker.last_24h') }}
      </SelectItem>
      <SelectSeparator />
      <SelectItem value="this-week">
        {{ $t('dashboard.date_picker.this_week') }}
      </SelectItem>
      <SelectItem value="last-7d">
        {{ $t('dashboard.date_picker.last_7d') }}
      </SelectItem>
      <SelectSeparator />
      <SelectItem value="this-month">
        {{ $t('dashboard.date_picker.this_month') }}
      </SelectItem>
      <SelectItem value="last-30d">
        {{ $t('dashboard.date_picker.last_30d') }}
      </SelectItem>
      <SelectSeparator />
      <SelectItem value="last-90d">
        {{ $t('dashboard.date_picker.last_90d') }}
      </SelectItem>
      <SelectSeparator />
      <SelectItem value="custom">
        {{ $t('dashboard.date_picker.custom') }}
      </SelectItem>
    </SelectContent>
  </Select>

  <Dialog v-model:open="openCustomDateRange">
    <DialogContent class="w-auto max-w-[95svw] max-h-[95svh] md:max-w-screen-md grid-rows-[auto_minmax(0,1fr)_auto]">
      <DialogHeader>
        <DialogTitle>{{ $t('dashboard.date_picker.custom_title') }}</DialogTitle>
      </DialogHeader>
      <Tabs
        default-value="range"
      >
        <div class="flex justify-center">
          <TabsList>
            <TabsTrigger value="date">
              {{ $t('dashboard.date_picker.single_date') }}
            </TabsTrigger>
            <TabsTrigger value="range">
              {{ $t('dashboard.date_picker.date_range') }}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="date"
          class="overflow-y-auto h-80"
        >
          <Calendar
            :model-value="customDate"
            weekday-format="short"
            :is-date-disabled="isDateDisabled"
            @update:model-value="updateCustomDate"
          />
        </TabsContent>
        <TabsContent
          value="range"
          class="overflow-y-auto h-80"
        >
          <RangeCalendar
            :model-value="customDateRange"
            initial-focus
            weekday-format="short"
            :number-of-months="2"
            :is-date-disabled="isDateDisabled"
            @update:model-value="updateCustomDateRange"
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
