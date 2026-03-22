<script setup lang="ts">
import type { SwitchProps, SwitchValue } from ".";
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
  ariaLabel,
  ui,
} = defineProps<SwitchProps>();

const emit = defineEmits<{
  "value-change": [value: SwitchValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<SwitchValue>({ default: false });

const slots = useSlots();
const autoId = useId();
const buttonId = computed(() => id ?? `akaza-switch-${autoId}`);
const labelId = `akaza-switch-label-${autoId}`;
const descriptionId = `akaza-switch-desc-${autoId}`;

const hasLabel = computed(() => !!(label || slots.label));
const hasDescription = computed(() => !!(description || slots.description));

const isChecked = computed(() => model.value === trueValue);

function toggle(reason = "click", event?: Event) {
  if (disabled) return;
  const nextValue = (isChecked.value ? falseValue : trueValue) as SwitchValue;
  let canceled = false;
  emit("value-change", nextValue, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  model.value = nextValue;
}
</script>

<template>
  <span
    :class="ui?.wrapper"
    class="akaza-switch-wrapper"
  >
    <button
      type="button"
      role="switch"
      :id="buttonId"
      :aria-checked="isChecked"
      :aria-label="!hasLabel ? ariaLabel : undefined"
      :aria-labelledby="hasLabel ? labelId : undefined"
      :aria-describedby="hasDescription ? descriptionId : undefined"
      :class="ui?.root"
      :data-akaza-state="isChecked ? 'checked' : 'unchecked'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-switch"
      @click="toggle('click', $event)"
      @keydown.space.prevent="toggle('keyboard', $event)"
      @keydown.enter.prevent="toggle('keyboard', $event)"
    >
      <span
        :class="ui?.thumb"
        :data-akaza-state="isChecked ? 'checked' : 'unchecked'"
        class="akaza-switch-thumb"
      >
        <slot name="thumb" :checked="isChecked" />
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
      class="akaza-switch-input"
    />

    <!-- Label + description -->
    <span
      v-if="hasLabel || hasDescription"
      class="akaza-switch-text"
    >
      <span
        v-if="hasLabel"
        :id="labelId"
        :class="ui?.label"
        class="akaza-switch-label"
      >
        <slot name="label">{{ label }}</slot>
      </span>
      <span
        v-if="hasDescription"
        :id="descriptionId"
        :class="ui?.description"
        class="akaza-switch-description"
      >
        <slot name="description">{{ description }}</slot>
      </span>
    </span>
  </span>
</template>

<style>
.akaza-switch-wrapper {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}

.akaza-switch-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.akaza-switch-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  margin: 0;
}
</style>
