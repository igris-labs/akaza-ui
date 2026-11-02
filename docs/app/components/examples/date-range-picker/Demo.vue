<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { DateRangePicker } from "../../ui/date-range-picker";

const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
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
    >
      <template #trigger><span aria-hidden="true">▦</span></template>
    </DateRangePicker>
    <p class="text-xs text-muted-foreground">
      Selected: {{ value.start?.toString() ?? "none" }} to
      {{ value.end?.toString() ?? "select end" }}
    </p>
  </div>
</template>
