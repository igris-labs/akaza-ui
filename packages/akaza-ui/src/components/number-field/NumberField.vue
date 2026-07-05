<script setup lang="ts">
import type { NumberFieldProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef } from "vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
  min,
  max,
  step = 1,
  placeholder,
  required = false,
  disabled = false,
  readonly = false,
  invalid = false,
  stepSnapping = true,
  ariaLabel,
  ariaDescribedby,
  ui,
} = defineProps<NumberFieldProps>();

const emit = defineEmits<{
  "value-change": [value: number | null, details: AkazaChangeEventDetails];
}>();

const model = defineModel<number | null>({ default: null });
const field = inject(fieldContextKey, null);
const autoId = useId();
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const initialValue = model.value;
const focused = ref(false);
const touched = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-number-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isFilled = computed(() => model.value !== null);
const isDirty = computed(() => model.value !== initialValue);
const canDecrement = computed(() =>
  !isDisabled.value && !readonly && (min === undefined || (model.value ?? min) > min),
);
const canIncrement = computed(() =>
  !isDisabled.value && !readonly && (max === undefined || (model.value ?? max) < max),
);
const textValue = computed(() => model.value === null ? "" : String(model.value));

const stateAttrs = computed(() => ({
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-readonly": readonly || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dirty": isDirty.value || undefined,
  "data-akaza-touched": touched.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
}));

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function decimals(value: number): number {
  const [, decimal = ""] = String(value).split(".");
  return decimal.length;
}

function clamp(value: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

function snap(value: number): number {
  if (!stepSnapping || step <= 0) return value;
  const base = min ?? 0;
  const snapped = Math.round((value - base) / step) * step + base;
  return Number(snapped.toFixed(Math.max(decimals(step), decimals(base))));
}

function normalize(value: number): number {
  return clamp(snap(value));
}

function updateValidity() {
  const input = inputRef.value;
  if (!input) return;
  validity.value = input.validity;
  nativeInvalid.value = !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function setValue(value: number | null, reason: string, event?: Event) {
  if (isDisabled.value || readonly) return;
  const next = value === null ? null : normalize(value);
  let canceled = false;
  emit("value-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) model.value = next;
  updateValidity();
}

function stepBy(multiplier: number, reason: string, event?: Event) {
  const current = model.value ?? min ?? 0;
  setValue(current + step * multiplier, reason, event);
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  const parsed = Number(value);
  setValue(value === "" || !Number.isFinite(parsed) ? null : parsed, "input", event);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    stepBy(1, "keyboard", event);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    stepBy(-1, "keyboard", event);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    stepBy(10, "keyboard", event);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    stepBy(-10, "keyboard", event);
  } else if (event.key === "Home" && min !== undefined) {
    event.preventDefault();
    setValue(min, "keyboard", event);
  } else if (event.key === "End" && max !== undefined) {
    event.preventDefault();
    setValue(max, "keyboard", event);
  }
}

function onFocus() {
  focused.value = true;
}

function onBlur() {
  touched.value = true;
  focused.value = false;
  updateValidity();
}

onMounted(updateValidity);
onUpdated(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <div
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-number-field"
  >
    <button
      type="button"
      :disabled="!canDecrement"
      :class="ui?.decrement"
      v-bind="stateAttrs"
      class="akaza-number-field-decrement"
      aria-label="Decrement"
      @click="stepBy(-1, 'decrement', $event)"
    >
      <slot name="decrement" :value="model" :decrement="() => stepBy(-1, 'programmatic')">−</slot>
    </button>

    <input
      :id="resolvedId"
      ref="inputRef"
      role="spinbutton"
      type="number"
      :name="resolvedName"
      :value="textValue"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="readonly"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="isInvalid || undefined"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model ?? undefined"
      :class="ui?.input"
      v-bind="stateAttrs"
      class="akaza-number-field-input"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @invalid="updateValidity"
      @keydown="onKeydown"
    >

    <button
      type="button"
      :disabled="!canIncrement"
      :class="ui?.increment"
      v-bind="stateAttrs"
      class="akaza-number-field-increment"
      aria-label="Increment"
      @click="stepBy(1, 'increment', $event)"
    >
      <slot name="increment" :value="model" :increment="() => stepBy(1, 'programmatic')">+</slot>
    </button>
  </div>
</template>

<style>
.akaza-number-field {
  display: inline-flex;
  align-items: center;
}
</style>
