<script setup lang="ts">
export interface SeparatorProps {
  as?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

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
