<script setup lang="ts">
import type { ToggleProps } from ".";

const { as = "button", disabled = false, ariaLabel, ui } = defineProps<ToggleProps>();

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
    :aria-label="ariaLabel"
    :data-akaza-state="model ? 'on' : 'off'"
    :data-akaza-disabled="disabled || undefined"
    :disabled="as === 'button' ? disabled : undefined"
    :class="ui?.root"
    class="akaza-toggle"
    @click="toggle"
  >
    <slot
      :pressed="model"
      :state="model ? 'on' : 'off'"
    />
  </component>
</template>
