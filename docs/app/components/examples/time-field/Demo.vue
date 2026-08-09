<script setup lang="ts">
import type { TimeValue } from "akaza-ui";
import { Time } from "@internationalized/date";
import { Field, TimeField } from "akaza-ui";
import { shallowRef } from "vue";

const value = shallowRef<TimeValue>(new Time(9, 30));
const ui = {
  root: "h-10 w-full max-w-sm gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-950 shadow-sm data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-neutral-500 data-[akaza-invalid]:border-red-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  segments: "min-w-0 flex-1",
  segment: "rounded px-0.5 text-sm tabular-nums outline-none placeholder:text-neutral-500 focus:bg-neutral-100 dark:focus:bg-neutral-800",
  literal: "text-sm text-neutral-500",
  dayPeriod: "rounded px-1 text-xs font-medium text-neutral-600 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800",
  timeZone: "text-xs text-neutral-500",
};
</script>

<template>
  <Field label="Meeting time" description="Arrow keys step segments. Click AM/PM to switch periods.">
    <TimeField v-model="value" :hour-cycle="12" :ui="ui" />
  </Field>
  <p class="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
    Value: {{ value.toString() }}
  </p>
</template>
