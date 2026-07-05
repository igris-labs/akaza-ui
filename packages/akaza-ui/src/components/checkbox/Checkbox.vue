<script setup lang="ts">
import type { CheckboxProps, CheckboxValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
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

const emit = defineEmits<{
  'value-change': [value: CheckboxValue, details: AkazaChangeEventDetails];
}>();

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

function toggle(reason = 'click', event?: Event) {
  if (disabled) return;
  const nextValue = (isChecked.value ? falseValue : trueValue) as CheckboxValue;
  let canceled = false;
  emit('value-change', nextValue, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  model.value = nextValue;
}
</script>

<template>
  <span
    :class="ui?.wrapper"
    class="akaza-checkbox-wrapper"
  >
    <button
      :id="buttonId"
      type="button"
      role="checkbox"
      :aria-checked="isIndeterminate ? 'mixed' : isChecked"
      :aria-labelledby="hasLabel ? labelId : undefined"
      :aria-describedby="hasDescription ? descriptionId : undefined"
      :class="ui?.root"
      :data-akaza-state="isChecked ? 'checked' : isIndeterminate ? 'indeterminate' : 'unchecked'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-checkbox"
      @click="toggle('click', $event)"
      @keydown.space.prevent="toggle('keyboard', $event)"
    >
      <span
        v-if="isChecked || isIndeterminate"
        :class="ui?.indicator"
        :data-akaza-state="isChecked ? 'checked' : 'indeterminate'"
        class="akaza-checkbox-indicator"
      >
        <slot name="indicator" :checked="model">
          <svg
            v-if="isChecked"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
          <svg
            v-else
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h6" />
          </svg>
        </slot>
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
      :disabled="disabled"
      aria-hidden="true"
      tabindex="-1"
      class="akaza-checkbox-input"
    >

    <!-- Label + description -->
    <span
      v-if="hasLabel || hasDescription"
      class="akaza-checkbox-text"
      @click="toggle('label-click', $event)"
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

.akaza-checkbox {
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: currentColor;
  cursor: pointer;
}

.akaza-checkbox:disabled,
.akaza-checkbox[data-akaza-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.akaza-checkbox-indicator {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.akaza-checkbox-indicator svg {
  width: 0.75rem;
  height: 0.75rem;
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
