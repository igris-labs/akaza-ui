<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { CalendarDateRange, CalendarDateValue, CalendarDay, CalendarModelValue, CalendarMonth, CalendarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import {
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { computed, nextTick, onMounted, shallowRef } from "vue";

const {
  locale = "en-US",
  dir = "ltr",
  calendarLabel = "Calendar",
  weekStartsOn,
  weekdayFormat = "narrow",
  fixedWeeks = false,
  numberOfMonths = 1,
  pagedNavigation = false,
  preventDeselect = false,
  selectionMode,
  multiple = false,
  allowNonContiguousRanges = false,
  maximumDays,
  fixedDate,
  disabled = false,
  readOnly = false,
  initialFocus = false,
  disableDaysOutsideCurrentView = false,
  minValue,
  maxValue,
  isDateDisabled: matchDisabled,
  isDateUnavailable: matchUnavailable,
  nextPage: resolveNextPage,
  prevPage: resolvePrevPage,
  ui,
} = defineProps<CalendarProps>();

const emit = defineEmits<{
  "value-change": [value: CalendarModelValue, details: AkazaChangeEventDetails];
  "placeholder-change": [value: CalendarDateValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<CalendarModelValue>();
const placeholderModel = defineModel<CalendarDateValue>("placeholder");
const localToday = today(getLocalTimeZone());
const initialDate = firstSelected(model.value) ?? localToday;
const internalPlaceholder = shallowRef<CalendarDateValue>(initialDate.copy());
const focusedDate = shallowRef<CalendarDateValue>(initialDate.copy());
const hoveredDate = shallowRef<CalendarDateValue>();
const dayRefs = new Map<string, HTMLButtonElement>();

const safeNumberOfMonths = computed(() => Math.max(1, Math.floor(numberOfMonths)));
const mode = computed(() => selectionMode ?? (multiple ? "multiple" : "single"));
const placeholder = computed<CalendarDateValue>(() => placeholderModel.value ?? internalPlaceholder.value);
const visibleStart = computed(() => startOfMonth(placeholder.value));
const visibleEnd = computed(() => endOfMonth(visibleStart.value.add({ months: safeNumberOfMonths.value - 1 })));
const selectedDates = computed(() => {
  if (Array.isArray(model.value)) return model.value;
  if (isDateRange(model.value)) return [model.value.start, model.value.end].filter(Boolean) as CalendarDateValue[];
  return model.value ? [model.value] : [];
});
const rangeValue = computed(() => isDateRange(model.value) ? model.value : undefined);
const rangeAnchor = computed(() => {
  const range = rangeValue.value;
  if (mode.value !== "range" || !range) return undefined;
  if (fixedDate) return range[fixedDate];
  return range.start && !range.end ? range.start : undefined;
});
const previewRange = computed(() => {
  const start = rangeAnchor.value;
  const end = hoveredDate.value ?? focusedDate.value;
  return start && end ? orderRange(start, end) : undefined;
});
const state = computed(() => {
  if (rangeValue.value?.start && rangeValue.value.end) return "selected";
  return rangeAnchor.value ? "selecting" : selectedDates.value.length ? "selected" : "empty";
});
const invalid = computed(() => {
  const range = rangeValue.value;
  if (mode.value === "range" && range?.start) {
    if (!range.end) return isUnavailable(range.start) || isDateDisabled(range.start, false);
    return rangeHasBlockedDate(range.start, range.end, allowNonContiguousRanges);
  }
  return selectedDates.value.some((date) => isUnavailable(date) || isDateDisabled(date, false));
});
const months = computed<CalendarMonth[]>(() =>
  Array.from({ length: safeNumberOfMonths.value }, (_, index) => createMonth(visibleStart.value.add({ months: index }))),
);
const heading = computed(() => months.value.map(({ label }) => label).join(" – "));
const previousDisabled = computed(() => disabled || !canNavigate(getPreviousPage()));
const nextDisabled = computed(() => disabled || !canNavigate(getNextPage()));

function firstSelected(value: CalendarModelValue): CalendarDateValue | undefined {
  if (Array.isArray(value)) return value[0];
  if (isDateRange(value)) return value.start;
  return value;
}

function isDateRange(value: CalendarModelValue): value is CalendarDateRange {
  return Boolean(value && !Array.isArray(value) && !("calendar" in value));
}

function orderRange(start: CalendarDateValue, end: CalendarDateValue): Required<CalendarDateRange> {
  return start.compare(end) <= 0
    ? { start: start.copy(), end: end.copy() }
    : { start: end.copy(), end: start.copy() };
}

function eachDate(start: CalendarDateValue, end: CalendarDateValue, callback: (date: CalendarDateValue, day: number) => boolean): boolean {
  const range = orderRange(start, end);
  let date = range.start;
  let day = 1;
  while (date.compare(range.end) <= 0) {
    if (callback(date, day)) return true;
    date = date.add({ days: 1 });
    day += 1;
  }
  return false;
}

function rangeHasBlockedDate(start: CalendarDateValue, end: CalendarDateValue, allowGaps: boolean): boolean {
  const range = orderRange(start, end);
  const limit = maximumDays === undefined ? undefined : Math.max(1, Math.floor(maximumDays));
  return eachDate(range.start, range.end, (date, day) => {
    if (limit !== undefined && day > limit) return true;
    if (allowGaps && day > 1 && date.compare(range.end) < 0) return false;
    return isDateDisabled(date, false) || isUnavailable(date);
  });
}

function dateKey(date: CalendarDateValue): string {
  return toCalendarDate(date).toString();
}

function formatDate(date: CalendarDateValue, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(toCalendarDate(date).toDate(getLocalTimeZone()));
}

function formatMonth(date: CalendarDateValue): string {
  return formatDate(date, { month: "long", year: "numeric" });
}

function formatDay(date: CalendarDateValue): string {
  return formatDate(date, { day: "numeric" });
}

function formatDayLabel(date: CalendarDateValue): string {
  return formatDate(date, { dateStyle: "full" });
}

function formatWeekday(date: CalendarDateValue): string {
  return formatDate(date, { weekday: weekdayFormat });
}

function isSelected(date: CalendarDateValue): boolean {
  const range = rangeValue.value;
  if (mode.value === "range" && range?.start) {
    const end = range.end ?? range.start;
    const ordered = orderRange(range.start, end);
    return date.compare(ordered.start) >= 0 && date.compare(ordered.end) <= 0;
  }
  return selectedDates.value.some((selected) => isSameDay(selected, date));
}

function isRangeStart(date: CalendarDateValue): boolean {
  return Boolean(rangeValue.value?.start && isSameDay(rangeValue.value.start, date));
}

function isRangeEnd(date: CalendarDateValue): boolean {
  return Boolean(rangeValue.value?.end && isSameDay(rangeValue.value.end, date));
}

function isHighlighted(date: CalendarDateValue): boolean {
  const range = previewRange.value;
  return Boolean(range && date.compare(range.start) >= 0 && date.compare(range.end) <= 0);
}

function isUnavailable(date: CalendarDateValue): boolean {
  return matchUnavailable?.(date) ?? false;
}

function isDateDisabled(date: CalendarDateValue, outside: boolean): boolean {
  return (minValue !== undefined && date.compare(minValue) < 0)
    || (maxValue !== undefined && date.compare(maxValue) > 0)
    || (disableDaysOutsideCurrentView && outside)
    || (matchDisabled?.(date) ?? false);
}

function isDisabled(date: CalendarDateValue, outside: boolean): boolean {
  return disabled || isDateDisabled(date, outside);
}

function dayState(day: CalendarDay): string {
  if (day.selected) return "selected";
  if (day.unavailable) return "unavailable";
  if (day.disabled) return "disabled";
  if (day.today) return "today";
  if (day.outside) return "outside";
  return "available";
}

function createDay(date: CalendarDateValue, month: CalendarDateValue): CalendarDay {
  const outside = !isSameMonth(date, month);
  return {
    date,
    label: formatDay(date),
    selected: isSelected(date),
    today: isSameDay(date, localToday),
    outside,
    disabled: isDisabled(date, outside),
    unavailable: isUnavailable(date),
    focused: isSameDay(date, focusedDate.value),
    rangeStart: isRangeStart(date),
    rangeEnd: isRangeEnd(date),
    inRange: mode.value === "range" && isSelected(date),
    highlighted: isHighlighted(date),
  };
}

function createMonth(month: CalendarDateValue): CalendarMonth {
  const first = startOfWeek(startOfMonth(month), locale, weekStartsOn);
  const naturalLast = endOfWeek(endOfMonth(month), locale, weekStartsOn);
  const last = fixedWeeks ? first.add({ days: 41 }) : naturalLast;
  const days: CalendarDay[] = [];
  let date = first;
  while (date.compare(last) <= 0) {
    days.push(createDay(date, month));
    date = date.add({ days: 1 });
  }
  return {
    date: month,
    label: formatMonth(month),
    weeks: Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, index * 7 + 7)),
  };
}

function weekdayDates(month: CalendarMonth): CalendarDateValue[] {
  return month.weeks[0]?.map(({ date }) => date) ?? [];
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

function changePlaceholder(value: CalendarDateValue, reason: string, event?: Event): boolean {
  const next = startOfMonth(value).copy();
  const change = createDetails(reason, event);
  emit("placeholder-change", next, change.details);
  if (change.canceled()) return false;
  internalPlaceholder.value = next;
  placeholderModel.value = next;
  return true;
}

function changeValue(value: CalendarModelValue, reason: string, event?: Event): boolean {
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  model.value = value;
  return true;
}

function selectDate(date: CalendarDateValue, event?: Event): boolean {
  const outside = date.compare(visibleStart.value) < 0 || date.compare(visibleEnd.value) > 0;
  if (readOnly || isDisabled(date, outside) || isUnavailable(date)) return false;
  if (mode.value === "range") {
    const current = rangeValue.value;
    if (fixedDate) {
      const fixed = current?.[fixedDate];
      const other = fixedDate === "start" ? current?.end : current?.start;
      const next = fixedDate === "start"
        ? { start: (fixed ?? date).copy(), ...(other && { end: other.copy() }) }
        : { ...(other && { start: other.copy() }), end: (fixed ?? date).copy() };
      if (!fixed) {
        if (next.start && next.end) {
          if (next.start.compare(next.end) > 0) return false;
          if (rangeHasBlockedDate(next.start, next.end, allowNonContiguousRanges)) return false;
        }
        return changeValue(next, `range-${fixedDate}`, event);
      }
      const range = fixedDate === "start"
        ? { start: fixed.copy(), end: date.copy() }
        : { start: date.copy(), end: fixed.copy() };
      if (range.start.compare(range.end) > 0) return false;
      if (rangeHasBlockedDate(range.start, range.end, allowNonContiguousRanges)) return false;
      hoveredDate.value = undefined;
      return changeValue(range, fixedDate === "start" ? "range-end" : "range-start", event);
    }
    if (!current?.start || current.end) {
      hoveredDate.value = undefined;
      return changeValue({ start: date.copy() }, "range-start", event);
    }
    const range = orderRange(current.start, date);
    if (rangeHasBlockedDate(range.start, range.end, allowNonContiguousRanges)) return false;
    hoveredDate.value = undefined;
    return changeValue(range, "range-end", event);
  }
  if (mode.value === "multiple") {
    const values = [...selectedDates.value];
    const index = values.findIndex((value) => isSameDay(value, date));
    if (index >= 0) {
      if (preventDeselect) return false;
      values.splice(index, 1);
    } else {
      values.push(date.copy());
    }
    return changeValue(values.length ? values : undefined, "select", event);
  }
  if (isSelected(date) && !preventDeselect) return changeValue(undefined, "deselect", event);
  return changeValue(date.copy(), "select", event);
}

function pageSize(): number {
  return pagedNavigation ? safeNumberOfMonths.value : 1;
}

function getPreviousPage(): CalendarDateValue {
  return resolvePrevPage?.(placeholder.value) ?? placeholder.value.subtract({ months: pageSize() });
}

function getNextPage(): CalendarDateValue {
  return resolveNextPage?.(placeholder.value) ?? placeholder.value.add({ months: pageSize() });
}

function canNavigate(value: CalendarDateValue): boolean {
  const start = startOfMonth(value);
  const end = endOfMonth(start.add({ months: safeNumberOfMonths.value - 1 }));
  return (minValue === undefined || end.compare(minValue) >= 0)
    && (maxValue === undefined || start.compare(maxValue) <= 0);
}

function previousPage(event?: Event): boolean {
  const value = getPreviousPage();
  return !previousDisabled.value && changePlaceholder(value, "previous", event);
}

function nextPage(event?: Event): boolean {
  const value = getNextPage();
  return !nextDisabled.value && changePlaceholder(value, "next", event);
}

function setDayRef(element: Element | ComponentPublicInstance | null, date: CalendarDateValue) {
  const key = dateKey(date);
  if (element) dayRefs.set(key, element as HTMLButtonElement);
  else dayRefs.delete(key);
}

function focusCurrentDate() {
  dayRefs.get(dateKey(focusedDate.value))?.focus({ preventScroll: true });
}

async function focusDate(date: CalendarDateValue, reason = "keyboard", event?: Event) {
  focusedDate.value = date.copy();
  if (date.compare(visibleStart.value) < 0 || date.compare(visibleEnd.value) > 0) {
    if (!changePlaceholder(date, reason, event)) return;
  }
  await nextTick();
  focusCurrentDate();
}

function onDayKeydown(date: CalendarDateValue, event: KeyboardEvent) {
  let next: CalendarDateValue | undefined;
  if (event.key === "ArrowLeft") next = date.add({ days: dir === "rtl" ? 1 : -1 });
  else if (event.key === "ArrowRight") next = date.add({ days: dir === "rtl" ? -1 : 1 });
  else if (event.key === "ArrowUp") next = date.subtract({ days: 7 });
  else if (event.key === "ArrowDown") next = date.add({ days: 7 });
  else if (event.key === "Home") next = date.subtract({ days: getDayOfWeek(date, locale, weekStartsOn) });
  else if (event.key === "End") next = date.add({ days: 6 - getDayOfWeek(date, locale, weekStartsOn) });
  else if (event.key === "PageUp") next = date.subtract(event.shiftKey ? { years: 1 } : { months: 1 });
  else if (event.key === "PageDown") next = date.add(event.shiftKey ? { years: 1 } : { months: 1 });
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectDate(date, event);
    return;
  }
  if (!next) return;
  event.preventDefault();
  focusDate(next, "keyboard", event);
}

defineExpose({ focusDate, nextPage, previousPage, selectDate, placeholder });

onMounted(() => {
  if (initialFocus && !disabled) nextTick(focusCurrentDate);
});
</script>

<template>
  <div
    role="group"
    :dir="dir"
    :aria-label="`${calendarLabel}, ${heading}`"
    :aria-disabled="disabled || undefined"
    :aria-invalid="invalid || undefined"
    :class="ui?.root"
    :data-akaza-state="state"
    :data-akaza-selection-mode="mode"
    :data-akaza-fixed-date="fixedDate"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="invalid || undefined"
    class="akaza-calendar"
  >
    <div :class="ui?.header" class="akaza-calendar-header">
      <button
        type="button"
        aria-label="Previous page"
        :disabled="previousDisabled"
        :class="ui?.previous"
        :data-akaza-disabled="previousDisabled || undefined"
        class="akaza-calendar-previous"
        @click="previousPage($event)"
      >
        <slot name="previous" :disabled="previousDisabled">‹</slot>
      </button>
      <div :class="ui?.heading" class="akaza-calendar-heading" aria-live="polite">
        <slot name="heading" :label="heading" :months="months">{{ heading }}</slot>
      </div>
      <button
        type="button"
        aria-label="Next page"
        :disabled="nextDisabled"
        :class="ui?.next"
        :data-akaza-disabled="nextDisabled || undefined"
        class="akaza-calendar-next"
        @click="nextPage($event)"
      >
        <slot name="next" :disabled="nextDisabled">›</slot>
      </button>
    </div>

    <div :class="ui?.grids" class="akaza-calendar-grids">
      <table
        v-for="month in months"
        :key="dateKey(month.date)"
        role="grid"
        :aria-label="month.label"
        :aria-readonly="readOnly || undefined"
        :class="ui?.grid"
        :data-akaza-month="dateKey(month.date)"
        class="akaza-calendar-grid"
      >
        <thead :class="ui?.gridHead" class="akaza-calendar-grid-head">
          <tr :class="ui?.gridRow" class="akaza-calendar-grid-row">
            <th
              v-for="weekday in weekdayDates(month)"
              :key="dateKey(weekday)"
              scope="col"
              :class="ui?.headCell"
              class="akaza-calendar-head-cell"
            >
              <slot name="weekday" :date="weekday" :label="formatWeekday(weekday)">
                {{ formatWeekday(weekday) }}
              </slot>
            </th>
          </tr>
        </thead>
        <tbody :class="ui?.gridBody" class="akaza-calendar-grid-body">
          <tr v-for="week in month.weeks" :key="dateKey(week[0]!.date)" :class="ui?.gridRow" class="akaza-calendar-grid-row">
            <td
              v-for="day in week"
              :key="dateKey(day.date)"
              role="gridcell"
              :aria-selected="day.selected"
              :class="ui?.cell"
              :data-akaza-state="dayState(day)"
              :data-akaza-selected="day.selected || undefined"
              :data-akaza-today="day.today || undefined"
              :data-akaza-outside-view="day.outside || undefined"
              :data-akaza-disabled="day.disabled || undefined"
              :data-akaza-unavailable="day.unavailable || undefined"
              :data-akaza-range-start="day.rangeStart || undefined"
              :data-akaza-range-end="day.rangeEnd || undefined"
              :data-akaza-in-range="day.inRange || undefined"
              :data-akaza-highlighted="day.highlighted || undefined"
              class="akaza-calendar-cell"
            >
              <button
                :ref="(element) => setDayRef(element, day.date)"
                type="button"
                :tabindex="!disabled && day.focused ? 0 : -1"
                :aria-label="formatDayLabel(day.date)"
                :aria-current="day.today ? 'date' : undefined"
                :aria-disabled="day.disabled || day.unavailable || undefined"
                :class="ui?.cellTrigger"
                :data-akaza-state="dayState(day)"
                :data-akaza-selected="day.selected || undefined"
                :data-akaza-today="day.today || undefined"
                :data-akaza-outside-view="day.outside || undefined"
                :data-akaza-disabled="day.disabled || undefined"
                :data-akaza-unavailable="day.unavailable || undefined"
                :data-akaza-range-start="day.rangeStart || undefined"
                :data-akaza-range-end="day.rangeEnd || undefined"
                :data-akaza-in-range="day.inRange || undefined"
                :data-akaza-highlighted="day.highlighted || undefined"
                class="akaza-calendar-cell-trigger"
                @click="selectDate(day.date, $event)"
                @focus="focusedDate = day.date.copy()"
                @pointerenter="hoveredDate = day.date.copy()"
                @pointerleave="hoveredDate = undefined"
                @keydown="onDayKeydown(day.date, $event)"
              >
                <slot name="day" v-bind="day">{{ day.label }}</slot>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="$slots.footer" :class="ui?.footer" class="akaza-calendar-footer">
      <slot name="footer" :value="model" :placeholder="placeholder" />
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-calendar,
  .akaza-calendar-grids,
  .akaza-calendar-grid {
    min-width: 0;
  }

  .akaza-calendar-grid {
    border-collapse: collapse;
  }
}
</style>
