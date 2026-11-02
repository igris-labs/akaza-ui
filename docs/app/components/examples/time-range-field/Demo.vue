<script setup lang="ts">
import type { TimeRange } from "akaza-ui";
import { Time } from "@internationalized/date";
import { shallowRef } from "vue";
import { Field } from "../../ui/field";
import { TimeRangeField } from "../../ui/time-range-field";

const value = shallowRef<TimeRange>({ start: new Time(9), end: new Time(17) });
</script>

<template>
  <Field
    label="Working hours"
    description="Both endpoints share one range validity state."
  >
    <TimeRangeField
      v-model="value"
      :hour-cycle="24"
    />
  </Field>
  <p class="mt-3 text-xs text-muted-foreground">
    Range: {{ value.start?.toString() }} - {{ value.end?.toString() }}
  </p>
</template>
