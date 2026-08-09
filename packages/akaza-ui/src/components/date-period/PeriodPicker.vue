<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { AkazaChangeEventDetails } from "../../types";
import type { CalendarDateRange, CalendarDateValue, CalendarModelValue, CalendarRangeFixedDate } from "../calendar";
import { getLocalTimeZone, toCalendar, toCalendarDate, today } from "@internationalized/date";
import { computed, nextTick, onMounted, shallowRef } from "vue";

export interface PeriodPickerUi {
  root?: string;
  header?: string;
  previous?: string;
  heading?: string;
  next?: string;
  grid?: string;
  gridRow?: string;
  cell?: string;
  cellTrigger?: string;
  footer?: string;
}

export interface PeriodPickerItem {
  date: CalendarDateValue;
  label: string;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  unavailable: boolean;
  focused: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  highlighted: boolean;
}

const {
  kind,
  prefix,
  selectionMode = "single",
  locale = "en-US",
  dir = "ltr",
  pickerLabel,
  columns = 3,
  itemsPerPage = 12,
  preventDeselect = false,
  allowNonContiguousRanges = false,
  maximumPeriods,
  fixedDate,
  disabled = false,
  readOnly = false,
  initialFocus = false,
  minValue,
  maxValue,
  isPeriodDisabled: matchDisabled,
  isPeriodUnavailable: matchUnavailable,
  nextPage: resolveNextPage,
  prevPage: resolvePrevPage,
  ui,
} = defineProps<{
  kind: "month" | "year";
  prefix: string;
  selectionMode?: "single" | "multiple" | "range" | undefined;
  locale?: string | undefined;
  dir?: "ltr" | "rtl" | undefined;
  pickerLabel: string;
  columns?: number | undefined;
  itemsPerPage?: number | undefined;
  preventDeselect?: boolean | undefined;
  allowNonContiguousRanges?: boolean | undefined;
  maximumPeriods?: number | undefined;
  fixedDate?: CalendarRangeFixedDate | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  initialFocus?: boolean | undefined;
  minValue?: CalendarDateValue | undefined;
  maxValue?: CalendarDateValue | undefined;
  isPeriodDisabled?: ((date: CalendarDateValue) => boolean) | undefined;
  isPeriodUnavailable?: ((date: CalendarDateValue) => boolean) | undefined;
  nextPage?: ((placeholder: CalendarDateValue) => CalendarDateValue) | undefined;
  prevPage?: ((placeholder: CalendarDateValue) => CalendarDateValue) | undefined;
  ui?: PeriodPickerUi | undefined;
}>();

