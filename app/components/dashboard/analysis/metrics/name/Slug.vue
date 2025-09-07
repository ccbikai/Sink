<script setup>
defineProps({
  name: String,
})
</script>

<template>
  <NuxtLink
    :to="`/dashboard/link?slug=${name}`"
    class="inline-flex w-full items-center justify-start"
  >
    <span class="w-full truncate">{{ name }}</span>
  </NuxtLink>
</template>
