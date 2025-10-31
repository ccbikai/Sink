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
  <main class="py-12 bg-primary md:py-16">
    <div class="container">
      <div class="text-center md:pb-12 md:text-left">
        <h2 class="text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl lg:tracking-tight">
          {{ $t('home.features.title') }}
        </h2>
        <p class="max-w-xl mx-auto mt-4 text-base text-primary-foreground/80 sm:text-lg md:mx-0 md:max-w-none">
          {{ $t('home.features.subtitle') }}
        </p>
      </div>

      <div class="grid gap-8 mt-8 sm:grid-cols-2 md:grid-cols-3 md:gap-12 md:mt-12">
        <div
          v-for="item in features"
          :key="item.title"
          class="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:text-left"
        >
          <div class="flex items-center justify-center w-12 h-12 p-2 rounded-full shrink-0 bg-primary-foreground">
            <component
              :is="item.icon"
              class="w-6 h-6 text-primary"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-primary-foreground">
              {{ item.title }}
            </h3>
            <p class="mt-2 leading-relaxed text-primary-foreground/80">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
