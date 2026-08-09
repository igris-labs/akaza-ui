<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { Calendar, Popover } from "akaza-ui";
import { ref, shallowRef } from "vue";

const value = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
const popoverValue = shallowRef<CalendarDateValue>();
const popoverOpen = ref(false);
const control = "grid size-9 place-items-center rounded-lg border border-neutral-300 text-lg text-neutral-900 disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-100";
const ui = {
  root: "w-fit max-w-full rounded-xl border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
  header: "mb-3 flex items-center justify-between gap-3",
  previous: control,
  heading: "text-sm font-semibold",
  next: control,
  grids: "max-w-full overflow-x-auto",
  grid: "w-full min-w-64 table-fixed",
  gridHead: "text-neutral-500",
  gridRow: "h-9",
  headCell: "size-9 text-center text-[11px] font-medium",
  cell: "size-9 p-0 text-center",
  cellTrigger: "grid size-9 place-items-center rounded-lg text-sm outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-selected]:bg-neutral-950 data-[akaza-selected]:text-white data-[akaza-today]:ring-1 data-[akaza-today]:ring-inset data-[akaza-today]:ring-neutral-300 data-[akaza-outside-view]:text-neutral-500 data-[akaza-disabled]:text-neutral-500 dark:hover:bg-neutral-800 dark:data-[akaza-selected]:bg-white dark:data-[akaza-selected]:text-neutral-950 dark:data-[akaza-outside-view]:text-neutral-400 dark:data-[akaza-disabled]:text-neutral-400",
};
</script>

<template>
  <div class="grid gap-3">
    <Calendar
      v-model="value"
      :placeholder="new CalendarDate(2026, 8, 1)"
      :ui="ui"
    />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">
      Selected: {{ value?.toString() ?? "none" }}
    </p>
    <Popover v-model="popoverOpen" teleport="body" :ui="{ content: 'w-min max-w-[calc(100dvw-0.5rem)] overflow-auto rounded-xl bg-white shadow-lg dark:bg-neutral-950' }">
      <template #trigger="{ toggle, triggerProps }">
        <button
          v-bind="triggerProps"
          class="w-fit rounded-lg bg-neutral-950 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-950"
          @click="toggle"
        >
          {{ popoverValue?.toString() ?? "Choose date" }}
        </button>
      </template>
      <template #content>
        <Calendar
          v-model="popoverValue"
          prevent-deselect
          :placeholder="new CalendarDate(2026, 8, 1)"
          :ui="ui"
          @value-change="popoverOpen = false"
        />
      </template>
    </Popover>
  </div>
</template>
