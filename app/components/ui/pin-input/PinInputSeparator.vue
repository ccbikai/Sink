<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import { MinusIcon } from '@radix-icons/vue'
import { Primitive, useForwardProps } from "reka-ui"

const props = defineProps<PrimitiveProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <Primitive v-bind="forwardedProps">
    <slot>
      <MinusIcon class="w-2" />
    </slot>
  </Primitive>
</template>
