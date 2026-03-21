<script setup lang="ts">
import type { CheckboxProps, CheckboxValue } from ".";

const { disabled = false, ui } = defineProps<CheckboxProps>();

const model = defineModel<CheckboxValue>({ default: false });

function toggle() {
  if (disabled) return;
  model.value = model.value !== true;
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="model === 'indeterminate' ? 'mixed' : model"
    :class="ui?.root"
    :data-akaza-state="
      model === true ? 'checked' : model === 'indeterminate' ? 'indeterminate' : 'unchecked'
    "
    :data-akaza-disabled="disabled || undefined"
    :disabled="disabled"
    class="akaza-checkbox"
    @click="toggle"
    @keydown.space.prevent="toggle"
  >
    <span
      v-if="model !== false"
      :class="ui?.indicator"
      :data-akaza-state="model === true ? 'checked' : 'indeterminate'"
      class="akaza-checkbox-indicator"
    >
      <slot
        name="indicator"
        :checked="model"
      />
    </span>
  </button>
</template>
