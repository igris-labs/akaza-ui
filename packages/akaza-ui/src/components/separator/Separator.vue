<script setup lang="ts">
import type { SeparatorProps } from ".";

const {
  as = "div",
  orientation = "horizontal",
  decorative = false,
  ui,
} = defineProps<SeparatorProps>();
</script>

<template>
  <component
    :is="as"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="!decorative ? orientation : undefined"
    :data-akaza-orientation="orientation"
    :class="ui?.root"
    class="akaza-separator"
  />
</template>
