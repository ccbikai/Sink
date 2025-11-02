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
const top10 = ref([])

async function getLinkMetrics() {
  total.value = 0
  metrics.value = []
  top10.value = []
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
    top10.value = metrics.value.slice(0, 10)
  }
}

watch([time, filters], getLinkMetrics, {
  deep: true,
})

onMounted(() => {
  getLinkMetrics()
})
</script>

<template>
  <Card class="flex flex-col gap-0 p-0">
    <template v-if="metrics.length">
      <CardContent class="p-0">
        <DashboardAnalysisMetricsList
          class="flex-1"
          :metrics="top10"
          :type="type"
        />
      </CardContent>
      <CardFooter class="py-2">
        <Dialog>
          <DialogTrigger
            as-child
            class="w-full"
          >
            <Button
              variant="link"
            >
              <Maximize class="mr-2 h-4 w-4" />
              {{ $t('dashboard.details') }}
            </Button>
          </DialogTrigger>
          <DialogContent
            class="
              max-h-[95svh] max-w-[95svw] grid-rows-[auto_minmax(0,1fr)_auto]
              md:max-w-(--breakpoint-md)
            "
          >
            <DialogHeader>
              <DialogTitle>{{ name }}</DialogTitle>
            </DialogHeader>
            <DashboardAnalysisMetricsList
              class="overflow-y-auto"
              :metrics="metrics"
              :type="type"
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </template>
    <template v-else>
      <div class="flex h-12 items-center justify-between px-4">
        <Skeleton
          class="h-4 w-32 rounded-full"
        />
        <Skeleton
          class="h-4 w-20 rounded-full"
        />
      </div>
      <div
        v-for="i in 5"
        :key="i"
        class="px-4 py-4"
      >
        <Skeleton
          class="h-4 w-full rounded-full"
        />
      </div>
    </template>
  </Card>
</template>
