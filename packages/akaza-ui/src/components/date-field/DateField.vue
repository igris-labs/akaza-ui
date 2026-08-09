<script setup lang="ts">
import type { DateFieldProps, DateFieldSegment } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CalendarDateValue, CalendarModelValue, CalendarProps } from "../calendar";
import { getLocalTimeZone, toCalendarDate, today } from "@internationalized/date";
import { onClickOutside } from "@vueuse/core";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, useTemplateRef, watch } from "vue";
import { resolveAction } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import Calendar from "../calendar/Calendar.vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
  locale = "en-US",
  dir = "ltr",
  placeholder,
  minValue,
  maxValue,
  isDateUnavailable,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  selectOnFocus = true,
  autoAdvance = true,
  showCalendar = false,
  calendarLabel = "Choose date",
  calendarSide = "bottom",
  calendarAlign = "start",
  calendarSideOffset = 6,
  calendarTeleport = "body",
  ariaLabel = "Date",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<DateFieldProps>();

const emit = defineEmits<{
  "value-change": [value: CalendarDateValue | undefined, details: AkazaChangeEventDetails];
  "value-commit": [value: CalendarDateValue | undefined, details: AkazaChangeEventDetails];
  "calendar-open-change": [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<CalendarDateValue>();
const calendarOpen = defineModel<boolean>("calendarOpen", { default: false });
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const hiddenRef = useTemplateRef<HTMLInputElement>("hiddenRef");
const calendarTriggerRef = useTemplateRef<HTMLButtonElement>("calendarTriggerRef");
const calendarContentRef = useTemplateRef<HTMLElement>("calendarContentRef");
const segmentRefs = new Map<DateFieldSegment, HTMLInputElement>();
const values = reactive<Record<DateFieldSegment, string>>({ day: "", month: "", year: "" });
const focusedSegment = ref<DateFieldSegment | null>(null);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const initialValue = model.value;
const calendarId = `${autoId}-calendar`;
let formElement: HTMLFormElement | null = null;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-date-field-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const labelledBy = computed(() => ariaLabelledby ?? field?.labelledBy.value);
const isFocused = computed(() => focusedSegment.value !== null);
const isFilled = computed(() => Boolean(values.day || values.month || values.year));
const isDirty = computed(() => (model.value?.toString() ?? "") !== (initialValue?.toString() ?? "") || (model.value === undefined && isFilled.value));
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isFilled.value ? "filled" : "empty");
const baseDate = computed<CalendarDateValue>(() => model.value ?? placeholder ?? today(getLocalTimeZone()));
const parts = computed(() => getParts());
const firstSegment = computed(() => parts.value.find(({ type }) => type !== "literal")?.type);
const { actualAlign: calendarActualAlign, actualSide: calendarActualSide, style: calendarPositionStyle } = useFloatingPosition({
  reference: rootRef,
  floating: calendarContentRef,
  active: () => showCalendar && calendarOpen.value,
  side: () => calendarSide,
  align: () => calendarAlign,
  sideOffset: () => calendarSideOffset,
  cssVarPrefix: "akaza-date-field-calendar",
});
const { layerOrder, register: registerCalendarLayer, unregister: unregisterCalendarLayer } = useDismissableLayer((event) => {
  closeCalendar("escape", event);
});
const calendarContentStyle = computed(() => ({
  ...calendarPositionStyle.value,
  "--akaza-layer-order": layerOrder.value,
}));
const calendarPickerProps = computed<CalendarProps>(() => ({
  locale,
  dir,
  calendarLabel,
  disabled: isDisabled.value,
  readOnly,
  initialFocus: true,
  preventDeselect: true,
  ...((model.value ?? placeholder) && { placeholder: model.value ?? placeholder }),
  ...(minValue && { minValue }),
  ...(maxValue && { maxValue }),
  ...(isDateUnavailable && { isDateUnavailable }),
  ...(ui?.calendar && { ui: ui.calendar }),
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

function getParts(): Array<{ type: DateFieldSegment | "literal"; value: string }> {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" })
    .formatToParts(new Date(2006, 10, 22))
    .filter(({ type }) => type === "day" || type === "month" || type === "year" || type === "literal")
    .map(({ type, value }) => ({ type: type as DateFieldSegment | "literal", value }));
}

function segmentLabel(segment: DateFieldSegment): string {
  return new Intl.DisplayNames(locale, { type: "dateTimeField" }).of(segment) ?? segment;
}

function segmentPlaceholder(segment: DateFieldSegment): string {
  if (segment === "year") return "YYYY";
  return segment === "month" ? "MM" : "DD";
}

function segmentMaxLength(segment: DateFieldSegment): number {
  return segment === "year" ? 4 : 2;
}

function segmentInputSize(segment: DateFieldSegment): number {
  return segment === "month" ? 3 : segmentMaxLength(segment);
}

function segmentMin(_segment: DateFieldSegment): number {
  return 1;
}

function segmentMax(segment: DateFieldSegment): number {
  if (segment === "month") return 12;
  if (segment === "year") return 9999;
  const month = Number(values.month) || baseDate.value.month;
  const year = Number(values.year) || baseDate.value.year;
  return baseDate.value.calendar.getDaysInMonth(toCalendarDate(baseDate.value).set({ year, month }));
}

function syncSegments(value: CalendarDateValue | undefined) {
  if (!value) {
    values.day = "";
    values.month = "";
    values.year = "";
    return;
  }
  const date = toCalendarDate(value);
  values.day = String(date.day).padStart(2, "0");
  values.month = String(date.month).padStart(2, "0");
  values.year = String(date.year).padStart(4, "0");
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

function setValue(value: CalendarDateValue | undefined, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) {
    syncSegments(model.value);
    return false;
  }
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) {
    syncSegments(model.value);
    return false;
  }
  model.value = value;
  nextTick(updateValidity);
  return true;
}

function candidate(): CalendarDateValue | undefined {
  if (!values.day && !values.month && !values.year) return undefined;
  if (!(["day", "month", "year"] as const).every(segment =>
    values[segment].length === segmentMaxLength(segment))) return undefined;
  const fields = {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
  const date = baseDate.value.set(fields);
  if (date.day !== fields.day || date.month !== fields.month || date.year !== fields.year) return undefined;
  return date;
}

function commitSegments(reason: string, event?: Event): boolean {
  validationActive.value = true;
  const date = candidate();
  if (!date && isFilled.value) {
    updateValidity();
    return false;
  }
  const changed = setValue(date, reason, event);
  if (changed) emit("value-commit", date, createDetails(reason, event).details);
  return changed;
}

function validationError(): string {
  const date = candidate();
  if (isRequired.value && !isFilled.value) return "Enter a date.";
  if (isFilled.value && !date) return "Enter a complete, valid date.";
  if (!date) return "";
  if (minValue && date.compare(minValue) < 0) return `Enter a date on or after ${toCalendarDate(minValue).toString()}.`;
  if (maxValue && date.compare(maxValue) > 0) return `Enter a date on or before ${toCalendarDate(maxValue).toString()}.`;
  if (isDateUnavailable?.(date)) return "This date is unavailable.";
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

function focusSegment(segment: DateFieldSegment) {
  segmentRefs.get(segment)?.focus();
}

function moveFocus(segment: DateFieldSegment, delta: number) {
  const segments = parts.value.filter(({ type }) => type !== "literal").map(({ type }) => type as DateFieldSegment);
  const index = segments.indexOf(segment);
  const next = segments[Math.min(segments.length - 1, Math.max(0, index + delta))];
  if (next) focusSegment(next);
}

function setSegmentRef(element: unknown, segment: DateFieldSegment) {
  if (element) segmentRefs.set(segment, element as HTMLInputElement);
  else segmentRefs.delete(segment);
}

function onSegmentInput(segment: DateFieldSegment, event: Event) {
  validationActive.value = true;
  const input = event.currentTarget as HTMLInputElement;
  const value = input.value.replace(/\D/g, "").slice(0, segmentMaxLength(segment));
  values[segment] = value;
  input.value = value;
  if (autoAdvance && value.length === segmentMaxLength(segment)) moveFocus(segment, 1);
  commitSegments("input", event);
}

function incrementSegment(segment: DateFieldSegment, amount: number, event: KeyboardEvent) {
  const min = segmentMin(segment);
  const max = segmentMax(segment);
  const current = Number(values[segment]) || (baseDate.value[segment] as number);
  let value = current + amount;
  if (value > max) value = min;
  if (value < min) value = max;
  values[segment] = String(value).padStart(segmentMaxLength(segment), "0");
  commitSegments("keyboard", event);
  nextTick(() => segmentRefs.get(segment)?.select());
}

function onSegmentKeydown(segment: DateFieldSegment, event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    incrementSegment(segment, 1, event);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    incrementSegment(segment, -1, event);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    incrementSegment(segment, 10, event);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    incrementSegment(segment, -10, event);
  } else if (event.key === "Home") {
    event.preventDefault();
    values[segment] = String(segmentMin(segment)).padStart(segmentMaxLength(segment), "0");
    commitSegments("keyboard", event);
  } else if (event.key === "End") {
    event.preventDefault();
    values[segment] = String(segmentMax(segment)).padStart(segmentMaxLength(segment), "0");
    commitSegments("keyboard", event);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveFocus(segment, dir === "rtl" ? 1 : -1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveFocus(segment, dir === "rtl" ? -1 : 1);
  } else if (event.key === "Backspace" && !values[segment]) {
    moveFocus(segment, -1);
  }
}

function onPaste(event: ClipboardEvent) {
  const groups = event.clipboardData?.getData("text").match(/\d+/g);
  if (!groups || groups.length < 3) return;
  event.preventDefault();
  const order = parts.value.filter(({ type }) => type !== "literal").map(({ type }) => type as DateFieldSegment);
  const pasteOrder = groups[0]?.length === 4 ? (["year", "month", "day"] as DateFieldSegment[]) : order;
  pasteOrder.forEach((segment, index) => {
    values[segment] = (groups[index] ?? "")
      .slice(0, segmentMaxLength(segment))
      .padStart(segmentMaxLength(segment), "0");
  });
  commitSegments("paste", event);
}

function onFocus(segment: DateFieldSegment, event: FocusEvent) {
  focusedSegment.value = segment;
  if (selectOnFocus) (event.currentTarget as HTMLInputElement).select();
}

function onFocusout(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  if (calendarContentRef.value?.contains(event.relatedTarget as Node | null)) return;
  focusedSegment.value = null;
  touched.value = true;
  validationActive.value = true;
  commitSegments("blur", event);
}

function setCalendarOpen(open: boolean, reason: string, event?: Event): boolean {
  if (!showCalendar || (open && isDisabled.value) || calendarOpen.value === open) return false;
  const change = createDetails(reason, event);
  emit("calendar-open-change", open, change.details);
  if (change.canceled()) return false;
  calendarOpen.value = open;
  if (!open && reason !== "outside-click") {
    nextTick(() => calendarTriggerRef.value?.focus({ preventScroll: true }));
  }
  return true;
}

function openCalendar(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setCalendarOpen(true, details.reason, details.event);
}

function closeCalendar(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setCalendarOpen(false, details.reason, details.event);
}

function toggleCalendar(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setCalendarOpen(!calendarOpen.value, details.reason, details.event);
}

function selectCalendarValue(value: CalendarDateValue, event?: Event): boolean {
  const changed = setValue(value, "calendar", event);
  if (!changed) return false;
  syncSegments(value);
  emit("value-commit", value, createDetails("calendar", event).details);
  closeCalendar("select", event);
  return true;
}

function onCalendarValueChange(value: CalendarModelValue, details: AkazaChangeEventDetails) {
  details.cancel();
  if (!value || Array.isArray(value) || !("calendar" in value)) return;
  selectCalendarValue(value, details.event);
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
  focusSegment(firstSegment.value as DateFieldSegment);
}

function onFormReset() {
  model.value = initialValue;
  syncSegments(initialValue);
  touched.value = false;
  validationActive.value = false;
  nativeInvalid.value = false;
  nextTick(() => updateValidity(false));
}

// Controlled updates must replace stateful partial segment text.
watch(model, syncSegments, { immediate: true });
watch(() => showCalendar && calendarOpen.value, (open) => {
  if (open) registerCalendarLayer();
  else unregisterCalendarLayer();
}, { immediate: true });

onClickOutside(rootRef, (event) => {
  if (calendarOpen.value) closeCalendar("outside-click", event);
}, { ignore: [calendarContentRef] });

onMounted(() => {
  updateValidity(false);
  formElement = hiddenRef.value?.form ?? null;
  formElement?.addEventListener("reset", onFormReset);
});

onBeforeUnmount(() => {
  formElement?.removeEventListener("reset", onFormReset);
  unregisterCalendarLayer();
  unregister?.();
});

defineExpose({
  clear,
  closeCalendar,
  focus: () => focusSegment(parts.value.find(({ type }) => type !== "literal")?.type as DateFieldSegment),
  openCalendar,
  setValue,
  toggleCalendar,
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
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-required="isRequired || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-dirty="isDirty || undefined"
    :data-akaza-touched="touched || undefined"
    :data-akaza-filled="isFilled || undefined"
    :data-akaza-focused="isFocused || undefined"
    :data-akaza-calendar-open="showCalendar && calendarOpen || undefined"
    class="akaza-date-field"
    @focusout="onFocusout"
  >
    <div :class="ui?.segments" class="akaza-date-field-segments">
      <template v-for="(part, index) in parts" :key="`${part.type}-${index}`">
        <span
          v-if="part.type === 'literal'"
          aria-hidden="true"
          :class="ui?.literal"
          class="akaza-date-field-literal"
        >
          <slot name="literal" :value="part.value">{{ part.value }}</slot>
        </span>
        <input
          v-else
          :id="part.type === firstSegment ? resolvedId : undefined"
          :ref="(element) => setSegmentRef(element, part.type as DateFieldSegment)"
          type="text"
          role="spinbutton"
          inputmode="numeric"
          autocomplete="off"
          :value="values[part.type]"
          :size="segmentInputSize(part.type)"
          :placeholder="segmentPlaceholder(part.type)"
          :maxlength="segmentMaxLength(part.type)"
          :aria-label="segmentLabel(part.type)"
          :aria-valuemin="segmentMin(part.type)"
          :aria-valuemax="segmentMax(part.type)"
          :aria-valuenow="values[part.type] ? Number(values[part.type]) : undefined"
          :aria-valuetext="values[part.type] || segmentPlaceholder(part.type)"
          :disabled="isDisabled"
          :readonly="readOnly"
          :class="ui?.segment"
          :data-akaza-segment="part.type"
          :data-akaza-state="values[part.type] ? 'filled' : 'empty'"
          :data-akaza-placeholder="!values[part.type] || undefined"
          :data-akaza-disabled="isDisabled || undefined"
          :data-akaza-readonly="readOnly || undefined"
          :data-akaza-invalid="isInvalid || undefined"
          class="akaza-date-field-segment"
          @focus="onFocus(part.type, $event)"
          @input="onSegmentInput(part.type, $event)"
          @keydown="onSegmentKeydown(part.type, $event)"
          @paste="onPaste"
        >
      </template>
    </div>

    <button
      v-if="showCalendar"
      ref="calendarTriggerRef"
      type="button"
      :disabled="isDisabled"
      :aria-label="calendarLabel"
      aria-haspopup="dialog"
      :aria-expanded="calendarOpen"
      :aria-controls="calendarOpen ? calendarId : undefined"
      :class="ui?.calendarTrigger"
      :data-akaza-state="calendarOpen ? 'open' : 'closed'"
      :data-akaza-disabled="isDisabled || undefined"
      class="akaza-date-field-calendar-trigger"
      @click="toggleCalendar"
    >
      <slot
        name="calendar-trigger"
        :is-open="calendarOpen"
        :open="openCalendar"
        :close="closeCalendar"
        :toggle="toggleCalendar"
      >
        {{ calendarLabel }}
      </slot>
    </button>

    <input
      ref="hiddenRef"
      :name="resolvedName"
      :value="model ? toCalendarDate(model).toString() : ''"
      :required="isRequired"
      :disabled="isDisabled"
      tabindex="-1"
      aria-hidden="true"
      :class="ui?.hiddenInput"
      class="akaza-date-field-hidden-input"
      @invalid="onInvalid"
    >

    <Teleport :to="typeof calendarTeleport === 'string' ? calendarTeleport : 'body'" :disabled="calendarTeleport === false">
      <Transition name="akaza-date-field-calendar">
        <div
          v-if="showCalendar && calendarOpen"
          :id="calendarId"
          ref="calendarContentRef"
          role="dialog"
          :aria-label="calendarLabel"
          :style="calendarContentStyle"
          :class="ui?.calendarContent"
          :data-akaza-side="calendarActualSide"
          :data-akaza-align="calendarActualAlign"
          data-akaza-state="open"
          class="akaza-date-field-calendar-content"
        >
          <slot
            name="calendar"
            :value="model"
            :select="selectCalendarValue"
            :close="closeCalendar"
          >
            <Calendar
              v-bind="calendarPickerProps"
              :model-value="model"
              @value-change="onCalendarValueChange"
            />
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-date-field {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    position: relative;
  }

  .akaza-date-field-segments {
    display: inline-flex;
    min-width: 0;
    align-items: center;
  }

  .akaza-date-field-segment {
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

  .akaza-date-field-hidden-input {
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

  .akaza-date-field-calendar-content {
    box-sizing: border-box;
    width: min-content;
    max-width: var(--akaza-date-field-calendar-available-width);
    overflow: auto;
    z-index: var(--akaza-z-date-field-calendar, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
    transform-origin: var(--akaza-date-field-calendar-transform-origin);
  }

  .akaza-date-field-calendar-enter-active,
  .akaza-date-field-calendar-leave-active {
    transition:
      opacity var(--akaza-date-field-calendar-duration, 120ms) ease-out,
      scale var(--akaza-date-field-calendar-duration, 120ms) ease-out,
      translate var(--akaza-date-field-calendar-duration, 120ms) ease-out;
  }

  .akaza-date-field-calendar-enter-from,
  .akaza-date-field-calendar-leave-to {
    opacity: 0;
    scale: 0.98;
  }

  .akaza-date-field-calendar-enter-from[data-akaza-side="bottom"],
  .akaza-date-field-calendar-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
  .akaza-date-field-calendar-enter-from[data-akaza-side="top"],
  .akaza-date-field-calendar-leave-to[data-akaza-side="top"] { translate: 0 4px; }

  @media (prefers-reduced-motion: reduce) {
    .akaza-date-field-calendar-enter-active,
    .akaza-date-field-calendar-leave-active {
      transition-duration: 0.01ms;
    }
  }
}
</style>
