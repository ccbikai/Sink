<script setup>
import { AreaChart, Hourglass, Link, Paintbrush, ServerOff, Sparkles } from 'lucide-vue-next'

const features = ref([
  {
    title: 'URL Shortening',
    description:
          'Compress your URLs to their minimal length.',
    icon: Link,
  },
  {
    title: 'Analytics',
    description:
          'Monitor link analytics and gather insightful statistics.',
    icon: AreaChart,
  },
  {
    title: 'Serverless',
    description:
          'Deploy without the need for traditional servers.',
    icon: ServerOff,
  },
  {
    title: 'Customizable Slug',
    description:
          'Support for personalized slugs.',
    icon: Paintbrush,
  },
  {
    title: 'AI Slug',
    description:
          'Leverage AI to generate slugs.',
    icon: Sparkles,
  },
  {
    title: 'Link Expiration',
    description:
          'Set expiration dates for your links.',
    icon: Hourglass,
  },
])
</script>

<template>
  <main class="pt-16 md:py-12">
    <div class="md:pb-12">
      <h2 class="text-4xl font-bold lg:text-5xl lg:tracking-tight">
        Features
      </h2>
      <p class="my-8 text-lg md:mb-0 text-slate-600">
        Simple and sufficient functionality
      </p>
    </div>

    <div class="grid gap-8 md:gap-16 sm:grid-cols-2 md:grid-cols-3">
      <div
        v-for="item in features"
        :key="item.title"
        class="flex items-start gap-4"
      >
        <div class="w-8 h-8 p-2 mt-1 bg-black rounded-full shrink-0">
          <component
            :is="item.icon"
            class="w-4 h-4 text-white"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold">
            {{ item.title }}
          </h3>
          <p class="mt-2 leading-relaxed text-slate-500">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
