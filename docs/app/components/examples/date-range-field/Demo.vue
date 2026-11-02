<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";

import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { DateRangeField } from "../../ui/date-range-field";
import { Field } from "../../ui/field";

const value = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
const submitted = ref("Not submitted.");

function unavailable(date: CalendarDateValue) {
  return date.toString() === "2026-08-16";
}

function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  submitted.value = `${String(data.get("travel.start"))} to ${String(data.get("travel.end"))}`;
}
</script>

<template>
  <form
    class="grid max-w-xl gap-4"
    @submit.prevent="submit"
  >
    <Field
      label="Travel dates"
      name="travel"
      description="Required. Maximum 10 days; August 16 is unavailable."
      required
    >
      <DateRangeField
        v-model="value"
        :placeholder="new CalendarDate(2026, 8, 1)"
        :maximum-days="10"
        :is-date-unavailable="unavailable"
      />
    </Field>
    <div class="flex flex-wrap items-center gap-3">
      <ExampleButton
        type="submit"
        class="h-9"
      >
        Submit range
      </ExampleButton>
      <code class="text-xs text-muted-foreground">{{ submitted }}</code>
    </div>
  </form>
</template>
