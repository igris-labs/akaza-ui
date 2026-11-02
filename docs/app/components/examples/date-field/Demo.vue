<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";

import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { DateField } from "../../ui/date-field";
import { Field } from "../../ui/field";

const value = shallowRef<CalendarDateValue>();
const submitted = ref("Not submitted.");

function submit(event: Event) {
  submitted.value = `start: ${String(new FormData(event.currentTarget as HTMLFormElement).get("start"))}`;
}
</script>

<template>
  <form
    class="grid w-full max-w-72 gap-4"
    @submit.prevent="submit"
  >
    <Field
      label="Start date"
      name="start"
      description="Choose a date from August 10 through August 24."
      required
    >
      <DateField
        v-model="value"
        :placeholder="new CalendarDate(2026, 8, 1)"
        :min-value="new CalendarDate(2026, 8, 10)"
        :max-value="new CalendarDate(2026, 8, 24)"
        show-calendar
        class="w-full"
      />
    </Field>
    <div class="flex flex-wrap items-center gap-3">
      <ExampleButton
        type="submit"
        size="md"
      >
        Submit
      </ExampleButton>
      <code class="text-xs text-muted-foreground">{{ submitted }}</code>
    </div>
  </form>
</template>
