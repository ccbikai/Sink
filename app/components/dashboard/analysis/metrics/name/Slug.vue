<script setup>
defineProps({
  name: String,
})
</script>

<template>
  <NuxtLink
    :to="`/dashboard/link?slug=${name}`"
    class="inline-flex items-center justify-start w-full"
  >
    <span class="w-full truncate">{{ name }}</span>
  </NuxtLink>
</template>
