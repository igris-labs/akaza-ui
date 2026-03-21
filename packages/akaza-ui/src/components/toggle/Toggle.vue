<script setup lang="ts">
import type { ToggleProps } from ".";

const { as = "button", disabled = false } = defineProps<ToggleProps>();

const model = defineModel<boolean>({ default: false });

function toggle() {
  if (!disabled) model.value = !model.value;
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    :aria-pressed="model"
    :data-akaza-state="model ? 'on' : 'off'"
    :data-akaza-disabled="disabled || undefined"
    :disabled="as === 'button' ? disabled : undefined"
    class="akaza-toggle"
    @click="toggle"
  >
    <slot
      :pressed="model"
      :state="model ? 'on' : 'off'"
    />
  </component>
</template>
