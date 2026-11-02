<script setup lang="ts">
import type { CalendarDateValue, YearPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { YearPicker } from "../../ui/year-picker";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2024, 1, 1));
const value = shallowRef<YearPickerModelValue>(new CalendarDate(2028, 1, 1));
</script>

<template>
  <div class="grid gap-3">
    <YearPicker
      v-model="value"
      v-model:placeholder="page"
    />
    <p class="text-xs text-muted-foreground">
      Selected:
      {{
        Array.isArray(value) ? value.map((item) => item.year).join(", ") : (value?.year ?? "none")
      }}
    </p>
  </div>
</template>
