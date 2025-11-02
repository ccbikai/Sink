<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { XIcon } from 'vue3-simple-icons'

const { twitter } = useAppConfig()
</script>

<template>
  <a
    :href="twitter"
    target="_blank"
    title="X(Twitter)"
    class="
      mx-auto my-4 inline-flex items-center space-x-1 rounded-lg bg-muted px-3
      py-1 text-sm font-medium
    "
  >
    <XIcon class="h-4 w-4" />
    <Separator
      orientation="vertical"
      class="h-4"
    />
    <span>{{ $t('home.twitter.follow') }}</span>
    <ArrowRight class="h-4 w-4" />
  </a>
</template>
