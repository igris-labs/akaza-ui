<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "akaza-ui";
import { shallowRef } from "vue";

const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
const control = "grid size-9 place-items-center rounded-lg border border-neutral-300 text-lg disabled:opacity-40 dark:border-neutral-800";
const endpoint = {
  root: "h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-neutral-950 shadow-none data-[akaza-focused]:ring-0 dark:text-neutral-50",
  segments: "min-w-0 flex-1",
  segment: "rounded px-0.5 text-sm tabular-nums outline-none placeholder:text-neutral-400 focus:bg-neutral-100 dark:focus:bg-neutral-800",
  literal: "text-sm text-neutral-500",
};
const ui = {
  root: "w-full max-w-xl gap-1",
  field: {
    root: "h-10 min-w-0 flex-1 gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-950 shadow-sm data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
    start: "min-w-0 flex-1",
    startField: endpoint,
    separator: "text-sm text-neutral-500",
    end: "min-w-0 flex-1",
    endField: endpoint,
  },
  trigger: "grid size-10 shrink-0 place-items-center rounded-lg border border-neutral-300 bg-white text-neutral-600 shadow-sm hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800",
  content: "rounded-xl border border-neutral-200 bg-white p-1 text-neutral-950 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  calendar: {
    root: "rounded-lg p-3",
    header: "mb-3 flex items-center justify-between gap-3",
    previous: control,
    heading: "text-sm font-semibold",
    next: control,
    grids: "flex max-w-full flex-wrap gap-5 overflow-x-auto",
    grid: "w-full min-w-64 table-fixed",
    gridHead: "text-neutral-500",
    gridRow: "h-9",
    headCell: "size-9 text-center text-[11px] font-medium",
    cell: "size-9 p-0 text-center",
    cellTrigger: "grid size-9 place-items-center rounded-lg text-sm outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-selected]:bg-neutral-950 data-[akaza-selected]:text-white data-[akaza-in-range]:!bg-neutral-200 data-[akaza-in-range]:!text-neutral-950 data-[akaza-range-start]:!bg-neutral-950 data-[akaza-range-start]:!text-white data-[akaza-range-end]:!bg-neutral-950 data-[akaza-range-end]:!text-white dark:hover:bg-neutral-800 dark:data-[akaza-selected]:bg-white dark:data-[akaza-selected]:text-neutral-950 dark:data-[akaza-in-range]:!bg-neutral-800 dark:data-[akaza-in-range]:!text-neutral-50 dark:data-[akaza-range-start]:!bg-white dark:data-[akaza-range-start]:!text-neutral-950 dark:data-[akaza-range-end]:!bg-white dark:data-[akaza-range-end]:!text-neutral-950",
  },
  close: "mt-1 h-8 w-full rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
};
</script>

<template>
  <div class="grid max-w-xl gap-3">
    <DateRangePicker
      v-model="value"
      :placeholder="new CalendarDate(2026, 8, 1)"
      :number-of-months="2"
      paged-navigation
      fixed-weeks
      close-label="Done"
      :ui="ui"
    >
      <template #trigger><span aria-hidden="true">▦</span></template>
    </DateRangePicker>
    <p class="text-xs text-neutral-600 dark:text-neutral-400">
      Selected: {{ value.start?.toString() ?? "none" }} to {{ value.end?.toString() ?? "select end" }}
    </p>
  </div>
</template>
