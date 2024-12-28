<script setup>
import { GitHubIcon } from 'vue3-simple-icons'
import { ArrowRight } from 'lucide-vue-next'

const { github } = useAppConfig()
</script>

<template>
  <a
    :href="github"
    target="_blank"
    title="GitHub"
    class="inline-flex items-center px-3 py-1 mx-auto my-4 space-x-1 text-sm font-medium rounded-lg bg-muted"
  >
    <GitHubIcon class="w-4 h-4" />
    <Separator
      orientation="vertical"
      class="h-4"
    />
    <span>Follow me on Github</span>
    <ArrowRight class="w-4 h-4" />
  </a>
</template>
