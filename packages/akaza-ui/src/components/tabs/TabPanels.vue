<script setup lang="ts">
import type { TabPanelsProps } from '.'

const { as = 'div' } = defineProps<TabPanelsProps>()
</script>

<template>
  <component :is="as" class="akaza-tab-panels">
    <slot />
  </component>
</template>
