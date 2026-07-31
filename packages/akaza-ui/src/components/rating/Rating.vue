<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { RatingProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId } from "vue";
import { fieldContextKey } from "../field/context";

const {
  length = 5,
  step = 1,
  clearable = false,
  hoverable = false,
  loop = true,
  orientation = "horizontal",
  dir = "ltr",
  autoFocus = false,
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  ariaLabel = "Rating",
  ariaLabelledby,
  ariaDescribedby,
  getValueLabel,
  ui,
} = defineProps<RatingProps>();

const emit = defineEmits<{
  "value-change": [value: number, details: AkazaChangeEventDetails];
  "hover-change": [value: number | null, details: AkazaChangeEventDetails];
}>();

const model = defineModel<number>({ default: 0 });
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = ref<HTMLElement | null>(null);
const hiddenRef = ref<HTMLInputElement | null>(null);
const radioRefs = ref<Array<HTMLButtonElement | null>>([]);
const hoveredValue = ref<number | null>(null);
const focusedValue = ref<number | null>(null);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const initialValue = model.value;

const safeLength = computed(() => Math.max(1, Math.floor(length)));
const safeStep = computed(() => Math.min(1, Math.max(0.01, step)));
const items = computed(() => Array.from({ length: safeLength.value }, (_, index) => index + 1));
const values = computed(() => items.value.flatMap(stepsForItem));
const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-rating-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const normalizedValue = computed(() => normalize(model.value));
const displayValue = computed(() => hoveredValue.value ?? normalizedValue.value);
const isFilled = computed(() => normalizedValue.value > 0);
const isDirty = computed(() => model.value !== initialValue);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isFilled.value ? "selected" : "empty");
const tabStopValue = computed(() => focusedValue.value ?? (normalizedValue.value > 0 ? normalizedValue.value : values.value[0]));

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function round(value: number): number {
  return Number(value.toFixed(6));
}

function normalize(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.min(safeLength.value, Math.max(0, value));
  if (clamped === 0) return 0;
  return round(Math.round(clamped / safeStep.value) * safeStep.value);
}

function stepsForItem(item: number): number[] {
  const itemValues: number[] = [];
  for (let fraction = safeStep.value; fraction < 1; fraction += safeStep.value) {
    itemValues.push(round(item - 1 + fraction));
  }
  itemValues.push(item);
  return itemValues;
}

function createDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  };
  return { details, canceled: () => canceled };
}

function valueLabel(value: number): string {
  return getValueLabel?.(value, safeLength.value) ?? `${value} of ${safeLength.value}`;
}

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isFilled.value ? "Select a rating." : "");
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function setValue(value: number, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const next = clearable && normalize(value) === normalizedValue.value && reason === "trigger" ? 0 : normalize(value);
  if (next === normalizedValue.value) return true;
  const change = createDetails(reason, event);
  emit("value-change", next, change.details);
  if (change.canceled()) return false;
  validationActive.value = true;
  touched.value = true;
  model.value = next;
  focusedValue.value = next || values.value[0] || null;
  nextTick(updateValidity);
  return true;
}

function setHover(value: number | null, event?: Event) {
  if (!hoverable || isDisabled.value || readOnly) return;
  const change = createDetails(value === null ? "leave" : "pointer", event);
  emit("hover-change", value, change.details);
  if (!change.canceled()) hoveredValue.value = value;
}

function itemFill(item: number): number {
  return Math.min(100, Math.max(0, (displayValue.value - (item - 1)) * 100));
}

function itemState(item: number): "active" | "inactive" | "partial" {
  const fill = itemFill(item);
  if (fill >= 100) return "active";
  if (fill > 0) return "partial";
  return "inactive";
}

function stepWidth(value: number, item: number): number {
  return Math.min(100, Math.max(0, (value - (item - 1)) * 100));
}

function setRadioRef(element: Element | ComponentPublicInstance | null, index: number) {
  radioRefs.value[index] = element as HTMLButtonElement | null;
}

function focusValue(value: number) {
  const index = values.value.indexOf(value);
  if (index < 0) return;
  focusedValue.value = value;
  radioRefs.value[index]?.focus();
}

function move(value: number, delta: number, event: KeyboardEvent) {
  const index = values.value.indexOf(value);
  if (index < 0) return;
  let next = index + delta;
  if (loop) next = (next + values.value.length) % values.value.length;
  else next = Math.min(values.value.length - 1, Math.max(0, next));
  const nextValue = values.value[next];
  if (nextValue === undefined) return;
  focusValue(nextValue);
  setValue(nextValue, "keyboard", event);
}

function onKeydown(value: number, event: KeyboardEvent) {
  const previousKey = orientation === "vertical" ? "ArrowUp" : dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const nextKey = orientation === "vertical" ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  if (event.key === previousKey || event.key === nextKey) {
    event.preventDefault();
    move(value, event.key === nextKey ? 1 : -1, event);
  } else if (event.key === "Home") {
    event.preventDefault();
    const next = values.value[0];
    if (next !== undefined) {
      focusValue(next);
      setValue(next, "keyboard", event);
    }
  } else if (event.key === "End") {
    event.preventDefault();
    const next = values.value[values.value.length - 1];
    if (next !== undefined) {
      focusValue(next);
      setValue(next, "keyboard", event);
    }
  } else if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    setValue(value, "trigger", event);
  }
}

