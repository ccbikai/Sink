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
      class="w-5 h-5 p-0.5 float-left"
    >
      <AvatarImage
        :src="`https://unavatar.io/${name}?fallback=false`"
        alt="@radix-vue"
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
