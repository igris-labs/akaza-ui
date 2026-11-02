<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthRangePicker } from "../../ui/month-range-picker";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 3, 1),
  end: new CalendarDate(2026, 6, 1),
});
</script>

<template>
  <div class="grid gap-3">
    <MonthRangePicker
      v-model="value"
      v-model:placeholder="page"
      :maximum-months="6"
    />
    <p class="text-xs text-muted-foreground">
      Range: {{ value.start?.toString() ?? "start" }} - {{ value.end?.toString() ?? "select end" }}
    </p>
  </div>
</template>
