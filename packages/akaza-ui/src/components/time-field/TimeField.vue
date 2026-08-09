<script setup lang="ts">
import type { TimeFieldProps, TimeFieldSegment, TimeValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { Time, toTime } from "@internationalized/date";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, useTemplateRef, watch } from "vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
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
  ariaLabel = "Time",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<TimeFieldProps>();

const emit = defineEmits<{
  "value-change": [value: TimeValue | undefined, details: AkazaChangeEventDetails];
  "value-commit": [value: TimeValue | undefined, details: AkazaChangeEventDetails];
}>();

const model = defineModel<TimeValue>();
const placeholderModel = defineModel<TimeValue | undefined>("placeholder");
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const hiddenRef = useTemplateRef<HTMLInputElement>("hiddenRef");
const segmentRefs = new Map<TimeFieldSegment, HTMLInputElement>();
const values = reactive<Record<TimeFieldSegment, string>>({ hour: "", minute: "", second: "" });
const dayPeriod = ref<"am" | "pm">("am");
const focusedPart = ref<TimeFieldSegment | "dayPeriod" | null>(null);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const initialValue = model.value;
let formElement: HTMLFormElement | null = null;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-time-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const labelledBy = computed(() => ariaLabelledby ?? field?.labelledBy.value);
const resolvedHourCycle = computed<12 | 24>(() => {
  if (hourCycle) return hourCycle;
  return new Intl.DateTimeFormat(locale, { hour: "numeric" })
    .formatToParts(new Date(2006, 10, 22, 13))
    .some(part => part.type === "dayPeriod") ? 12 : 24;
});
const includedSegments = computed<TimeFieldSegment[]>(() => {
  if (granularity === "hour") return ["hour"];
  if (granularity === "second") return ["hour", "minute", "second"];
  return ["hour", "minute"];
});
const parts = computed(() => getParts());
const focusableParts = computed<Array<TimeFieldSegment | "dayPeriod">>(() => parts.value
  .filter(part => part.type !== "literal")
  .map(part => part.type as TimeFieldSegment | "dayPeriod"));
const firstSegment = computed<TimeFieldSegment>(() => includedSegments.value[0] ?? "hour");
const isFocused = computed(() => focusedPart.value !== null);
const isFilled = computed(() => includedSegments.value.some(segment => values[segment] !== ""));
const isComplete = computed(() => includedSegments.value.every(segment => values[segment].length === 2));
const isDirty = computed(() => timeKey(model.value) !== timeKey(initialValue) || (model.value === undefined && isFilled.value));
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isComplete.value ? "complete" : isFilled.value ? "partial" : "empty");
const baseValue = computed<TimeValue>(() => model.value ?? placeholderModel.value ?? placeholder ?? new Time());
const zoneLabel = computed(() => {
  const value = model.value ?? placeholderModel.value ?? placeholder;
  if (!value || !("timeZone" in value)) return "";
  return value.timeZone;
});
const dayPeriodLabels = computed(() => ({
  am: formatDayPeriod(9),
  pm: formatDayPeriod(21),
}));

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused: isFocused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function getParts(): Array<{ type: TimeFieldSegment | "dayPeriod" | "literal"; value: string }> {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    hourCycle: resolvedHourCycle.value === 12 ? "h12" : "h23",
    ...(granularity !== "hour" && { minute: "2-digit" }),
    ...(granularity === "second" && { second: "2-digit" }),
  };
  return new Intl.DateTimeFormat(locale, options)
    .formatToParts(new Date(2006, 10, 22, 13, 45, 30))
    .filter(({ type }) => type === "hour" || type === "minute" || type === "second" || type === "dayPeriod" || type === "literal")
    .map(({ type, value }) => ({ type: type as TimeFieldSegment | "dayPeriod" | "literal", value }));
}

