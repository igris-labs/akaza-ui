<script setup lang="ts">
import type { SliderProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, useTemplateRef } from "vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  required = false,
  disabled = false,
  invalid = false,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  getValueLabel,
  ui,
} = defineProps<SliderProps>();

const emit = defineEmits<{
  "value-change": [value: number, details: AkazaChangeEventDetails];
  "value-commit": [value: number, details: AkazaChangeEventDetails];
}>();

const model = defineModel<number>({ default: 0 });
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const touched = ref(false);
const focused = ref(false);
const dragging = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const initialValue = model.value;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-slider-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const clampedValue = computed(() => clamp(model.value));
const percentage = computed(() => {
  const range = max - min;
  if (range <= 0) return 0;
  return Math.min(100, Math.max(0, ((clampedValue.value - min) / range) * 100));
});
const ariaValueText = computed(() => getValueLabel?.(clampedValue.value, max));
const isDirty = computed(() => model.value !== initialValue);
const isFilled = computed(() => true);
const stateAttrs = computed(() => ({
  "data-akaza-orientation": orientation,
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dragging": dragging.value || undefined,
  "data-akaza-focused": focused.value || undefined,
}));
const rootStyle = computed(() => ({
  "--akaza-slider-percentage": `${percentage.value}%`,
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
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function snap(value: number): number {
  if (step <= 0) return value;
  const snapped = Math.round((value - min) / step) * step + min;
  return Number(snapped.toFixed(Math.max(decimals(step), decimals(min))));
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

function setValue(value: number, reason: string, event?: Event) {
  if (isDisabled.value) return;
  const next = normalize(value);
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

function commitValue(reason: string, event?: Event) {
  emit("value-commit", model.value, {
    reason,
    ...(event && { event }),
    cancel: () => {},
  });
}

function valueFromPointer(event: PointerEvent): number {
  const root = rootRef.value;
  if (!root) return model.value;
  const rect = root.getBoundingClientRect();
  const ratio = orientation === "vertical"
    ? 1 - ((event.clientY - rect.top) / rect.height)
    : (event.clientX - rect.left) / rect.width;
  return min + Math.min(1, Math.max(0, ratio)) * (max - min);
}

function onPointerDown(event: PointerEvent) {
  if (isDisabled.value) return;
  dragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setValue(valueFromPointer(event), "pointer", event);
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return;
  setValue(valueFromPointer(event), "pointer", event);
}

function onPointerUp(event: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  commitValue("pointer", event);
}

function onKeydown(event: KeyboardEvent) {
  const decrementKeys = orientation === "vertical" ? ["ArrowDown", "ArrowLeft"] : ["ArrowLeft", "ArrowDown"];
  const incrementKeys = orientation === "vertical" ? ["ArrowUp", "ArrowRight"] : ["ArrowRight", "ArrowUp"];
  if (incrementKeys.includes(event.key)) {
    event.preventDefault();
    setValue(model.value + step, "keyboard", event);
  } else if (decrementKeys.includes(event.key)) {
    event.preventDefault();
    setValue(model.value - step, "keyboard", event);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    setValue(model.value + step * 10, "keyboard", event);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    setValue(model.value - step * 10, "keyboard", event);
  } else if (event.key === "Home") {
    event.preventDefault();
    setValue(min, "keyboard", event);
  } else if (event.key === "End") {
    event.preventDefault();
    setValue(max, "keyboard", event);
  } else {
    return;
  }
  commitValue("keyboard", event);
}

onMounted(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <span
    ref="rootRef"
    :class="ui?.root"
    :style="rootStyle"
    v-bind="stateAttrs"
    class="akaza-slider"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="dragging = false"
  >
    <input
      v-if="resolvedName"
      ref="inputRef"
      type="range"
      :name="resolvedName"
      :value="clampedValue"
      :min="min"
      :max="max"
      :step="step"
      :required="isRequired"
      :disabled="isDisabled"
      :class="ui?.input"
      class="akaza-slider-input"
      tabindex="-1"
      aria-hidden="true"
      @invalid="updateValidity"
    >

    <span
      :class="ui?.track"
      v-bind="stateAttrs"
      class="akaza-slider-track"
    >
      <span
        :class="ui?.range"
        v-bind="stateAttrs"
        class="akaza-slider-range"
      >
        <slot name="range" :value="clampedValue" :percentage="percentage" />
      </span>
    </span>

    <span
      :id="resolvedId"
      role="slider"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="describedBy"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="clampedValue"
      :aria-valuetext="ariaValueText"
      :aria-orientation="orientation"
      :aria-disabled="isDisabled || undefined"
      :aria-invalid="isInvalid || undefined"
      :tabindex="isDisabled ? -1 : 0"
      :class="ui?.thumb"
      v-bind="stateAttrs"
      class="akaza-slider-thumb"
      @blur="focused = false; touched = true"
      @focus="focused = true"
      @keydown="onKeydown"
    >
      <slot name="thumb" :value="clampedValue" :percentage="percentage" />
    </span>
  </span>
</template>

<style>
.akaza-slider {
  position: relative;
  display: flex;
  align-items: center;
  touch-action: none;
  user-select: none;
}

.akaza-slider[data-akaza-orientation="vertical"] {
  flex-direction: column;
}

.akaza-slider-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.akaza-slider-track {
  position: relative;
  flex: 1;
}

.akaza-slider-range {
  position: absolute;
}

.akaza-slider[data-akaza-orientation="horizontal"] .akaza-slider-range {
  left: 0;
  width: var(--akaza-slider-percentage);
}

.akaza-slider[data-akaza-orientation="vertical"] .akaza-slider-range {
  bottom: 0;
  height: var(--akaza-slider-percentage);
}

.akaza-slider-thumb {
  position: absolute;
}

.akaza-slider[data-akaza-orientation="horizontal"] .akaza-slider-thumb {
  left: var(--akaza-slider-percentage);
  transform: translateX(-50%);
}

.akaza-slider[data-akaza-orientation="vertical"] .akaza-slider-thumb {
  bottom: var(--akaza-slider-percentage);
  transform: translateY(50%);
}
</style>
