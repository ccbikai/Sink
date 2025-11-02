<script setup>
defineProps({
  name: String,
})
</script>

<template>
  <a
    :href="`http://${name}`"
    target="_blank"
    rel="noopener noreferrer"
    class="block w-full truncate"
  >
    <Avatar
      class="float-left h-5 w-5 p-0.5"
    >
      <AvatarImage
        :src="`https://unavatar.io/${name}?fallback=false`"
        :alt="name"
        loading="lazy"
      />
      <AvatarFallback>
        <img
          src="/icon.png"
          alt="Sink"
          loading="lazy"
        >
      </AvatarFallback>
    </Avatar>
    <span>{{ name }}</span>
  </a>
</template>
