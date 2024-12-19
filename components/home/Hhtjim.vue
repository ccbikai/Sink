<script setup>
import { WordPressIcon } from 'vue3-simple-icons'
import { ArrowRight } from 'lucide-vue-next'

// const { twitter } = useAppConfig()
</script>

<template>
  <a
    href="https://www.hhtjim.com"
    target="_blank"
    title="www.hhtjim.com"
    class="inline-flex items-center px-3 py-1 mx-auto my-4 space-x-1 text-sm font-medium rounded-lg bg-muted"
  >
    <WordPressIcon class="w-4 h-4" />
    <Separator
      orientation="vertical"
      class="h-4"
    />
    <span>Visit HomePage</span>
    <ArrowRight class="w-4 h-4" />
  </a>
</template>
