<script setup lang='ts'>
import { cn } from '@/lib/utils'

const props = defineProps<{
  name: string
  class?: string
  description: string
  icon?: string
  color?: string
  time: number
}>()

const className = cn(
  'relative mx-auto min-h-fit w-full cursor-pointer border rounded-2xl my-1',
  // animation styles
  'transition-all duration-200 ease-in-out hover:scale-[103%] transform-gpu',
  // light styles
  'bg-white',
  // dark styles
  'dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
)
</script>

<template>
  <figure :class="className">
    <div class="flex flex-row py-2 items-center px-2 gap-2">
      <div
        class="flex size-10 items-center justify-center rounded-2xl"
        :style="{ backgroundColor: props.color || 'transparent' }"
      >
        <span class="text-lg">{{ props.icon }}</span>
      </div>
      <div class="flex flex-col overflow-hidden">
        <div class="flex flex-row items-center whitespace-pre text-lg font-medium ">
          <span class="text-sm text-foreground sm:text-lg">{{ props.name }}</span>
          <span class="mx-1">·</span>
          <span class="text-xs text-gray-500">{{ shortTime(props.time) }}</span>
        </div>
        <p class="text-sm font-normal">
          {{ props.description }}
        </p>
      </div>
    </div>
  </figure>
</template>
