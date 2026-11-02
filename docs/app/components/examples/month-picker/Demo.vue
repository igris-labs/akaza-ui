<script setup lang="ts">
import type { CalendarDateValue, MonthPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthPicker } from "../../ui/month-picker";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const value = shallowRef<MonthPickerModelValue>(new CalendarDate(2026, 8, 1));
</script>

<template>
  <div class="grid gap-3">
    <MonthPicker
      v-model="value"
      v-model:placeholder="page"
    />
    <p class="text-xs text-muted-foreground">
      Selected:
      {{
        Array.isArray(value)
          ? value.map((item) => item.toString()).join(", ")
          : (value?.toString() ?? "none")
      }}
    </p>
  </div>
</template>
