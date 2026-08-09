<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { DateField, Field } from "akaza-ui";
import { ref, shallowRef } from "vue";

const value = shallowRef<CalendarDateValue>();
const submitted = ref("Not submitted.");
const dateFieldUi = {
  root: "h-10 w-full rounded-lg border border-neutral-300 bg-white px-2 text-neutral-950 shadow-sm data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-neutral-500 data-[akaza-invalid]:border-red-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  segments: "min-w-0 flex-1",
  segment: "rounded px-0.5 text-sm tabular-nums outline-none placeholder:text-neutral-400 focus:bg-neutral-100 data-[akaza-invalid]:text-red-600 dark:focus:bg-neutral-800",
  literal: "text-sm text-neutral-500",
  calendarTrigger: "ml-auto inline-flex h-7 items-center rounded px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800",
  calendarContent: "rounded-xl border border-neutral-200 bg-white p-1 text-neutral-950 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  calendar: {
    root: "rounded-lg p-3",
    header: "mb-3 flex items-center justify-between gap-3",
    previous: "grid size-9 place-items-center rounded-lg border border-neutral-300 dark:border-neutral-800",
    heading: "text-sm font-semibold",
    next: "grid size-9 place-items-center rounded-lg border border-neutral-300 dark:border-neutral-800",
    grid: "w-full min-w-64 table-fixed",
    gridHead: "text-neutral-500",
    gridRow: "h-9",
    headCell: "size-9 text-center text-[11px] font-medium",
    cell: "size-9 p-0 text-center",
    cellTrigger: "grid size-9 place-items-center rounded-lg text-sm outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-selected]:bg-neutral-950 data-[akaza-selected]:text-white dark:hover:bg-neutral-800 dark:data-[akaza-selected]:bg-white dark:data-[akaza-selected]:text-neutral-950",
  },
};

function submit(event: Event) {
  submitted.value = `start: ${String(new FormData(event.currentTarget as HTMLFormElement).get("start"))}`;
}
</script>

<template>
  <form class="grid max-w-sm gap-4" @submit.prevent="submit">
    <Field
      label="Start date"
      name="start"
      description="Choose a date from August 10 through August 24."
      required
      :ui="{
        root: 'grid gap-1.5',
        label: 'text-sm font-medium text-neutral-900 dark:text-neutral-100',
        description: 'text-xs text-neutral-600 dark:text-neutral-400',
        error: 'text-xs text-red-600 dark:text-red-400',
      }"
    >
      <DateField
        v-model="value"
        :placeholder="new CalendarDate(2026, 8, 1)"
        :min-value="new CalendarDate(2026, 8, 10)"
        :max-value="new CalendarDate(2026, 8, 24)"
        show-calendar
        :ui="dateFieldUi"
      >
        <template #calendar-trigger>Calendar</template>
      </DateField>
    </Field>
    <div class="flex flex-wrap items-center gap-3">
      <button type="submit" class="h-9 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-950">
        Submit
      </button>
      <code class="text-xs text-neutral-600 dark:text-neutral-400">{{ submitted }}</code>
    </div>
  </form>
</template>
