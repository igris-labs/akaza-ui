<script setup lang="ts">
import type { TimeValue } from "akaza-ui";
import { Time } from "@internationalized/date";
import { shallowRef } from "vue";
import { Field } from "../../ui/field";
import { TimeField } from "../../ui/time-field";

const value = shallowRef<TimeValue>(new Time(9, 30));
</script>

<template>
  <Field
    label="Meeting time"
    description="Arrow keys step segments. Click AM/PM to switch periods."
  >
    <TimeField
      v-model="value"
      :hour-cycle="12"
    />
  </Field>
  <p class="mt-3 text-xs text-muted-foreground">Value: {{ value.toString() }}</p>
</template>
