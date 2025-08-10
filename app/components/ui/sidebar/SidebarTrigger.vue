<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ViewVerticalIcon } from '@radix-icons/vue'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <ViewVerticalIcon />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
