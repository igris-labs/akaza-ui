<script setup lang="ts">
import type { SliderProps, SliderValue } from ".";
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
  minStepsBetweenThumbs = 0,
  inverted = false,
  thumbAlignment = "center",
  required = false,
  disabled = false,
  invalid = false,
  ariaLabel,
  ariaLabels,
  ariaLabelledby,
  ariaDescribedby,
  getValueLabel,
  ui,
} = defineProps<SliderProps>();

const emit = defineEmits<{
  "value-change": [value: SliderValue, details: AkazaChangeEventDetails];
  "value-commit": [value: SliderValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<SliderValue>({ default: 0 });
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const thumbRefs = ref<Array<HTMLElement | null>>([]);
const touched = ref(false);
const focused = ref(false);
const validationActive = ref(false);
const dragging = ref(false);
const activeThumbIndex = ref(0);
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
const values = computed(() => toValues(model.value).map((value) => normalize(value)));
const percentages = computed(() => values.value.map((value) => getPercentage(value)));
const clampedValue = computed(() => isMultipleValue(model.value) ? values.value : values.value[0]!);
const percentage = computed(() => percentages.value[0] ?? 0);
const rangeStartPercentage = computed(() => {
  if (percentages.value.length > 1) return Math.min(...percentages.value);
  return inverted ? percentage.value : 0;
});
const rangeEndPercentage = computed(() => {
  if (percentages.value.length > 1) return Math.max(...percentages.value);
  return inverted ? 100 : percentage.value;
});
const ariaValueText = computed(() => getValueLabel?.(values.value[0]!, max));
const isDirty = computed(() => JSON.stringify(model.value) !== JSON.stringify(initialValue));
const isFilled = computed(() => values.value.length > 0);
const stateAttrs = computed(() => ({
  "data-akaza-orientation": orientation,
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dragging": dragging.value || undefined,
  "data-akaza-focused": focused.value || undefined,
  "data-akaza-inverted": inverted || undefined,
  "data-akaza-thumb-alignment": thumbAlignment,
}));
const rootStyle = computed(() => ({
  "--akaza-slider-percentage": `${percentage.value}%`,
  "--akaza-slider-start-percentage": `${rangeStartPercentage.value}%`,
  "--akaza-slider-end-percentage": `${rangeEndPercentage.value}%`,
}));

function getPercentage(value: number): number {
  const range = max - min;
  if (range <= 0) return 0;
  const raw = Math.min(100, Math.max(0, ((value - min) / range) * 100));
  return inverted ? 100 - raw : raw;
}

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

function isMultipleValue(value: SliderValue): value is number[] {
  return Array.isArray(value);
}

function toValues(value: SliderValue): number[] {
  const next = Array.isArray(value) ? [...value].sort((a, b) => a - b) : [value];
  return next.length ? next : [min];
}

function updateValidity(reveal = validationActive.value) {
  const input = inputRef.value;
  if (!input) return;
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function getOutputValue(nextValues: number[]): SliderValue {
  return isMultipleValue(model.value) ? nextValues : nextValues[0]!;
}

function getClosestThumbIndex(value: number): number {
  let closestIndex = 0;
  let closestDistance = Infinity;
  values.value.forEach((item, index) => {
    const distance = Math.abs(item - value);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

function setThumbRef(el: HTMLElement | null, index: number) {
  thumbRefs.value[index] = el;
}

function getThumbStyle(value: number) {
  const position = `${getPercentage(value)}%`;
  return orientation === "vertical"
    ? { bottom: position }
    : { left: position };
}

function getThumbAriaLabel(index: number): string | undefined {
  if (ariaLabels?.[index]) return ariaLabels[index];
  if (ariaLabel && values.value.length > 1) return `${ariaLabel} ${index + 1}`;
  return ariaLabel;
}

function setValueAt(index: number, value: number, reason: string, event?: Event) {
  if (isDisabled.value) return;
  validationActive.value = true;
  const nextValues = [...values.value];
  const gap = Math.max(0, minStepsBetweenThumbs) * step;
  let nextThumbValue = normalize(value);
  const previous = nextValues[index - 1];
  const next = nextValues[index + 1];
  if (previous !== undefined) nextThumbValue = Math.max(nextThumbValue, previous + gap);
  if (next !== undefined) nextThumbValue = Math.min(nextThumbValue, next - gap);
  nextValues[index] = normalize(nextThumbValue);
  const outputValue = getOutputValue(nextValues);
  let canceled = false;
  emit("value-change", outputValue, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) model.value = outputValue;
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
  if (!root) return values.value[activeThumbIndex.value] ?? min;
  const rect = root.getBoundingClientRect();
  const visualRatio = orientation === "vertical"
    ? 1 - ((event.clientY - rect.top) / rect.height)
    : (event.clientX - rect.left) / rect.width;
  const ratio = inverted ? 1 - visualRatio : visualRatio;
  return min + Math.min(1, Math.max(0, ratio)) * (max - min);
}

function onPointerDown(event: PointerEvent) {
  if (isDisabled.value) return;
  const nextValue = valueFromPointer(event);
  activeThumbIndex.value = getClosestThumbIndex(nextValue);
  dragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setValueAt(activeThumbIndex.value, nextValue, "pointer", event);
  thumbRefs.value[activeThumbIndex.value]?.focus();
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return;
  setValueAt(activeThumbIndex.value, valueFromPointer(event), "pointer", event);
}

function onPointerUp(event: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  commitValue("pointer", event);
}

function onKeydown(event: KeyboardEvent, index: number) {
  const decrementKeys = orientation === "vertical" ? ["ArrowDown", "ArrowLeft"] : ["ArrowLeft", "ArrowDown"];
  const incrementKeys = orientation === "vertical" ? ["ArrowUp", "ArrowRight"] : ["ArrowRight", "ArrowUp"];
  const current = values.value[index] ?? min;
  if (incrementKeys.includes(event.key)) {
    event.preventDefault();
    setValueAt(index, current + step, "keyboard", event);
  } else if (decrementKeys.includes(event.key)) {
    event.preventDefault();
    setValueAt(index, current - step, "keyboard", event);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    setValueAt(index, current + step * 10, "keyboard", event);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    setValueAt(index, current - step * 10, "keyboard", event);
  } else if (event.key === "Home") {
    event.preventDefault();
    setValueAt(index, min, "keyboard", event);
  } else if (event.key === "End") {
    event.preventDefault();
    setValueAt(index, max, "keyboard", event);
  } else {
    return;
  }
  commitValue("keyboard", event);
}

function onInvalid() {
  validationActive.value = true;
  updateValidity();
}

onMounted(() => updateValidity(false));
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
      v-if="resolvedName && values.length === 1"
      ref="inputRef"
      type="range"
      :name="resolvedName"
      :value="values[0]"
      :min="min"
      :max="max"
      :step="step"
      :required="isRequired"
      :disabled="isDisabled"
      :class="ui?.input"
      class="akaza-slider-input"
      tabindex="-1"
      aria-hidden="true"
      @invalid="onInvalid"
    >
    <template v-if="resolvedName && values.length > 1">
      <input
        v-for="(value, index) in values"
        :key="index"
        type="hidden"
        :name="resolvedName"
        :value="value"
        :class="ui?.input"
        class="akaza-slider-input"
      >
    </template>

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
        <slot name="range" :value="clampedValue" :values="values" :percentage="percentage" :percentages="percentages" />
      </span>
    </span>

    <span
      v-for="(value, index) in values"
      :id="resolvedId"
      :key="index"
      :ref="(el) => setThumbRef(el as HTMLElement | null, index)"
      role="slider"
      :aria-label="getThumbAriaLabel(index)"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="describedBy"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="value"
      :aria-valuetext="getValueLabel?.(value, max) ?? (index === 0 ? ariaValueText : undefined)"
      :aria-orientation="orientation"
      :aria-disabled="isDisabled || undefined"
      :aria-invalid="isInvalid || undefined"
      :tabindex="isDisabled ? -1 : 0"
      :class="ui?.thumb"
      :style="getThumbStyle(value)"
      v-bind="stateAttrs"
      :data-akaza-thumb-index="index"
      class="akaza-slider-thumb"
      @blur="focused = false; touched = true"
      @focus="focused = true; activeThumbIndex = index"
      @keydown="onKeydown($event, index)"
    >
      <slot name="thumb" :value="value" :values="values" :index="index" :percentage="percentages[index]" :percentages="percentages" />
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
  left: var(--akaza-slider-start-percentage);
  width: calc(var(--akaza-slider-end-percentage) - var(--akaza-slider-start-percentage));
}

.akaza-slider[data-akaza-orientation="vertical"] .akaza-slider-range {
  bottom: var(--akaza-slider-start-percentage);
  height: calc(var(--akaza-slider-end-percentage) - var(--akaza-slider-start-percentage));
}

.akaza-slider-thumb {
  position: absolute;
}

.akaza-slider[data-akaza-orientation="horizontal"] .akaza-slider-thumb {
  transform: translateX(-50%);
}

.akaza-slider[data-akaza-orientation="vertical"] .akaza-slider-thumb {
  transform: translateY(50%);
}
</style>
