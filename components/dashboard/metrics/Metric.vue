<script setup>
import { Maximize } from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const id = inject('id')
const time = inject('time')
const filters = inject('filters')

const total = ref(0)
const metrics = ref([])
const top6 = ref([])

async function getLinkMetrics() {
  total.value = 0
  metrics.value = []
  top6.value = []
  const { data } = await useAPI('/api/stats/metrics', {
    query: {
      type: props.type,
      id: id.value,
      startAt: time.value.startAt,
      endAt: time.value.endAt,
      ...filters.value,
    },
  })
  if (Array.isArray(data)) {
    const colors = colorGradation(data.length)
    total.value = data.reduce((acc, cur) => acc + Number(cur.count), 0)
    metrics.value = data.map((item, i) => {
      item.color = colors[i]
      item.percent = Math.floor(item.count / total.value * 100) || (item.count ? 1 : 0)
      return item
    })
    top6.value = metrics.value.slice(0, 6)
  }
}

const stopWatchQueryChange = watch([time, filters], getLinkMetrics, {
  deep: true,
})

onMounted(() => {
  getLinkMetrics()
})

onBeforeUnmount(() => {
  stopWatchQueryChange()
})
</script>

<template>
  <Card class="flex flex-col">
    <template v-if="metrics.length">
      <DashboardMetricsList
        class="flex-1"
        :metrics="top6"
        :type="type"
      />
      <CardFooter class="py-2">
        <Dialog>
          <DialogTrigger
            as-child
            class="w-full"
          >
            <Button
              variant="link"
            >
              <Maximize
                class="mr-2 w-4 h-4"
              /> DETAILS
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-[95svw] max-h-[95svh] md:max-w-screen-md grid-rows-[auto_minmax(0,1fr)_auto]">
            <DialogHeader>
              <DialogTitle>{{ name }}</DialogTitle>
            </DialogHeader>
            <DashboardMetricsList
              class="overflow-y-auto"
              :metrics="metrics"
              :type="type"
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </template>
    <template v-else>
      <div class="flex justify-between items-center px-4 h-12">
        <Skeleton
          class="w-32 h-4 rounded-full"
        />
        <Skeleton
          class="w-20 h-4 rounded-full"
        />
      </div>
      <div
        v-for="i in 3"
        :key="i"
        class="px-4 py-4"
      >
        <Skeleton
          class="w-full h-4 rounded-full"
        />
      </div>
    </template>
  </Card>
</template>
