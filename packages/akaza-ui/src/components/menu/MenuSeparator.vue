<script setup lang="ts">
import type { MenuSeparatorProps } from ".";

const { as = "div" } = defineProps<MenuSeparatorProps>();
</script>

<template>
  <component
    :is="as"
    role="separator"
    aria-orientation="horizontal"
    class="akaza-menu-separator"
  />
</template>
