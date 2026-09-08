<script setup lang="ts">
import type { NumberFieldProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef } from "vue";
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
  disableWheelChange = false,
  invertWheelChange = false,
  focusOnChange = true,
  scrubLabel,
  scrubStep,
  disableScrub = false,
  getValueLabel,
  ariaLabel,
  ariaDescribedby,
  ui,
} = defineProps<NumberFieldProps>();

const emit = defineEmits<{
  "value-change": [value: number | null, details: AkazaChangeEventDetails];
  "value-commit": [value: number | null, details: AkazaChangeEventDetails];
}>();

const model = defineModel<number | null>({ default: null });
const field = inject(fieldContextKey, null);
const autoId = useId();
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const initialValue = model.value;
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const scrubbing = ref(false);
let scrubStartX = 0;
let scrubStartValue = 0;
let pendingCommitValue: number | null | undefined;
let formElement: HTMLFormElement | null = null;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-number-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isFilled = computed(() => model.value !== null);
const isDirty = computed(() => model.value !== initialValue);
const canDecrement = computed(() =>
  !isDisabled.value && !readonly && (model.value === null || min === undefined || model.value > min),
);
const canIncrement = computed(() =>
  !isDisabled.value && !readonly && (model.value === null || max === undefined || model.value < max),
);
const textValue = computed(() => model.value === null ? "" : String(model.value));
const ariaValueText = computed(() => getValueLabel?.(model.value));

const stateAttrs = computed(() => ({
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-readonly": readonly || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dirty": isDirty.value || undefined,
  "data-akaza-touched": touched.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
  "data-akaza-scrubbing": scrubbing.value || undefined,
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
  const [coefficient = "", exponent = "0"] = String(value).toLowerCase().split("e");
  return Math.min(100, Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent)));
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

function updateValidity(reveal = validationActive.value) {
  const input = inputRef.value;
  if (!input) return;
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function setValue(value: number | null, reason: string, event?: Event): boolean {
  if (isDisabled.value || readonly) return false;
  validationActive.value = true;
  const next = value === null ? null : reason === "input" ? value : normalize(value);
  let canceled = false;
  emit("value-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) {
    if (inputRef.value) inputRef.value.value = textValue.value;
    pendingCommitValue = undefined;
    return false;
  }
  model.value = next;
  pendingCommitValue = next;
  updateValidity();
  return true;
}

function commitValue(reason: string, event?: Event) {
  const value = pendingCommitValue === undefined ? model.value : pendingCommitValue;
  pendingCommitValue = undefined;
  emit("value-commit", value, {
    reason,
    ...(event && { event }),
    cancel: () => {},
  });
}

function stepBy(multiplier: number, reason: string, event?: Event): boolean {
  const current = model.value ?? min ?? 0;
  const changed = setValue(current + step * multiplier, reason, event);
  if (focusOnChange) inputRef.value?.focus();
  return changed;
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  const parsed = Number(value);
  setValue(value === "" || !Number.isFinite(parsed) ? null : parsed, "input", event);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (stepBy(1, "keyboard", event)) commitValue("keyboard", event);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (stepBy(-1, "keyboard", event)) commitValue("keyboard", event);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    if (stepBy(10, "keyboard", event)) commitValue("keyboard", event);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    if (stepBy(-10, "keyboard", event)) commitValue("keyboard", event);
  } else if (event.key === "Home" && min !== undefined) {
    event.preventDefault();
    if (setValue(min, "keyboard", event)) commitValue("keyboard", event);
  } else if (event.key === "End" && max !== undefined) {
    event.preventDefault();
    if (setValue(max, "keyboard", event)) commitValue("keyboard", event);
  }
}

function onWheel(event: WheelEvent) {
  if (disableWheelChange || !focused.value || isDisabled.value || readonly) return;
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  if (stepBy(invertWheelChange ? -direction : direction, "wheel", event)) commitValue("wheel", event);
}

function onScrubPointerDown(event: PointerEvent) {
  if (disableScrub || isDisabled.value || readonly) return;
  scrubbing.value = true;
  scrubStartX = event.clientX;
  scrubStartValue = model.value ?? min ?? 0;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onScrubPointerMove(event: PointerEvent) {
  if (!scrubbing.value) return;
  const nextStep = scrubStep ?? step;
  const steps = Math.trunc((event.clientX - scrubStartX) / 8);
  setValue(scrubStartValue + steps * nextStep, "scrub", event);
}

function onScrubPointerUp(event: PointerEvent) {
  if (!scrubbing.value) return;
  scrubbing.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  commitValue("scrub", event);
}

function onFocus() {
  focused.value = true;
}

function onBlur() {
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  if (pendingCommitValue !== undefined && model.value !== null && normalize(model.value) !== model.value) setValue(model.value, "blur");
  updateValidity();
  commitValue("blur");
}

function onInvalid() {
  validationActive.value = true;
  updateValidity();
}

async function onFormReset(event: Event) {
  await nextTick();
  if (event.defaultPrevented) return;
  model.value = initialValue;
  pendingCommitValue = undefined;
  touched.value = false;
  validationActive.value = false;
  nativeInvalid.value = false;
  await nextTick();
  updateValidity(false);
}

onMounted(() => {
  updateValidity(false);
  formElement = inputRef.value?.form ?? null;
  formElement?.addEventListener("reset", onFormReset);
});
onUpdated(updateValidity);
onBeforeUnmount(() => {
  formElement?.removeEventListener("reset", onFormReset);
  unregister?.();
});
</script>

<template>
  <div
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-number-field"
  >
    <div
      v-if="scrubLabel || $slots.scrub"
      aria-hidden="true"
      :class="ui?.scrubArea"
      v-bind="stateAttrs"
      class="akaza-number-field-scrub-area"
      @pointercancel="scrubbing = false"
      @pointerdown="onScrubPointerDown"
      @pointermove="onScrubPointerMove"
      @pointerup="onScrubPointerUp"
    >
      <slot name="scrub" :value="model" :is-scrubbing="scrubbing">
        {{ scrubLabel }}
      </slot>
    </div>

    <button
      type="button"
      :disabled="!canDecrement"
      :class="ui?.decrement"
      v-bind="stateAttrs"
      class="akaza-number-field-decrement"
      aria-label="Decrement"
      @click="stepBy(-1, 'decrement', $event) && commitValue('decrement', $event)"
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
      :aria-valuetext="ariaValueText"
      :class="ui?.input"
      v-bind="stateAttrs"
      class="akaza-number-field-input"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @invalid="onInvalid"
      @keydown="onKeydown"
      @wheel="onWheel"
    >

    <button
      type="button"
      :disabled="!canIncrement"
      :class="ui?.increment"
      v-bind="stateAttrs"
      class="akaza-number-field-increment"
      aria-label="Increment"
      @click="stepBy(1, 'increment', $event) && commitValue('increment', $event)"
    >
      <slot name="increment" :value="model" :increment="() => stepBy(1, 'programmatic')">+</slot>
    </button>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-number-field {
    display: inline-flex;
    align-items: center;
  }

  .akaza-number-field-scrub-area {
    touch-action: none;
    user-select: none;
  }
}
</style>