function onFocusIn() {
  focused.value = true;
}

function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  focused.value = false;
  touched.value = true;
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  const target = normalizedValue.value || values.value[0];
  if (target !== undefined) nextTick(() => focusValue(target));
}

function clear(event?: Event) {
  setValue(0, "clear", event);
}

defineExpose({ clear, focus: () => focusValue(normalizedValue.value || values.value[0] || 0) });

onMounted(() => {
  updateValidity(false);
  if (autoFocus) nextTick(() => focusValue(normalizedValue.value || values.value[0] || 0));
});
onUpdated(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <div
    ref="rootRef"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="describedBy"
    :aria-orientation="orientation"
    :aria-required="isRequired || undefined"
    :aria-readonly="readOnly || undefined"
    :aria-disabled="isDisabled || undefined"
    :class="ui?.root"
    class="akaza-rating"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-focused="focused || undefined"
    :dir="dir"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @mouseleave="setHover(null, $event)"
  >
    <input
      :id="resolvedId"
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="normalizedValue || ''"
      :required="isRequired"
      :disabled="isDisabled"
      aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-rating-hidden-input"
      @focus="focusValue(normalizedValue || values[0] || 0)"
      @invalid="onInvalid"
    >

    <span
      v-for="item in items"
      :key="item"
      role="presentation"
      :class="ui?.item"
      class="akaza-rating-item"
      :data-akaza-state="itemState(item)"
      :data-state="itemState(item)"
      :data-akaza-value="item"
    >
      <slot
        name="item"
        :item="item"
        :value="normalizedValue"
        :preview-value="displayValue"
        :fill="itemFill(item)"
        :state="itemState(item)"
      >
        <span :class="ui?.base" class="akaza-rating-base" aria-hidden="true">
          <slot name="empty" :item="item">☆</slot>
        </span>
        <span
          :class="ui?.fill"
          :style="{ width: `${itemFill(item)}%`, '--akaza-rating-item-fill': `${itemFill(item)}%` }"
          class="akaza-rating-fill"
          aria-hidden="true"
        >
          <span :class="ui?.fillIcon" class="akaza-rating-fill-icon">
            <slot name="filled" :item="item">★</slot>
          </span>
        </span>
      </slot>

      <button
        v-for="(value, stepIndex) in stepsForItem(item)"
        :key="value"
        :ref="(element) => setRadioRef(element, values.indexOf(value))"
        type="button"
        role="radio"
        :aria-checked="normalizedValue === value"
        :aria-label="valueLabel(value)"
        :aria-disabled="isDisabled || undefined"
        :tabindex="tabStopValue === value && !isDisabled ? 0 : -1"
        :disabled="isDisabled"
        :class="ui?.radio"
        :style="{
          width: `${stepWidth(value, item)}%`,
          zIndex: stepsForItem(item).length - stepIndex,
          '--akaza-rating-step-width': `${stepWidth(value, item)}%`,
          '--akaza-rating-step-z-index': stepsForItem(item).length - stepIndex,
        }"
        class="akaza-rating-radio"
        :data-akaza-state="normalizedValue === value ? 'checked' : 'unchecked'"
        :data-state="normalizedValue === value ? 'checked' : 'unchecked'"
        :data-akaza-highlighted="displayValue >= value || undefined"
        :data-akaza-value="value"
        :data-akaza-disabled="isDisabled || undefined"
        @click="setValue(value, 'trigger', $event)"
        @focus="focusedValue = value"
        @keydown="onKeydown(value, $event)"
        @mouseenter="setHover(value, $event)"
      >
        <slot name="radio" :value="value" :label="valueLabel(value)" />
      </button>
    </span>

    <slot
      name="state"
      :value="normalizedValue"
      :preview-value="displayValue"
      :items="items"
      :hovered-value="hoveredValue"
      :clear="clear"
    />
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-rating {
    position: relative;
    display: inline-flex;
    min-width: 0;
  }

  .akaza-rating[data-akaza-orientation="vertical"] {
    flex-direction: column;
  }

  .akaza-rating-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .akaza-rating-item {
    position: relative;
    display: inline-block;
  }

  .akaza-rating-base,
  .akaza-rating-fill-icon {
    display: block;
  }

  .akaza-rating-fill {
    position: absolute;
    inset: 0 auto 0 0;
    overflow: hidden;
    pointer-events: none;
  }

  .akaza-rating[dir="rtl"] .akaza-rating-fill,
  .akaza-rating[dir="rtl"] .akaza-rating-radio {
    inset: 0 0 0 auto;
  }

  .akaza-rating-fill-icon {
    width: max-content;
  }

  .akaza-rating-radio {
    position: absolute;
    inset: 0 auto 0 0;
    border: 0;
    background: transparent;
    color: transparent;
    cursor: pointer;
  }
}
</style>
