<script setup lang="ts">
import type { MenuItemProps } from ".";

const { as = "div", disabled = false } = defineProps<MenuItemProps>();
const emit = defineEmits<{ select: [] }>();

function onSelect() {
  if (disabled) return;
  emit("select");
}
</script>

<template>
  <component
    :is="as"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled || undefined"
    :data-akaza-disabled="disabled ? '' : undefined"
    class="akaza-menu-item"
    @click="onSelect"
    @keydown.enter.prevent="onSelect"
    @keydown.space.prevent="onSelect"
  >
    <slot />
  </component>
</template>
