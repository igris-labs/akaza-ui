<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { MonthRangePicker } from "akaza-ui";
import { shallowRef } from "vue";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 3, 1),
  end: new CalendarDate(2026, 6, 1),
});
const control = "grid size-9 place-items-center rounded-lg border border-neutral-300 text-lg text-neutral-900 disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-100";
const ui = {
  root: "w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  header: "mb-3 flex items-center justify-between gap-3",
  previous: control,
  heading: "text-sm font-semibold",
  next: control,
  grid: "grid gap-2",
  gridRow: "gap-2",
  cell: "min-w-0",
  cellTrigger: "h-9 w-full rounded-lg px-2 text-sm outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-in-range]:bg-neutral-200 data-[akaza-range-start]:bg-neutral-950 data-[akaza-range-start]:text-white data-[akaza-range-end]:bg-neutral-950 data-[akaza-range-end]:text-white data-[akaza-highlighted]:bg-neutral-100 dark:hover:bg-neutral-800 dark:data-[akaza-in-range]:bg-neutral-800 dark:data-[akaza-range-start]:bg-white dark:data-[akaza-range-start]:text-neutral-950 dark:data-[akaza-range-end]:bg-white dark:data-[akaza-range-end]:text-neutral-950",
};
</script>

<template>
  <div class="grid gap-3">
    <MonthRangePicker v-model="value" v-model:placeholder="page" :maximum-months="6" :ui="ui" />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">
      Range: {{ value.start?.toString() ?? "start" }} - {{ value.end?.toString() ?? "select end" }}
    </p>
  </div>
</template>
