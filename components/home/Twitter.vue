<script setup>
import { XIcon } from 'vue3-simple-icons'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <a
    href="https://x.com/0xKaiBi"
    target="_blank"
    title="X(Twitter)"
    class="inline-flex items-center px-3 py-1 mx-auto my-4 space-x-1 text-sm font-medium rounded-lg bg-muted"
  >
    <XIcon class="w-4 h-4" />
    <Separator
      orientation="vertical"
      class="h-4"
    />
    <span>Follow me on X(Twitter)</span>
    <ArrowRight class="w-4 h-4" />
  </a>
</template>
