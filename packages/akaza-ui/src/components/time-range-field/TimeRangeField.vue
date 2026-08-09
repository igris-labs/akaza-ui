<script setup lang="ts">
import type { TimeRange, TimeRangeFieldEndpoint, TimeRangeFieldProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { TimeFieldProps, TimeValue } from "../time-field";
import { Time, toTime } from "@internationalized/date";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, useId, useTemplateRef, watch } from "vue";
import { fieldContextKey } from "../field/context";
import TimeField from "../time-field/TimeField.vue";

const {
  id,
  name,
  startName,
  endName,
  locale = "en-US",
  dir = "ltr",
  placeholder,
  minValue,
  maxValue,
  isTimeUnavailable,
  granularity = "minute",
  hourCycle,
  hideTimeZone = false,
  step,
  stepSnapping = false,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  selectOnFocus = true,
  autoAdvance = true,
  startLabel = "Start time",
  endLabel = "End time",
  ariaLabel = "Time range",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<TimeRangeFieldProps>();

const emit = defineEmits<{
  "value-change": [value: TimeRange, details: AkazaChangeEventDetails];
  "value-commit": [value: TimeRange, details: AkazaChangeEventDetails];
}>();

const model = defineModel<TimeRange>({ default: () => ({}) });
const placeholderModel = defineModel<TimeValue | undefined>("placeholder");
const field = inject(fieldContextKey, null);
provide(fieldContextKey, null);

const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const validationRef = useTemplateRef<HTMLInputElement>("validationRef");
const startFieldRef = useTemplateRef<InstanceType<typeof TimeField>>("startFieldRef");
const endFieldRef = useTemplateRef<InstanceType<typeof TimeField>>("endFieldRef");
const touched = ref(false);
const focused = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const childInvalid = ref(false);
const childFilled = ref(false);
const validationMessage = ref("");
const validity = shallowRef<ValidityState | null>(null);
const initialRange = cloneRange(model.value);
let formElement: HTMLFormElement | null = null;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-time-range-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const resolvedStartName = computed(() => startName ?? (resolvedName.value ? `${resolvedName.value}.start` : undefined));
const resolvedEndName = computed(() => endName ?? (resolvedName.value ? `${resolvedName.value}.end` : undefined));
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const labelledBy = computed(() => ariaLabelledby ?? field?.labelledBy.value);
const isComplete = computed(() => Boolean(model.value.start && model.value.end));
const isFilled = computed(() => Boolean(model.value.start || model.value.end || childFilled.value));
const isDirty = computed(() => rangeKey(model.value) !== rangeKey(initialRange) || (childFilled.value && !isComplete.value));
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isComplete.value ? "complete" : isFilled.value ? "partial" : "empty");
const startFieldProps = computed<TimeFieldProps>(() => endpointFieldProps("start"));
const endFieldProps = computed<TimeFieldProps>(() => endpointFieldProps("end"));
const startFieldBindings = computed(() => ({
  ...startFieldProps.value,
  ...(model.value.start && { modelValue: model.value.start }),
  ...(placeholderModel.value && { placeholder: placeholderModel.value }),
  "onUpdate:modelValue": (value: TimeValue | undefined) => setEndpoint("start", value),
  "onUpdate:placeholder": (value: TimeValue | undefined) => { placeholderModel.value = value; },
}));
const endFieldBindings = computed(() => ({
  ...endFieldProps.value,
  ...(model.value.end && { modelValue: model.value.end }),
  ...(placeholderModel.value && { placeholder: placeholderModel.value }),
  "onUpdate:modelValue": (value: TimeValue | undefined) => setEndpoint("end", value),
  "onUpdate:placeholder": (value: TimeValue | undefined) => { placeholderModel.value = value; },
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

function asTime(value: TimeValue): Time {
  return value instanceof Time ? value : toTime(value);
}

function cloneRange(value: TimeRange): TimeRange {
  return {
    ...(value.start && { start: value.start.copy() }),
    ...(value.end && { end: value.end.copy() }),
  };
}

function rangeKey(value: TimeRange): string {
  return `${value.start ? asTime(value.start).toString() : ""}/${value.end ? asTime(value.end).toString() : ""}`;
}

function withEndpoint(endpoint: TimeRangeFieldEndpoint, value: TimeValue | undefined): TimeRange {
  const next = cloneRange(model.value);
  if (value) next[endpoint] = value.copy();
  else delete next[endpoint];
  return next;
}

function endpointFieldProps(endpoint: TimeRangeFieldEndpoint): TimeFieldProps {
  const fieldName = endpoint === "start" ? resolvedStartName.value : resolvedEndName.value;
  const fieldUi = endpoint === "start" ? ui?.startField : ui?.endField;
  return {
    id: endpoint === "start" ? resolvedId.value : `${resolvedId.value}-end`,
    locale,
    dir,
    granularity,
    disabled: isDisabled.value,
    readOnly,
    invalid,
    selectOnFocus,
    autoAdvance,
    hideTimeZone,
    stepSnapping,
    ariaLabel: endpoint === "start" ? startLabel : endLabel,
    ariaLabelledby: "",
    ...(fieldName && { name: fieldName }),
    ...(hourCycle && { hourCycle }),
    ...(placeholder && { placeholder }),
    ...(minValue && { minValue }),
    ...(maxValue && { maxValue }),
    ...(isTimeUnavailable && { isTimeUnavailable }),
    ...(step && { step }),
    ...(describedBy.value && { ariaDescribedby: describedBy.value }),
    ...(fieldUi && { ui: fieldUi }),
  };
}

function setEndpoint(endpoint: TimeRangeFieldEndpoint, value: TimeValue | undefined) {
  model.value = withEndpoint(endpoint, value);
  nextTick(syncChildState);
}

function createDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  };
  return { details, canceled: () => canceled };
}

function requestValue(value: TimeRange, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  model.value = cloneRange(value);
  nextTick(syncChildState);
  return true;
}

function onEndpointValueChange(endpoint: TimeRangeFieldEndpoint, value: TimeValue | undefined, details: AkazaChangeEventDetails) {
  const next = withEndpoint(endpoint, value);
  emit("value-change", next, {
    reason: `${endpoint}-${details.reason}`,
    ...(details.event && { event: details.event }),
    cancel: details.cancel,
  });
}

function onEndpointValueCommit(endpoint: TimeRangeFieldEndpoint, details: AkazaChangeEventDetails) {
  emit("value-commit", cloneRange(model.value), {
    reason: `${endpoint}-${details.reason}`,
    ...(details.event && { event: details.event }),
    cancel: details.cancel,
  });
}

function rangeError(): string {
  const { start, end } = model.value;
  if (childInvalid.value) return "Enter a complete, valid time range.";
  if (isRequired.value && (!start || !end)) return "Enter a start and end time.";
  if ((start && !end) || (!start && end)) return "Enter both times in the range.";
  if (!start || !end) return "";
  if (asTime(start).compare(asTime(end)) > 0) return "End time must be on or after start time.";
  if (minValue && asTime(start).compare(asTime(minValue)) < 0) return `Enter a start time on or after ${asTime(minValue).toString()}.`;
  if (maxValue && asTime(end).compare(asTime(maxValue)) > 0) return `Enter an end time on or before ${asTime(maxValue).toString()}.`;
  if (isTimeUnavailable?.(start) || isTimeUnavailable?.(end)) return "The range starts or ends at an unavailable time.";
  return "";
}

function updateValidity(reveal = validationActive.value) {
  const input = validationRef.value;
  if (!input) return;
  input.setCustomValidity(rangeError());
  validity.value = input.validity;
  validationMessage.value = input.validationMessage;
  nativeInvalid.value = reveal && !input.validity.valid;
}

function syncChildState() {
  const roots = rootRef.value?.querySelectorAll<HTMLElement>(".akaza-time-field") ?? [];
  childInvalid.value = Array.from(roots).some(root => root.dataset.akazaInvalid === "true");
  childFilled.value = Array.from(roots).some(root => root.dataset.akazaFilled === "true");
  updateValidity();
}

function onInput() {
  validationActive.value = true;
  nextTick(syncChildState);
}

function onFocusin() {
  focused.value = true;
}

function onFocusout(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  focused.value = false;
  touched.value = true;
  validationActive.value = true;
  nextTick(syncChildState);
}

function focusStart() {
  startFieldRef.value?.focus();
}

function focusEnd() {
  endFieldRef.value?.focus();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  model.value.start ? focusEnd() : focusStart();
}

function clear(event?: Event): boolean {
  return requestValue({}, "clear", event);
}

function onFormReset() {
  model.value = cloneRange(initialRange);
  touched.value = false;
  validationActive.value = false;
  childInvalid.value = false;
  nativeInvalid.value = false;
  nextTick(syncChildState);
}

watch(model, () => nextTick(syncChildState), { deep: false });

onMounted(() => {
  syncChildState();
  formElement = validationRef.value?.form ?? null;
  formElement?.addEventListener("reset", onFormReset);
});

onBeforeUnmount(() => {
  formElement?.removeEventListener("reset", onFormReset);
  unregister?.();
});

defineExpose({ clear, focusEnd, focusStart, setValue: requestValue });
</script>

<template>
  <div
    ref="rootRef"
    role="group"
    :dir="dir"
    :aria-label="labelledBy ? undefined : ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-disabled="isDisabled || undefined"
    :aria-invalid="isInvalid || undefined"
    :class="ui?.root"
    :data-akaza-state="state"
    :data-akaza-granularity="granularity"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-required="isRequired || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-dirty="isDirty || undefined"
    :data-akaza-touched="touched || undefined"
    :data-akaza-filled="isFilled || undefined"
    :data-akaza-focused="focused || undefined"
    class="akaza-time-range-field"
    @focusin="onFocusin"
    @focusout="onFocusout"
    @input="onInput"
  >
    <div
      :class="ui?.start"
      :data-akaza-state="model.start ? 'filled' : 'empty'"
      data-akaza-endpoint="start"
      class="akaza-time-range-field-start"
    >
      <TimeField
        ref="startFieldRef"
        v-bind="startFieldBindings"
        @value-change="(value, details) => onEndpointValueChange('start', value, details)"
        @value-commit="(_value, details) => onEndpointValueCommit('start', details)"
      >
        <template #literal="slotProps"><slot name="start-literal" v-bind="slotProps">{{ slotProps.value }}</slot></template>
        <template #day-period="slotProps"><slot name="start-day-period" v-bind="slotProps">{{ slotProps.label }}</slot></template>
        <template #time-zone="slotProps"><slot name="start-time-zone" v-bind="slotProps">{{ slotProps.value }}</slot></template>
      </TimeField>
    </div>

    <span aria-hidden="true" :class="ui?.separator" class="akaza-time-range-field-separator">
      <slot name="separator">–</slot>
    </span>

    <div
      :class="ui?.end"
      :data-akaza-state="model.end ? 'filled' : 'empty'"
      data-akaza-endpoint="end"
      class="akaza-time-range-field-end"
    >
      <TimeField
        ref="endFieldRef"
        v-bind="endFieldBindings"
        @value-change="(value, details) => onEndpointValueChange('end', value, details)"
        @value-commit="(_value, details) => onEndpointValueCommit('end', details)"
      >
        <template #literal="slotProps"><slot name="end-literal" v-bind="slotProps">{{ slotProps.value }}</slot></template>
        <template #day-period="slotProps"><slot name="end-day-period" v-bind="slotProps">{{ slotProps.label }}</slot></template>
        <template #time-zone="slotProps"><slot name="end-time-zone" v-bind="slotProps">{{ slotProps.value }}</slot></template>
      </TimeField>
    </div>

    <input
      ref="validationRef"
      tabindex="-1"
      aria-hidden="true"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="readOnly"
      :value="isComplete ? 'complete' : ''"
      :class="ui?.hiddenInput"
      class="akaza-time-range-field-hidden-input"
      @invalid="onInvalid"
    >
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-time-range-field {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    position: relative;
  }

  .akaza-time-range-field-start,
  .akaza-time-range-field-end {
    min-width: 0;
  }

  .akaza-time-range-field-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
