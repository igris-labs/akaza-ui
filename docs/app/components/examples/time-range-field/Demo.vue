<script setup lang="ts">
import type { TimeRange } from "akaza-ui";
import { Time } from "@internationalized/date";
import { Field, TimeRangeField } from "akaza-ui";
import { shallowRef } from "vue";

const value = shallowRef<TimeRange>({ start: new Time(9), end: new Time(17) });
const endpoint = {
  root: "h-8 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none",
  segments: "min-w-0 flex-1",
  segment: "rounded px-0.5 text-sm tabular-nums outline-none placeholder:text-neutral-500 focus:bg-neutral-100 dark:focus:bg-neutral-800",
  literal: "text-sm text-neutral-500",
  dayPeriod: "rounded px-1 text-xs font-medium text-neutral-600 outline-none hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
};
const ui = {
  root: "h-10 w-full max-w-xl gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-950 shadow-sm data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-neutral-500 data-[akaza-invalid]:border-red-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  start: "min-w-0 flex-1",
  startField: endpoint,
  separator: "text-sm text-neutral-500",
  end: "min-w-0 flex-1",
  endField: endpoint,
};
</script>

<template>
  <Field label="Working hours" description="Both endpoints share one range validity state.">
    <TimeRangeField v-model="value" :hour-cycle="24" :ui="ui" />
  </Field>
  <p class="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
    Range: {{ value.start?.toString() }} - {{ value.end?.toString() }}
  </p>
</template>