function formatDayPeriod(hour: number): string {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", hourCycle: "h12" })
    .formatToParts(new Date(2006, 10, 22, hour))
    .find(part => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM");
}

function asTime(value: TimeValue): Time {
  return value instanceof Time ? value : toTime(value);
}

function timeKey(value: TimeValue | undefined): string {
  return value ? asTime(value).toString() : "";
}

function segmentLabel(segment: TimeFieldSegment): string {
  return new Intl.DisplayNames(locale, { type: "dateTimeField" }).of(segment) ?? segment;
}

function segmentMin(segment: TimeFieldSegment): number {
  return segment === "hour" && resolvedHourCycle.value === 12 ? 1 : 0;
}

function segmentMax(segment: TimeFieldSegment): number {
  if (segment === "hour") return resolvedHourCycle.value === 12 ? 12 : 23;
  return 59;
}

function segmentStep(segment: TimeFieldSegment): number {
  return Math.max(1, Math.floor(step?.[segment] ?? 1));
}

function displayHour(hour: number): number {
  if (resolvedHourCycle.value === 24) return hour;
  return hour % 12 || 12;
}

function syncSegments(value: TimeValue | undefined) {
  if (!value) {
    values.hour = "";
    values.minute = "";
    values.second = "";
    return;
  }
  const time = asTime(value);
  values.hour = String(displayHour(time.hour)).padStart(2, "0");
  values.minute = String(time.minute).padStart(2, "0");
  values.second = String(time.second).padStart(2, "0");
  dayPeriod.value = time.hour >= 12 ? "pm" : "am";
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

function snapValue(value: TimeValue): TimeValue {
  if (!stepSnapping || !step) return value;
  const interval = (step.hour ?? 0) * 3600 + (step.minute ?? 0) * 60 + (step.second ?? 0);
  if (interval <= 0) return value;
  const current = asTime(value);
  const total = current.hour * 3600 + current.minute * 60 + current.second;
  const snapped = Math.min(86399, Math.max(0, Math.round(total / interval) * interval));
  return value.set({
    hour: Math.floor(snapped / 3600),
    minute: Math.floor((snapped % 3600) / 60),
    second: snapped % 60,
  });
}

function setValue(value: TimeValue | undefined, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) {
    syncSegments(model.value);
    return false;
  }
  const next = value ? snapValue(value) : undefined;
  const change = createDetails(reason, event);
  emit("value-change", next, change.details);
  if (change.canceled()) {
    syncSegments(model.value);
    return false;
  }
  model.value = next;
  if (next) placeholderModel.value = next;
  nextTick(updateValidity);
  return true;
}

function candidate(): TimeValue | undefined {
  if (!isFilled.value || !isComplete.value) return undefined;
  const enteredHour = Number(values.hour);
  const minute = granularity === "hour" ? 0 : Number(values.minute);
  const second = granularity === "second" ? Number(values.second) : 0;
  if (enteredHour < segmentMin("hour") || enteredHour > segmentMax("hour") || minute > 59 || second > 59) return undefined;
  let hour = enteredHour;
  if (resolvedHourCycle.value === 12) {
    hour = enteredHour % 12 + (dayPeriod.value === "pm" ? 12 : 0);
  }
  return baseValue.value.set({ hour, minute, second, millisecond: 0 });
}

function commitSegments(reason: string, event?: Event): boolean {
  validationActive.value = true;
  const value = candidate();
  if (!value && isFilled.value) {
    updateValidity();
    return false;
  }
  const changed = setValue(value, reason, event);
  if (changed) emit("value-commit", value, createDetails(reason, event).details);
  return changed;
}

function validationError(): string {
  const value = candidate();
  if (isRequired.value && !isFilled.value) return "Enter a time.";
  if (isFilled.value && !value) return "Enter a complete, valid time.";
  if (!value) return "";
  if (minValue && asTime(value).compare(asTime(minValue)) < 0) return `Enter a time on or after ${asTime(minValue).toString()}.`;
  if (maxValue && asTime(value).compare(asTime(maxValue)) > 0) return `Enter a time on or before ${asTime(maxValue).toString()}.`;
  if (isTimeUnavailable?.(value)) return "This time is unavailable.";
  return "";
}

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(validationError());
  validity.value = input.validity;
  validationMessage.value = input.validationMessage;
  nativeInvalid.value = reveal && !input.validity.valid;
}

function setSegmentRef(element: unknown, segment: TimeFieldSegment) {
  if (element) segmentRefs.set(segment, element as HTMLInputElement);
  else segmentRefs.delete(segment);
}

