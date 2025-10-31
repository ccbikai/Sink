<script setup>
defineProps({
  href: {
    type: String,
    required: true,
  },
  block: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
  },
  type: {
    type: String,
    default: 'primary',
  },
  className: {
    type: String,
    default: '',
  },
})

const sizes = {
  lg: 'px-5 py-2.5',
  md: 'px-4 py-2',
}

const styles = {
  outline: 'bg-transparent border-2 border-primary hover:bg-primary/10 text-primary',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-transparent',
  inverted: 'bg-white text-black border-2 border-transparent',
  muted: 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent',
}
</script>

<template>
  <a
    :href="href"
    class="rounded text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200"
    :class="[
      block && 'w-full',
      sizes[size],
      styles[type],
      className,
    ]"
    v-bind="$attrs"
  >
    <slot />
  </a>
</template>
