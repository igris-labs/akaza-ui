<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { DateRangePickerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CalendarDateRange, CalendarDateValue, CalendarModelValue } from "../calendar";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onBeforeUnmount, useId, useTemplateRef, watch } from "vue";
import { resolveAction } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import Calendar from "../calendar/Calendar.vue";
import DateRangeField from "../date-range-field/DateRangeField.vue";

const {
  id,
  name,
  startName,
  endName,
  locale = "en-US",
  dir = "ltr",
  minValue,
  maxValue,
  isDateDisabled,
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
  calendarLabel = "Choose date range",
  closeLabel,
  closeOnSelect = false,
  weekStartsOn,
  weekdayFormat = "narrow",
  fixedWeeks = false,
  numberOfMonths = 1,
  pagedNavigation = false,
  disableDaysOutsideCurrentView = false,
  nextPage,
  prevPage,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  teleport = "body",
  ui,
} = defineProps<DateRangePickerProps>();

const emit = defineEmits<{
  "value-change": [value: CalendarDateRange, details: AkazaChangeEventDetails];
  "value-commit": [value: CalendarDateRange, details: AkazaChangeEventDetails];
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  "placeholder-change": [value: CalendarDateValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<CalendarDateRange>({ default: () => ({}) });
const openModel = defineModel<boolean>("open", { default: false });
const placeholderModel = defineModel<CalendarDateValue>("placeholder");
const pickerId = `${useId()}-calendar`;
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const fieldRef = useTemplateRef<InstanceType<typeof DateRangeField>>("fieldRef");
const triggerRef = useTemplateRef<HTMLButtonElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

const state = computed(() => openModel.value ? "open" : "closed");
const fieldBindings = computed(() => ({
  locale,
  dir,
  allowNonContiguousRanges,
  required,
  disabled,
  readOnly,
  invalid,
  selectOnFocus,
  autoAdvance,
  startLabel,
  endLabel,
  ariaLabel,
  ...(id && { id }),
  ...(name && { name }),
  ...(startName && { startName }),
  ...(endName && { endName }),
  ...(minValue && { minValue }),
  ...(maxValue && { maxValue }),
  ...(isDateUnavailable && { isDateUnavailable }),
  ...(maximumDays !== undefined && { maximumDays }),
  ...(fixedDate && { fixedDate }),
  ...(ariaLabelledby && { ariaLabelledby }),
  ...(ariaDescribedby && { ariaDescribedby }),
  ...(ui?.field && { ui: ui.field }),
  ...(model.value && { modelValue: model.value }),
  "onUpdate:modelValue": (value: CalendarDateRange) => {
    model.value = value;
  },
}));
const calendarPlaceholder = computed(() => placeholderModel.value ?? model.value.start ?? model.value.end);
const calendarBindings = computed(() => ({
  locale,
  dir,
  calendarLabel,
  weekdayFormat,
  fixedWeeks,
  numberOfMonths,
  pagedNavigation,
  selectionMode: "range" as const,
  allowNonContiguousRanges,
  disabled,
  readOnly,
  initialFocus: true,
  disableDaysOutsideCurrentView,
  ...(model.value && { modelValue: model.value }),
  ...(weekStartsOn && { weekStartsOn }),
  ...(calendarPlaceholder.value && { placeholder: calendarPlaceholder.value }),
  ...(minValue && { minValue }),
  ...(maxValue && { maxValue }),
  ...(isDateDisabled && { isDateDisabled }),
  ...(isDateUnavailable && { isDateUnavailable }),
  ...(maximumDays !== undefined && { maximumDays }),
  ...(fixedDate && { fixedDate }),
  ...(nextPage && { nextPage }),
  ...(prevPage && { prevPage }),
  ...(ui?.calendar && { ui: ui.calendar }),
}));
const { actualAlign, actualSide, style: positionStyle } = useFloatingPosition({
  reference: rootRef,
  floating: contentRef,
  active: openModel,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  cssVarPrefix: "akaza-date-range-picker",
});
const { layerOrder, register, unregister } = useDismissableLayer((event) => close("escape", event));
const contentStyle = computed<CSSProperties>(() => ({
  ...positionStyle.value,
  "--akaza-layer-order": layerOrder.value,
}));

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

function setOpen(open: boolean, reason: string, event?: Event): boolean {
  if ((open && disabled) || openModel.value === open) return false;
  const change = createDetails(reason, event);
  emit("open-change", open, change.details);
  if (change.canceled()) return false;
  openModel.value = open;
  if (!open && reason !== "outside-click") nextTick(() => triggerRef.value?.focus({ preventScroll: true }));
  return true;
}

function open(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setOpen(true, details.reason, details.event);
}

function close(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setOpen(false, details.reason, details.event);
}

function toggle(reasonOrEvent?: string | Event, event?: Event): boolean {
  const details = resolveAction(reasonOrEvent, event);
  return setOpen(!openModel.value, details.reason, details.event);
}

function onFieldValueChange(value: CalendarDateRange, details: AkazaChangeEventDetails) {
  emit("value-change", value, details);
}

function onFieldValueCommit(value: CalendarDateRange, details: AkazaChangeEventDetails) {
  emit("value-commit", value, details);
}

function onCalendarValueChange(value: CalendarModelValue, details: AkazaChangeEventDetails) {
  details.cancel();
  if (!value || Array.isArray(value) || "calendar" in value) return;
  const changed = fieldRef.value?.setValue(value, "calendar", details.event) ?? false;
  if (!changed) return;
  emit("value-commit", value, createDetails("calendar", details.event).details);
  if (closeOnSelect && value.start && value.end) close("select", details.event);
}

function onPlaceholderChange(value: CalendarDateValue, details: AkazaChangeEventDetails) {
  emit("placeholder-change", value, details);
}

function clear(event?: Event): boolean {
  return fieldRef.value?.clear(event) ?? false;
}

watch(openModel, (open) => {
  if (open) register();
  else unregister();
}, { immediate: true });

onClickOutside(rootRef, (event) => {
  if (openModel.value) close("outside-click", event);
}, { ignore: [contentRef] });

onBeforeUnmount(unregister);

defineExpose({ clear, close, focusEnd: () => fieldRef.value?.focusEnd(), focusStart: () => fieldRef.value?.focusStart(), open, toggle });
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    :data-akaza-state="state"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="invalid || undefined"
    class="akaza-date-range-picker"
  >
    <DateRangeField
      ref="fieldRef"
      v-bind="fieldBindings"
      @value-change="onFieldValueChange"
      @value-commit="onFieldValueCommit"
    >
      <template #start-literal="{ value }">
        <slot name="start-literal" :value="value">{{ value }}</slot>
      </template>
      <template #separator>
        <slot name="separator">–</slot>
      </template>
      <template #end-literal="{ value }">
        <slot name="end-literal" :value="value">{{ value }}</slot>
      </template>
    </DateRangeField>

    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      :aria-label="calendarLabel"
      aria-haspopup="dialog"
      :aria-expanded="openModel"
      :aria-controls="openModel ? pickerId : undefined"
      :class="ui?.trigger"
      :data-akaza-state="state"
      :data-akaza-disabled="disabled || undefined"
      class="akaza-date-range-picker-trigger"
      @click="toggle"
    >
      <slot name="trigger" :is-open="openModel" :open="open" :close="close" :toggle="toggle">
        {{ calendarLabel }}
      </slot>
    </button>

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition name="akaza-date-range-picker">
        <div
          v-if="openModel"
          :id="pickerId"
          ref="contentRef"
          role="dialog"
          :aria-label="calendarLabel"
          :style="contentStyle"
          :class="ui?.content"
          :data-akaza-side="actualSide"
          :data-akaza-align="actualAlign"
          data-akaza-state="open"
          class="akaza-date-range-picker-content"
        >
          <slot name="calendar" :value="model" :close="close">
            <Calendar
              v-bind="calendarBindings"
              @update:model-value="model = $event as CalendarDateRange"
              @update:placeholder="placeholderModel = $event"
              @value-change="onCalendarValueChange"
              @placeholder-change="onPlaceholderChange"
            >
              <template #previous="slotProps"><slot name="previous" v-bind="slotProps">‹</slot></template>
              <template #heading="slotProps"><slot name="heading" v-bind="slotProps">{{ slotProps.label }}</slot></template>
              <template #next="slotProps"><slot name="next" v-bind="slotProps">›</slot></template>
              <template #weekday="slotProps"><slot name="weekday" v-bind="slotProps">{{ slotProps.label }}</slot></template>
              <template #day="slotProps"><slot name="day" v-bind="slotProps">{{ slotProps.label }}</slot></template>
              <template v-if="$slots.footer" #footer="slotProps"><slot name="footer" v-bind="slotProps" /></template>
            </Calendar>
          </slot>

          <button
            v-if="closeLabel || $slots.close"
            type="button"
            :aria-label="closeLabel || 'Close calendar'"
            :class="ui?.close"
            class="akaza-date-range-picker-close"
            @click="close"
          >
            <slot name="close" :close="close">{{ closeLabel || "Close" }}</slot>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-date-range-picker {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    position: relative;
  }

  .akaza-date-range-picker-content {
    box-sizing: border-box;
    width: min-content;
    max-width: var(--akaza-date-range-picker-available-width);
    max-height: var(--akaza-date-range-picker-available-height);
    overflow: auto;
    z-index: var(--akaza-z-date-range-picker, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
    transform-origin: var(--akaza-date-range-picker-transform-origin);
  }

  .akaza-date-range-picker-enter-active,
  .akaza-date-range-picker-leave-active {
    transition:
      opacity var(--akaza-date-range-picker-duration, 120ms) ease-out,
      scale var(--akaza-date-range-picker-duration, 120ms) ease-out,
      translate var(--akaza-date-range-picker-duration, 120ms) ease-out;
  }

  .akaza-date-range-picker-enter-from,
  .akaza-date-range-picker-leave-to {
    opacity: 0;
    scale: 0.98;
  }

  .akaza-date-range-picker-enter-from[data-akaza-side="bottom"],
  .akaza-date-range-picker-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
  .akaza-date-range-picker-enter-from[data-akaza-side="top"],
  .akaza-date-range-picker-leave-to[data-akaza-side="top"] { translate: 0 4px; }

  @media (prefers-reduced-motion: reduce) {
    .akaza-date-range-picker-enter-active,
    .akaza-date-range-picker-leave-active {
      transition-duration: 0.01ms;
    }
  }
}
</style>
