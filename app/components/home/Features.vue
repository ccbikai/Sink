<script setup>
import { AreaChart, Hourglass, Link, Paintbrush, ServerOff, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()
const features = computed(() => [
  {
    title: t('home.features.url_shortening.title'),
    description: t('home.features.url_shortening.description'),
    icon: Link,
  },
  {
    title: t('home.features.analytics.title'),
    description: t('home.features.analytics.description'),
    icon: AreaChart,
  },
  {
    title: t('home.features.serverless.title'),
    description: t('home.features.serverless.description'),
    icon: ServerOff,
  },
  {
    title: t('home.features.customizable_slug.title'),
    description: t('home.features.customizable_slug.description'),
    icon: Paintbrush,
  },
  {
    title: t('home.features.ai_slug.title'),
    description: t('home.features.ai_slug.description'),
    icon: Sparkles,
  },
  {
    title: t('home.features.link_expiration.title'),
    description: t('home.features.link_expiration.description'),
    icon: Hourglass,
  },
])
</script>

<template>
  <main class="pt-16 md:py-12">
    <div class="md:pb-12">
      <h2 class="text-4xl font-bold lg:text-5xl lg:tracking-tight">
        {{ $t('home.features.title') }}
      </h2>
      <p class="my-8 text-lg md:mb-0 text-slate-600">
        {{ $t('home.features.subtitle') }}
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
