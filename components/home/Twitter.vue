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
    class="inline-flex items-center px-3 py-1 mx-auto my-4 space-x-1 text-sm font-medium rounded-lg bg-muted"
  >
    <XIcon class="w-4 h-4" />
    <Separator
      orientation="vertical"
      class="h-4"
    />
    <span>{{ $t('home.twitter.follow') }}</span>
    <ArrowRight class="w-4 h-4" />
  </a>
</template>
