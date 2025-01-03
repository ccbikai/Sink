<script setup>
import { VList } from 'virtua/vue'

defineProps({
  metrics: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="w-full text-sm">
    <div
      class="flex justify-between transition-colors border-b hover:bg-muted/50 leading-[48px]"
    >
      <div
        class="h-12 px-4 font-medium text-left align-middle text-muted-foreground "
      >
        Name
      </div>
      <div
        class="h-12 px-4 font-medium text-right align-middle text-muted-foreground"
      >
        Count
      </div>
    </div>
    <VList
      v-slot="{ item: metric }"
      :data="metrics"
      :style="{ height: '342px' }"
    >
      <div class="px-4 py-2 transition-colors border-b hover:bg-muted/50">
        <div class="flex justify-between">
          <div
            class="flex-1 leading-5 truncate font-mediums"
          >
            <DashboardMetricsName
              :name="metric.name"
              :type="type"
            />
          </div>
          <div
            class="text-right"
          >
            {{ formatNumber(metric.count) }}
            <span class="text-xs text-gray-500">({{ metric.percent }}%)</span>
          </div>
        </div>
        <div
          class="flex-1"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger class="w-full">
                <Progress
                  v-model="metric.percent"
                  class="h-2"
                  :color="metric.color"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ metric.percent }}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </VList>
  </div>
</template>
