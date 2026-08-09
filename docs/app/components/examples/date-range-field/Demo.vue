<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { DateRangeField, Field } from "akaza-ui";
import { ref, shallowRef } from "vue";

const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
const submitted = ref("Not submitted.");
const endpointUi = {
  root: "h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-neutral-950 shadow-none data-[akaza-focused]:ring-0 data-[akaza-invalid]:text-red-600 dark:text-neutral-50",
  segments: "min-w-0 flex-1",
  segment: "rounded px-0.5 text-sm tabular-nums outline-none placeholder:text-neutral-400 focus:bg-neutral-100 dark:focus:bg-neutral-800",
  literal: "text-sm text-neutral-500",
};
const ui = {
  root: "h-10 w-full gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-950 shadow-sm data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-neutral-500 data-[akaza-invalid]:border-red-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  start: "min-w-0 flex-1",
  startField: endpointUi,
  separator: "text-sm text-neutral-500",
  end: "min-w-0 flex-1",
  endField: endpointUi,
};

function unavailable(date: CalendarDateValue) {
  return date.toString() === "2026-08-16";
}

function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  submitted.value = `${String(data.get("travel.start"))} to ${String(data.get("travel.end"))}`;
}
</script>

<template>
  <form class="grid max-w-xl gap-4" @submit.prevent="submit">
    <Field
      label="Travel dates"
      name="travel"
      description="Required. Maximum 10 days; August 16 is unavailable."
      required
      :ui="{
        root: 'grid gap-1.5',
        label: 'text-sm font-medium text-neutral-900 dark:text-neutral-100',
        description: 'text-xs text-neutral-600 dark:text-neutral-400',
        error: 'text-xs text-red-600 dark:text-red-400',
      }"
    >
      <DateRangeField
        v-model="value"
        :placeholder="new CalendarDate(2026, 8, 1)"
        :maximum-days="10"
        :is-date-unavailable="unavailable"
        :ui="ui"
      />
    </Field>
    <div class="flex flex-wrap items-center gap-3">
      <button type="submit" class="h-9 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-950">
        Submit range
      </button>
      <code class="text-xs text-neutral-600 dark:text-neutral-400">{{ submitted }}</code>
    </div>
  </form>
</template>