function focusSegment(segment: TimeFieldSegment) {
  segmentRefs.get(segment)?.focus({ preventScroll: true });
}

function moveFocus(part: TimeFieldSegment | "dayPeriod", delta: number) {
  const index = focusableParts.value.indexOf(part);
  const next = focusableParts.value[Math.min(focusableParts.value.length - 1, Math.max(0, index + delta))];
  if (!next) return;
  if (next === "dayPeriod") rootRef.value?.querySelector<HTMLButtonElement>(".akaza-time-field-day-period")?.focus({ preventScroll: true });
  else focusSegment(next);
}

function onSegmentInput(segment: TimeFieldSegment, event: Event) {
  validationActive.value = true;
  const input = event.currentTarget as HTMLInputElement;
  const value = input.value.replace(/\D/g, "").slice(0, 2);
  values[segment] = value;
  input.value = value;
  if (autoAdvance && value.length === 2) moveFocus(segment, 1);
  commitSegments("input", event);
}

function incrementSegment(segment: TimeFieldSegment, multiplier: number, event: KeyboardEvent) {
  const min = segmentMin(segment);
  const max = segmentMax(segment);
  const fallback = segment === "hour" ? displayHour(asTime(baseValue.value).hour) : asTime(baseValue.value)[segment];
  let value = (Number(values[segment]) || fallback) + segmentStep(segment) * multiplier;
  while (value > max) value = min + (value - max - 1);
  while (value < min) value = max - (min - value - 1);
  values[segment] = String(value).padStart(2, "0");
  commitSegments("keyboard", event);
  nextTick(() => segmentRefs.get(segment)?.select());
}

function onSegmentKeydown(segment: TimeFieldSegment, event: KeyboardEvent) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    incrementSegment(segment, event.key === "ArrowUp" ? 1 : -1, event);
  } else if (event.key === "PageUp" || event.key === "PageDown") {
    event.preventDefault();
    incrementSegment(segment, event.key === "PageUp" ? 10 : -10, event);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    values[segment] = String(event.key === "Home" ? segmentMin(segment) : segmentMax(segment)).padStart(2, "0");
    commitSegments("keyboard", event);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const forward = event.key === "ArrowRight" ? 1 : -1;
    moveFocus(segment, dir === "rtl" ? -forward : forward);
  } else if (event.key === "Backspace" && !values[segment]) {
    moveFocus(segment, -1);
  }
}

function toggleDayPeriod(event?: Event) {
  if (isDisabled.value || readOnly) return;
  dayPeriod.value = dayPeriod.value === "am" ? "pm" : "am";
  commitSegments("day-period", event);
}

function onDayPeriodKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Home" || event.key === "End") {
    event.preventDefault();
    if (event.key === "Home") dayPeriod.value = "am";
    else if (event.key === "End") dayPeriod.value = "pm";
    else dayPeriod.value = dayPeriod.value === "am" ? "pm" : "am";
    commitSegments("keyboard", event);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const forward = event.key === "ArrowRight" ? 1 : -1;
    moveFocus("dayPeriod", dir === "rtl" ? -forward : forward);
  } else if (event.key.toLowerCase() === "a" || event.key.toLowerCase() === "p") {
    event.preventDefault();
    dayPeriod.value = event.key.toLowerCase() === "a" ? "am" : "pm";
    commitSegments("keyboard", event);
  }
}

function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData("text") ?? "";
  const groups = text.match(/\d+/g);
  if (!groups || groups.length < includedSegments.value.length) return;
  event.preventDefault();
  includedSegments.value.forEach((segment, index) => {
    values[segment] = (groups[index] ?? "").slice(0, 2).padStart(2, "0");
  });
  if (/\bpm\b/i.test(text)) dayPeriod.value = "pm";
  else if (/\bam\b/i.test(text)) dayPeriod.value = "am";
  commitSegments("paste", event);
}

function onFocus(part: TimeFieldSegment | "dayPeriod", event: FocusEvent) {
  focusedPart.value = part;
  if (selectOnFocus && event.currentTarget instanceof HTMLInputElement) event.currentTarget.select();
}

function onFocusout(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  focusedPart.value = null;
  touched.value = true;
  validationActive.value = true;
  commitSegments("blur", event);
}

