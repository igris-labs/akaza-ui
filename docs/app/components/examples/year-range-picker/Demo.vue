<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { YearRangePicker } from "../../ui/year-range-picker";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2024, 1, 1));
const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 1, 1),
  end: new CalendarDate(2029, 1, 1),
});
</script>

<template>
  <div class="grid gap-3">
    <YearRangePicker
      v-model="value"
      v-model:placeholder="page"
      :maximum-years="6"
    />
    <p class="text-xs text-muted-foreground">
      Range: {{ value.start?.year ?? "start" }} - {{ value.end?.year ?? "select end" }}
    </p>
  </div>
</template>
