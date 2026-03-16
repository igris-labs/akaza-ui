<script setup lang="ts">
export interface TabPanelsProps {
  as?: string
}

const { as = 'div' } = defineProps<TabPanelsProps>()
</script>

<template>
  <component :is="as" class="akaza-tab-panels">
    <slot />
  </component>
</template>