const emit = defineEmits<{
  "value-change": [value: CalendarModelValue, details: AkazaChangeEventDetails];
  "placeholder-change": [value: CalendarDateValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<CalendarModelValue>();
const placeholderModel = defineModel<CalendarDateValue | undefined>("placeholder");
const localToday = today(getLocalTimeZone());
const initialDate = placeholderModel.value ?? firstSelected(model.value) ?? localToday;
const internalPlaceholder = shallowRef(normalize(initialDate));
const focusedValue = shallowRef(normalize(initialDate));
const hoveredValue = shallowRef<CalendarDateValue>();
const itemRefs = new Map<string, HTMLButtonElement>();

const safeColumns = computed(() => Math.max(1, Math.floor(columns)));
const safeItemsPerPage = computed(() => Math.max(1, Math.floor(itemsPerPage)));
const placeholder = computed(() => normalize(placeholderModel.value ?? internalPlaceholder.value));
const pageStart = computed(() => kind === "month"
  ? placeholder.value.set({ month: 1, day: 1 })
  : placeholder.value.set({ month: 1, day: 1 }));
const selectedValues = computed(() => {
  if (Array.isArray(model.value)) return model.value;
  if (isRange(model.value)) return [model.value.start, model.value.end].filter(Boolean) as CalendarDateValue[];
  return model.value ? [model.value] : [];
});
const rangeValue = computed(() => isRange(model.value) ? model.value : undefined);
const rangeAnchor = computed(() => {
  const range = rangeValue.value;
  if (selectionMode !== "range" || !range) return undefined;
  if (fixedDate) return range[fixedDate];
  return range.start && !range.end ? range.start : undefined;
});
const previewRange = computed(() => {
  const anchor = rangeAnchor.value;
  const end = hoveredValue.value ?? focusedValue.value;
  return anchor && end ? orderRange(anchor, end) : undefined;
});
const visibleItems = computed<PeriodPickerItem[]>(() => {
  const count = kind === "month"
    ? pageStart.value.calendar.getMonthsInYear(toCalendarDate(pageStart.value))
    : safeItemsPerPage.value;
  return Array.from({ length: count }, (_, index) => createItem(
    kind === "month"
      ? pageStart.value.set({ month: index + 1, day: 1 })
      : pageStart.value.add({ years: index }).set({ month: 1, day: 1 }),
  ));
});
const rows = computed(() => Array.from(
  { length: Math.ceil(visibleItems.value.length / safeColumns.value) },
  (_, index) => visibleItems.value.slice(index * safeColumns.value, (index + 1) * safeColumns.value),
));
const heading = computed(() => kind === "month"
  ? format(pageStart.value, { year: "numeric" })
  : `${format(visibleItems.value[0]?.date ?? pageStart.value, { year: "numeric" })} – ${format(visibleItems.value[visibleItems.value.length - 1]?.date ?? pageStart.value, { year: "numeric" })}`);
const state = computed(() => {
  if (rangeValue.value?.start && rangeValue.value.end) return "selected";
  if (rangeAnchor.value) return "selecting";
  return selectedValues.value.length ? "selected" : "empty";
});
const invalid = computed(() => {
  const range = rangeValue.value;
  if (selectionMode === "range" && range?.start) {
    if (!range.end) return isBlocked(range.start);
    return rangeHasBlockedPeriod(range.start, range.end);
  }
  return selectedValues.value.some(isBlocked);
});
const previousDisabled = computed(() => disabled || !canNavigate(getPreviousPage()));
const nextDisabled = computed(() => disabled || !canNavigate(getNextPage()));

function normalize(value: CalendarDateValue): CalendarDateValue {
  return kind === "month"
    ? value.set({ day: 1 }).copy()
    : value.set({ month: 1, day: 1 }).copy();
}

function firstSelected(value: CalendarModelValue): CalendarDateValue | undefined {
  if (Array.isArray(value)) return value[0];
  if (isRange(value)) return value.start;
  return value;
}

function isRange(value: CalendarModelValue): value is CalendarDateRange {
  return Boolean(value && !Array.isArray(value) && !("calendar" in value));
}

function key(value: CalendarDateValue): string {
  const date = toCalendarDate(value);
  return kind === "month" ? `${date.era}-${date.year}-${date.month}` : `${date.era}-${date.year}`;
}

function same(left: CalendarDateValue, right: CalendarDateValue): boolean {
  return key(left) === key(right);
}

function orderRange(start: CalendarDateValue, end: CalendarDateValue): Required<CalendarDateRange> {
  const normalizedStart = normalize(start);
  const normalizedEnd = normalize(end);
  return normalizedStart.compare(normalizedEnd) <= 0
    ? { start: normalizedStart, end: normalizedEnd }
    : { start: normalizedEnd, end: normalizedStart };
}

function addPeriod(value: CalendarDateValue, amount: number): CalendarDateValue {
  return normalize(value.add(kind === "month" ? { months: amount } : { years: amount }));
}

function format(value: CalendarDateValue, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(toCalendarDate(value).toDate(getLocalTimeZone()));
}

function formatLabel(value: CalendarDateValue): string {
  return kind === "month"
    ? format(value, { month: "short" })
    : format(value, { year: "numeric" });
}

function formatAccessibleLabel(value: CalendarDateValue): string {
  return kind === "month"
    ? format(value, { month: "long", year: "numeric" })
    : format(value, { year: "numeric" });
}

function isSelected(value: CalendarDateValue): boolean {
  const range = rangeValue.value;
  if (selectionMode === "range" && range?.start) {
    const ordered = orderRange(range.start, range.end ?? range.start);
    return value.compare(ordered.start) >= 0 && value.compare(ordered.end) <= 0;
  }
  return selectedValues.value.some(selected => same(selected, value));
}

function isHighlighted(value: CalendarDateValue): boolean {
  const range = previewRange.value;
  return Boolean(range && value.compare(range.start) >= 0 && value.compare(range.end) <= 0);
}

function isDisabled(value: CalendarDateValue): boolean {
  return (minValue !== undefined && normalize(value).compare(normalize(minValue)) < 0)
    || (maxValue !== undefined && normalize(value).compare(normalize(maxValue)) > 0)
    || (matchDisabled?.(value) ?? false);
}

function isUnavailable(value: CalendarDateValue): boolean {
  return matchUnavailable?.(value) ?? false;
}

function isBlocked(value: CalendarDateValue): boolean {
  return isDisabled(value) || isUnavailable(value);
}

function createItem(value: CalendarDateValue): PeriodPickerItem {
  const currentToday = normalize(toCalendar(localToday, value.calendar));
  const range = rangeValue.value;
  return {
    date: value,
    label: formatLabel(value),
    selected: isSelected(value),
    today: same(value, currentToday),
    disabled: disabled || isDisabled(value),
    unavailable: isUnavailable(value),
    focused: same(value, focusedValue.value),
    rangeStart: Boolean(range?.start && same(value, range.start)),
    rangeEnd: Boolean(range?.end && same(value, range.end)),
    inRange: selectionMode === "range" && isSelected(value),
    highlighted: isHighlighted(value),
  };
}

function itemState(item: PeriodPickerItem): string {
  if (item.selected) return "selected";
  if (item.unavailable) return "unavailable";
  if (item.disabled) return "disabled";
  if (item.today) return "today";
  return "available";
}

function eachPeriod(start: CalendarDateValue, end: CalendarDateValue, callback: (value: CalendarDateValue, count: number) => boolean): boolean {
  const ordered = orderRange(start, end);
  let value = ordered.start;
  let count = 1;
  while (value.compare(ordered.end) <= 0) {
    if (callback(value, count)) return true;
    value = addPeriod(value, 1);
    count += 1;
  }
  return false;
}

function rangeHasBlockedPeriod(start: CalendarDateValue, end: CalendarDateValue): boolean {
  const ordered = orderRange(start, end);
  const maximum = maximumPeriods === undefined ? undefined : Math.max(1, Math.floor(maximumPeriods));
  return eachPeriod(ordered.start, ordered.end, (value, count) => {
    if (maximum !== undefined && count > maximum) return true;
    if (allowNonContiguousRanges && count > 1 && value.compare(ordered.end) < 0) return false;
    return isBlocked(value);
  });
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

function changeValue(value: CalendarModelValue, reason: string, event?: Event): boolean {
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  model.value = value;
  return true;
}

function changePlaceholder(value: CalendarDateValue, reason: string, event?: Event): boolean {
  const next = normalize(value);
  const change = createDetails(reason, event);
  emit("placeholder-change", next, change.details);
  if (change.canceled()) return false;
  internalPlaceholder.value = next;
  placeholderModel.value = next;
  nextTick(() => {
    if (!visibleItems.value.some(item => same(item.date, focusedValue.value))) {
      focusedValue.value = pageStart.value.copy();
    }
  });
  return true;
}

function selectValue(value: CalendarDateValue, event?: Event): boolean {
  const nextValue = normalize(value);
  if (readOnly || disabled || isBlocked(nextValue)) return false;
  if (selectionMode === "range") {
    const current = rangeValue.value;
    if (fixedDate) {
      const fixed = current?.[fixedDate];
      const other = fixedDate === "start" ? current?.end : current?.start;
      if (!fixed) {
        const next = fixedDate === "start"
          ? { start: nextValue, ...(other && { end: normalize(other) }) }
          : { ...(other && { start: normalize(other) }), end: nextValue };
        if (next.start && next.end && rangeHasBlockedPeriod(next.start, next.end)) return false;
        return changeValue(next, `range-${fixedDate}`, event);
      }
      const range = fixedDate === "start"
        ? { start: normalize(fixed), end: nextValue }
        : { start: nextValue, end: normalize(fixed) };
      if (range.start.compare(range.end) > 0 || rangeHasBlockedPeriod(range.start, range.end)) return false;
      hoveredValue.value = undefined;
      return changeValue(range, fixedDate === "start" ? "range-end" : "range-start", event);
    }
    if (!current?.start || current.end) {
      hoveredValue.value = undefined;
      return changeValue({ start: nextValue }, "range-start", event);
    }
    const range = orderRange(current.start, nextValue);
    if (rangeHasBlockedPeriod(range.start, range.end)) return false;
    hoveredValue.value = undefined;
    return changeValue(range, "range-end", event);
  }
  if (selectionMode === "multiple") {
    const values = selectedValues.value.map(normalize);
    const index = values.findIndex(selected => same(selected, nextValue));
    if (index >= 0) {
      if (preventDeselect) return false;
      values.splice(index, 1);
    } else {
      values.push(nextValue);
    }
    return changeValue(values.length ? values : undefined, index >= 0 ? "deselect" : "select", event);
  }
  if (isSelected(nextValue) && !preventDeselect) return changeValue(undefined, "deselect", event);
  return changeValue(nextValue, "select", event);
}

function getPreviousPage(): CalendarDateValue {
  return normalize(resolvePrevPage?.(placeholder.value) ?? addPeriod(pageStart.value, kind === "month" ? -12 : -safeItemsPerPage.value));
}

function getNextPage(): CalendarDateValue {
  return normalize(resolveNextPage?.(placeholder.value) ?? addPeriod(pageStart.value, kind === "month" ? 12 : safeItemsPerPage.value));
}

function canNavigate(value: CalendarDateValue): boolean {
  const start = kind === "month" ? value.set({ month: 1, day: 1 }) : normalize(value);
  const count = kind === "month"
    ? start.calendar.getMonthsInYear(toCalendarDate(start))
    : safeItemsPerPage.value;
  const end = addPeriod(start, count - 1);
  return (minValue === undefined || end.compare(normalize(minValue)) >= 0)
    && (maxValue === undefined || start.compare(normalize(maxValue)) <= 0);
}

function previousPage(event?: Event): boolean {
  return !previousDisabled.value && changePlaceholder(getPreviousPage(), "previous", event);
}

function nextPage(event?: Event): boolean {
  return !nextDisabled.value && changePlaceholder(getNextPage(), "next", event);
}

function setItemRef(element: Element | ComponentPublicInstance | null, value: CalendarDateValue) {
  if (element) itemRefs.set(key(value), element as HTMLButtonElement);
  else itemRefs.delete(key(value));
}

function focusCurrentValue() {
  itemRefs.get(key(focusedValue.value))?.focus({ preventScroll: true });
}

async function focusValue(value: CalendarDateValue, reason = "keyboard", event?: Event) {
  const next = normalize(value);
  focusedValue.value = next;
  if (!visibleItems.value.some(item => same(item.date, next))) {
    if (!changePlaceholder(next, reason, event)) return;
  }
  await nextTick();
  focusCurrentValue();
}

function onItemKeydown(value: CalendarDateValue, event: KeyboardEvent) {
  const index = visibleItems.value.findIndex(item => same(item.date, value));
  let next: CalendarDateValue | undefined;
  if (event.key === "ArrowLeft") next = addPeriod(value, dir === "rtl" ? 1 : -1);
  else if (event.key === "ArrowRight") next = addPeriod(value, dir === "rtl" ? -1 : 1);
  else if (event.key === "ArrowUp") next = addPeriod(value, -safeColumns.value);
  else if (event.key === "ArrowDown") next = addPeriod(value, safeColumns.value);
  else if (event.key === "Home") next = addPeriod(value, -(index % safeColumns.value));
  else if (event.key === "End") next = addPeriod(value, Math.min(safeColumns.value - 1 - (index % safeColumns.value), visibleItems.value.length - 1 - index));
  else if (event.key === "PageUp") next = addPeriod(value, event.shiftKey
    ? (kind === "month" ? -120 : -safeItemsPerPage.value * 10)
    : (kind === "month" ? -12 : -safeItemsPerPage.value));
  else if (event.key === "PageDown") next = addPeriod(value, event.shiftKey
    ? (kind === "month" ? 120 : safeItemsPerPage.value * 10)
    : (kind === "month" ? 12 : safeItemsPerPage.value));
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectValue(value, event);
    return;
  }
  if (!next) return;
  event.preventDefault();
  focusValue(next, "keyboard", event);
}

function partClass(part?: string): string {
  return `akaza-${prefix}${part ? `-${part}` : ""}`;
}

defineExpose({ focusValue, nextPage, placeholder, previousPage, selectValue });

onMounted(() => {
  if (initialFocus && !disabled) nextTick(focusCurrentValue);
});
</script>

<template>
  <div
    role="group"
    :dir="dir"
    :aria-label="`${pickerLabel}, ${heading}`"
    :aria-disabled="disabled || undefined"
    :aria-invalid="invalid || undefined"
    :class="[ui?.root, partClass()]"
    :data-akaza-state="state"
    :data-akaza-selection-mode="selectionMode"
    :data-akaza-fixed-date="fixedDate"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="invalid || undefined"
  >
    <div :class="[ui?.header, partClass('header')]">
      <button
        type="button"
        aria-label="Previous page"
        :disabled="previousDisabled"
        :class="[ui?.previous, partClass('previous')]"
        :data-akaza-disabled="previousDisabled || undefined"
        @click="previousPage($event)"
      >
        <slot name="previous" :disabled="previousDisabled">‹</slot>
      </button>
      <div :class="[ui?.heading, partClass('heading')]" aria-live="polite">
        <slot name="heading" :label="heading" :items="visibleItems">{{ heading }}</slot>
      </div>
      <button
        type="button"
        aria-label="Next page"
        :disabled="nextDisabled"
        :class="[ui?.next, partClass('next')]"
        :data-akaza-disabled="nextDisabled || undefined"
        @click="nextPage($event)"
      >
        <slot name="next" :disabled="nextDisabled">›</slot>
      </button>
    </div>

    <div
      role="grid"
      :aria-label="heading"
      :aria-readonly="readOnly || undefined"
      :aria-colcount="safeColumns"
      :class="[ui?.grid, partClass('grid')]"
      :style="{ '--akaza-period-picker-columns': safeColumns }"
    >
      <div v-for="row in rows" :key="key(row[0]!.date)" role="row" :class="[ui?.gridRow, partClass('grid-row')]">
        <div
          v-for="item in row"
          :key="key(item.date)"
          role="gridcell"
          :aria-selected="item.selected"
          :class="[ui?.cell, partClass('cell')]"
          :data-akaza-state="itemState(item)"
          :data-akaza-selected="item.selected || undefined"
          :data-akaza-today="item.today || undefined"
          :data-akaza-disabled="item.disabled || undefined"
          :data-akaza-unavailable="item.unavailable || undefined"
          :data-akaza-range-start="item.rangeStart || undefined"
          :data-akaza-range-end="item.rangeEnd || undefined"
          :data-akaza-in-range="item.inRange || undefined"
          :data-akaza-highlighted="item.highlighted || undefined"
        >
          <button
            :ref="element => setItemRef(element, item.date)"
            type="button"
            :tabindex="!disabled && item.focused ? 0 : -1"
            :aria-label="formatAccessibleLabel(item.date)"
            :aria-current="item.today ? 'date' : undefined"
            :aria-disabled="item.disabled || item.unavailable || undefined"
            :class="[ui?.cellTrigger, partClass('cell-trigger')]"
            :data-akaza-state="itemState(item)"
            :data-akaza-selected="item.selected || undefined"
            :data-akaza-today="item.today || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :data-akaza-unavailable="item.unavailable || undefined"
            :data-akaza-range-start="item.rangeStart || undefined"
            :data-akaza-range-end="item.rangeEnd || undefined"
            :data-akaza-in-range="item.inRange || undefined"
            :data-akaza-highlighted="item.highlighted || undefined"
            @click="selectValue(item.date, $event)"
            @focus="focusedValue = item.date.copy()"
            @pointerenter="hoveredValue = item.date.copy()"
            @pointerleave="hoveredValue = undefined"
            @keydown="onItemKeydown(item.date, $event)"
          >
            <slot name="cell" v-bind="item">{{ item.label }}</slot>
          </button>
        </div>
      </div>
    </div>

    <div v-if="$slots.footer" :class="[ui?.footer, partClass('footer')]">
      <slot name="footer" :value="model" :placeholder="placeholder" />
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  [class$="-picker-grid"] {
    display: grid;
  }

  [class$="-picker-grid-row"] {
    display: grid;
    grid-template-columns: repeat(var(--akaza-period-picker-columns, 3), minmax(0, 1fr));
  }
}
</style>
