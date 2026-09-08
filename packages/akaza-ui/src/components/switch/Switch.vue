<script setup lang="ts">
import type { SwitchProps, SwitchValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useId, useSlots, useTemplateRef } from "vue";
import { useCheckableField } from "../../utils/useCheckableField";

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
const buttonRef = useTemplateRef<HTMLButtonElement>("buttonRef");
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const bridge = useCheckableField(model, inputRef, () => buttonRef.value?.focus(), computed(() => model.value === trueValue));
const effectiveDisabled = computed(() => disabled || bridge.field?.disabled.value || false);
const effectiveRequired = computed(() => required || bridge.field?.required.value || false);
const effectiveName = computed(() => name ?? bridge.field?.name.value);
const buttonId = computed(() => id ?? bridge.field?.inputId.value ?? `akaza-switch-${autoId}`);
const labelId = `akaza-switch-label-${autoId}`;
const descriptionId = `akaza-switch-desc-${autoId}`;

const hasLabel = computed(() => !!(label || slots.label));
const hasDescription = computed(() => !!(description || slots.description));

const isChecked = computed(() => model.value === trueValue);

function toggle(reason = "click", event?: Event) {
  if (effectiveDisabled.value || buttonRef.value?.matches(":disabled")) return;
  const nextValue = (isChecked.value ? falseValue : trueValue) as SwitchValue;
  let canceled = false;
  emit("value-change", nextValue, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  model.value = nextValue;
  bridge.onChange();
}
</script>

<template>
  <span
    :class="ui?.wrapper"
    class="akaza-switch-wrapper"
  >
    <button
      :id="buttonId"
      ref="buttonRef"
      v-bind="bridge.attrs.value"
      :aria-invalid="bridge.invalid.value || undefined"
      type="button"
      role="switch"
      :aria-checked="isChecked"
      :aria-label="!hasLabel ? ariaLabel : undefined"
      :aria-labelledby="hasLabel ? labelId : bridge.field?.labelledBy.value"
      :aria-describedby="[bridge.field?.describedBy.value, hasDescription ? descriptionId : undefined].filter(Boolean).join(' ') || undefined"
      :class="ui?.root"
      :data-akaza-state="isChecked ? 'checked' : 'unchecked'"
      :data-akaza-disabled="effectiveDisabled || undefined"
      :disabled="effectiveDisabled"
      class="akaza-switch"
      @focus="bridge.onFocus"
      @blur="bridge.onBlur"
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
      ref="inputRef"
      type="checkbox"
      :name="effectiveName"
      :value="String(trueValue)"
      :checked="isChecked"
      :required="effectiveRequired"
      :disabled="effectiveDisabled"
      aria-hidden="true"
      tabindex="-1"
      :class="ui?.input"
      class="akaza-switch-input"
      @invalid="bridge.onInvalid"
    >

    <!-- Label + description -->
    <span
      v-if="hasLabel || hasDescription"
      :class="ui?.text"
      class="akaza-switch-text"
      @click="!($event.target as HTMLElement).closest('a, button, input, select, textarea, [role=button]') && buttonRef?.click()"
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
@layer akaza-reset {
  .akaza-switch-wrapper {
    display: inline-flex;
    align-items: flex-start;
  }

  .akaza-switch-text {
    display: flex;
    flex-direction: column;
  }

  .akaza-switch-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    margin: 0;
  }
}
</style>
