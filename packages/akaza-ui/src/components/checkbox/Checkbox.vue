<script setup lang="ts">
import type { CheckboxProps, CheckboxValue } from ".";
import { computed, useId, useSlots } from "vue";

const {
  disabled = false,
  id,
  name,
  required = false,
  trueValue = true,
  falseValue = false,
  label,
  description,
  ui,
} = defineProps<CheckboxProps>();

const model = defineModel<CheckboxValue>({ default: false });

const slots = useSlots();
const autoId = useId();
const buttonId = computed(() => id ?? `akaza-checkbox-${autoId}`);
const labelId = `akaza-checkbox-label-${autoId}`;
const descriptionId = `akaza-checkbox-desc-${autoId}`;

const hasLabel = computed(() => !!(label || slots.label));
const hasDescription = computed(() => !!(description || slots.description));

const isChecked = computed(() => model.value === trueValue);
const isIndeterminate = computed(() => model.value === "indeterminate");

function toggle() {
  if (disabled) return;
  model.value = (isChecked.value ? falseValue : trueValue) as CheckboxValue;
}
</script>

<template>
  <span
    :class="ui?.wrapper"
    class="akaza-checkbox-wrapper"
  >
    <button
      type="button"
      role="checkbox"
      :id="buttonId"
      :aria-checked="isIndeterminate ? 'mixed' : isChecked"
      :aria-labelledby="hasLabel ? labelId : undefined"
      :aria-describedby="hasDescription ? descriptionId : undefined"
      :class="ui?.root"
      :data-akaza-state="isChecked ? 'checked' : isIndeterminate ? 'indeterminate' : 'unchecked'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-checkbox"
      @click="toggle"
      @keydown.space.prevent="toggle"
    >
      <span
        v-if="!isChecked && !isIndeterminate ? false : true"
        :class="ui?.indicator"
        :data-akaza-state="isChecked ? 'checked' : 'indeterminate'"
        class="akaza-checkbox-indicator"
      >
        <slot name="indicator" :checked="model" />
      </span>
    </button>

    <!-- Hidden native input for form submission -->
    <input
      v-if="name"
      type="checkbox"
      :name="name"
      :value="String(trueValue)"
      :checked="isChecked"
      :required="required"
      aria-hidden="true"
      tabindex="-1"
      class="akaza-checkbox-input"
    />

    <!-- Label + description -->
    <span
      v-if="hasLabel || hasDescription"
      class="akaza-checkbox-text"
    >
      <span
        v-if="hasLabel"
        :id="labelId"
        :class="ui?.label"
        class="akaza-checkbox-label"
      >
        <slot name="label">{{ label }}</slot>
      </span>
      <span
        v-if="hasDescription"
        :id="descriptionId"
        :class="ui?.description"
        class="akaza-checkbox-description"
      >
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </span>
</template>

<style>
.akaza-checkbox-wrapper {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}

.akaza-checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.akaza-checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  margin: 0;
}
</style>
