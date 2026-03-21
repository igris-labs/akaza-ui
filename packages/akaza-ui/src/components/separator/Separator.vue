<script setup lang="ts">
import type { SeparatorProps } from '.'

const {
  as = 'div',
  orientation = 'horizontal',
  decorative = false,
} = defineProps<SeparatorProps>()
</script>

<template>
  <component
    :is="as"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative ? orientation : undefined"
    :data-akaza-orientation="orientation"
    class="akaza-separator"
  />
</template>