function clear(event?: Event): boolean {
  const changed = setValue(undefined, "clear", event);
  if (changed) syncSegments(undefined);
  return changed;
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  focusSegment(firstSegment.value);
}

function onFormReset() {
  model.value = initialValue;
  syncSegments(initialValue);
  touched.value = false;
  validationActive.value = false;
  nativeInvalid.value = false;
  nextTick(() => updateValidity(false));
}

watch(model, syncSegments, { immediate: true });

onMounted(() => {
  updateValidity(false);
  formElement = hiddenRef.value?.form ?? null;
  formElement?.addEventListener("reset", onFormReset);
});

onBeforeUnmount(() => {
  formElement?.removeEventListener("reset", onFormReset);
  unregister?.();
});

defineExpose({
  clear,
  focus: () => focusSegment(firstSegment.value),
  setValue,
});
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
    :data-akaza-focused="isFocused || undefined"
    class="akaza-time-field"
    @focusout="onFocusout"
  >
    <div :class="ui?.segments" class="akaza-time-field-segments">
      <template v-for="(part, index) in parts" :key="`${part.type}-${index}`">
        <span
          v-if="part.type === 'literal'"
          aria-hidden="true"
          :class="ui?.literal"
          class="akaza-time-field-literal"
        >
          <slot name="literal" :value="part.value">{{ part.value }}</slot>
        </span>
        <button
          v-else-if="part.type === 'dayPeriod'"
          type="button"
          :disabled="isDisabled"
          :aria-label="`Day period, ${dayPeriodLabels[dayPeriod]}`"
          :class="ui?.dayPeriod"
          :data-akaza-state="dayPeriod"
          class="akaza-time-field-day-period"
          @click="toggleDayPeriod"
          @focus="onFocus('dayPeriod', $event)"
          @keydown="onDayPeriodKeydown"
        >
          <slot name="day-period" :value="dayPeriod" :label="dayPeriodLabels[dayPeriod]" :toggle="toggleDayPeriod">
            {{ dayPeriodLabels[dayPeriod] }}
          </slot>
        </button>
        <input
          v-else
          :id="part.type === firstSegment ? resolvedId : undefined"
          :ref="element => setSegmentRef(element, part.type as TimeFieldSegment)"
          type="text"
          role="spinbutton"
          inputmode="numeric"
          autocomplete="off"
          :value="values[part.type]"
          size="2"
          placeholder="--"
          maxlength="2"
          :aria-label="segmentLabel(part.type)"
          :aria-valuemin="segmentMin(part.type)"
          :aria-valuemax="segmentMax(part.type)"
          :aria-valuenow="values[part.type] ? Number(values[part.type]) : undefined"
          :aria-valuetext="values[part.type] || `${segmentLabel(part.type)} empty`"
          :disabled="isDisabled"
          :readonly="readOnly"
          :class="ui?.segment"
          :data-akaza-segment="part.type"
          :data-akaza-state="values[part.type] ? 'filled' : 'empty'"
          :data-akaza-placeholder="!values[part.type] || undefined"
          class="akaza-time-field-segment"
          @focus="onFocus(part.type, $event)"
          @input="onSegmentInput(part.type, $event)"
          @keydown="onSegmentKeydown(part.type, $event)"
          @paste="onPaste"
        >
      </template>
    </div>

    <span v-if="zoneLabel && !hideTimeZone" :class="ui?.timeZone" class="akaza-time-field-time-zone">
      <slot name="time-zone" :value="zoneLabel">{{ zoneLabel }}</slot>
    </span>

    <input
      ref="hiddenRef"
      :name="resolvedName"
      :value="model ? asTime(model).toString() : ''"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="readOnly"
      tabindex="-1"
      aria-hidden="true"
      :class="ui?.hiddenInput"
      class="akaza-time-field-hidden-input"
      @invalid="onInvalid"
    >
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-time-field,
  .akaza-time-field-segments {
    display: inline-flex;
    min-width: 0;
    align-items: center;
  }

  .akaza-time-field {
    position: relative;
  }

  .akaza-time-field-segment {
    flex: none;
    min-width: 0;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
    outline: none;
  }

  .akaza-time-field-day-period {
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .akaza-time-field-hidden-input {
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
