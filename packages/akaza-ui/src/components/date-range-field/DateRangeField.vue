<script setup lang="ts">
import type { DateRangeFieldEndpoint, DateRangeFieldProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CalendarDateRange, CalendarDateValue } from "../calendar";
import type { DateFieldProps } from "../date-field";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, useId, useTemplateRef, watch } from "vue";
import DateField from "../date-field/DateField.vue";
import { fieldContextKey } from "../field/context";

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
  isDateUnavailable,
  allowNonContiguousRanges = false,
  maximumDays,
  fixedDate,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  selectOnFocus = true,
  autoAdvance = true,
  startLabel = "Start date",
  endLabel = "End date",
  ariaLabel = "Date range",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<DateRangeFieldProps>();

const emit = defineEmits<{
  "value-change": [value: CalendarDateRange, details: AkazaChangeEventDetails];
  "value-commit": [value: CalendarDateRange, details: AkazaChangeEventDetails];
}>();

const model = defineModel<CalendarDateRange>({ default: () => ({}) });
const field = inject(fieldContextKey, null);
provide(fieldContextKey, null);

const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const validationRef = useTemplateRef<HTMLInputElement>("validationRef");
const startFieldRef = useTemplateRef<InstanceType<typeof DateField>>("startFieldRef");
const endFieldRef = useTemplateRef<InstanceType<typeof DateField>>("endFieldRef");
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

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-date-range-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const resolvedStartName = computed(() => startName ?? (resolvedName.value ? `${resolvedName.value}.start` : undefined));
const resolvedEndName = computed(() => endName ?? (resolvedName.value ? `${resolvedName.value}.end` : undefined));
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const labelledBy = computed(() => ariaLabelledby ?? field?.labelledBy.value);
const isComplete = computed(() => Boolean(model.value.start && model.value.end));
const isFilled = computed(() => Boolean(model.value.start || model.value.end || childFilled.value));
const isDirty = computed(() =>
  rangeKey(model.value) !== rangeKey(initialRange) || (childFilled.value && !isComplete.value),
);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isComplete.value ? "complete" : isFilled.value ? "partial" : "empty");
const startFieldProps = computed<DateFieldProps>(() => endpointFieldProps("start"));
const endFieldProps = computed<DateFieldProps>(() => endpointFieldProps("end"));
const startFieldBindings = computed(() => ({
  ...startFieldProps.value,
  ...(model.value.start && { modelValue: model.value.start }),
  "onUpdate:modelValue": (value: CalendarDateValue | undefined) => setEndpoint("start", value),
}));
const endFieldBindings = computed(() => ({
  ...endFieldProps.value,
  ...(model.value.end && { modelValue: model.value.end }),
  "onUpdate:modelValue": (value: CalendarDateValue | undefined) => setEndpoint("end", value),
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

function cloneRange(value: CalendarDateRange): CalendarDateRange {
  return {
    ...(value.start && { start: value.start.copy() }),
    ...(value.end && { end: value.end.copy() }),
  };
}

function rangeKey(value: CalendarDateRange): string {
  return `${value.start?.toString() ?? ""}/${value.end?.toString() ?? ""}`;
}

function withEndpoint(endpoint: DateRangeFieldEndpoint, value: CalendarDateValue | undefined): CalendarDateRange {
  const next = cloneRange(model.value);
  if (value) next[endpoint] = value.copy();
  else delete next[endpoint];
  return next;
}

function endpointFieldProps(endpoint: DateRangeFieldEndpoint): DateFieldProps {
  const fieldName = endpoint === "start" ? resolvedStartName.value : resolvedEndName.value;
  const fieldUi = endpoint === "start" ? ui?.startField : ui?.endField;
  return {
    id: endpoint === "start" ? resolvedId.value : `${resolvedId.value}-end`,
    locale,
    dir,
    disabled: isDisabled.value,
    readOnly: readOnly || fixedDate === endpoint,
    invalid,
    selectOnFocus,
    autoAdvance,
    ariaLabel: endpoint === "start" ? startLabel : endLabel,
    ariaLabelledby: "",
    ...(fieldName && { name: fieldName }),
    ...(placeholder && { placeholder }),
    ...(minValue && { minValue }),
    ...(maxValue && { maxValue }),
    ...(isDateUnavailable && { isDateUnavailable }),
    ...(describedBy.value && { ariaDescribedby: describedBy.value }),
    ...(fieldUi && { ui: fieldUi }),
  };
}

function setEndpoint(endpoint: DateRangeFieldEndpoint, value: CalendarDateValue | undefined) {
  model.value = withEndpoint(endpoint, value);
  nextTick(syncChildState);
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

function requestValue(value: CalendarDateRange, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  model.value = cloneRange(value);
  nextTick(syncChildState);
  return true;
}

function onEndpointValueChange(
  endpoint: DateRangeFieldEndpoint,
  value: CalendarDateValue | undefined,
  details: AkazaChangeEventDetails,
) {
  const next = withEndpoint(endpoint, value);
  emit("value-change", next, {
    reason: `${endpoint}-${details.reason}`,
    ...(details.event && { event: details.event }),
    cancel: details.cancel,
  });
}

function onEndpointValueCommit(endpoint: DateRangeFieldEndpoint, details: AkazaChangeEventDetails) {
  emit("value-commit", cloneRange(model.value), {
    reason: `${endpoint}-${details.reason}`,
    ...(details.event && { event: details.event }),
    cancel: details.cancel,
  });
}

function onStartValueChange(value: CalendarDateValue | undefined, details: AkazaChangeEventDetails) {
  onEndpointValueChange("start", value, details);
}

function onEndValueChange(value: CalendarDateValue | undefined, details: AkazaChangeEventDetails) {
  onEndpointValueChange("end", value, details);
}

function onStartValueCommit(_value: CalendarDateValue | undefined, details: AkazaChangeEventDetails) {
  onEndpointValueCommit("start", details);
}

function onEndValueCommit(_value: CalendarDateValue | undefined, details: AkazaChangeEventDetails) {
  onEndpointValueCommit("end", details);
}

function eachDate(start: CalendarDateValue, end: CalendarDateValue, callback: (date: CalendarDateValue, day: number) => boolean): boolean {
  let date = start;
  let day = 1;
  while (date.compare(end) <= 0) {
    if (callback(date, day)) return true;
    date = date.add({ days: 1 });
    day += 1;
  }
  return false;
}

function rangeError(): string {
  const { start, end } = model.value;
  if (childInvalid.value) return "Enter a complete, valid date range.";
  if (isRequired.value && (!start || !end)) return "Enter a start and end date.";
  if ((start && !end) || (!start && end)) return "Enter both dates in the range.";
  if (!start || !end) return "";
  if (start.compare(end) > 0) return "End date must be on or after start date.";
  if (minValue && start.compare(minValue) < 0) return `Enter a start date on or after ${minValue.toString()}.`;
  if (maxValue && end.compare(maxValue) > 0) return `Enter an end date on or before ${maxValue.toString()}.`;
  if (isDateUnavailable?.(start) || isDateUnavailable?.(end)) return "The range starts or ends on an unavailable date.";
  const limit = maximumDays === undefined ? undefined : Math.max(1, Math.floor(maximumDays));
  let exceededLimit = false;
  let containsUnavailable = false;
  eachDate(start, end, (date, day) => {
    if (limit !== undefined && day > limit) {
      exceededLimit = true;
      return true;
    }
    if (allowNonContiguousRanges && day > 1 && date.compare(end) < 0) return false;
    containsUnavailable = isDateUnavailable?.(date) ?? false;
    return containsUnavailable;
  });
  if (exceededLimit) return `Select no more than ${limit} days.`;
  if (containsUnavailable) return "The range contains an unavailable date.";
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
  const roots = rootRef.value?.querySelectorAll<HTMLElement>(".akaza-date-field") ?? [];
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
  nextTick(() => syncChildState());
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
    :data-akaza-fixed-date="fixedDate"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-required="isRequired || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-dirty="isDirty || undefined"
    :data-akaza-touched="touched || undefined"
    :data-akaza-filled="isFilled || undefined"
    :data-akaza-focused="focused || undefined"
    class="akaza-date-range-field"
    @focusin="onFocusin"
    @focusout="onFocusout"
    @input="onInput"
  >
    <div
      :class="ui?.start"
      :data-akaza-state="model.start ? 'filled' : 'empty'"
      data-akaza-endpoint="start"
      class="akaza-date-range-field-start"
    >
      <DateField
        ref="startFieldRef"
        v-bind="startFieldBindings"
        @value-change="onStartValueChange"
        @value-commit="onStartValueCommit"
      >
        <template #literal="{ value }">
          <slot name="start-literal" :value="value">{{ value }}</slot>
        </template>
      </DateField>
    </div>

    <span aria-hidden="true" :class="ui?.separator" class="akaza-date-range-field-separator">
      <slot name="separator">–</slot>
    </span>

    <div
      :class="ui?.end"
      :data-akaza-state="model.end ? 'filled' : 'empty'"
      data-akaza-endpoint="end"
      class="akaza-date-range-field-end"
    >
      <DateField
        ref="endFieldRef"
        v-bind="endFieldBindings"
        @value-change="onEndValueChange"
        @value-commit="onEndValueCommit"
      >
        <template #literal="{ value }">
          <slot name="end-literal" :value="value">{{ value }}</slot>
        </template>
      </DateField>
    </div>

    <input
      ref="validationRef"
      tabindex="-1"
      aria-hidden="true"
      :disabled="isDisabled"
      :value="isComplete ? 'complete' : ''"
      :class="ui?.hiddenInput"
      class="akaza-date-range-field-hidden-input"
      @invalid="onInvalid"
    >
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-date-range-field {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    position: relative;
  }

  .akaza-date-range-field-start,
  .akaza-date-range-field-end {
    min-width: 0;
  }

  .akaza-date-range-field-hidden-input {
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
