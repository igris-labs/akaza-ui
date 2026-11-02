<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";

import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover } from "../../ui/popover";

const value = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
const popoverValue = shallowRef<CalendarDateValue>();
const popoverOpen = ref(false);
</script>

<template>
  <div class="grid gap-3">
    <Calendar
      v-model="value"
      :placeholder="new CalendarDate(2026, 8, 1)"
    />
    <p class="text-xs text-muted-foreground">Selected: {{ value?.toString() ?? "none" }}</p>
    <Popover
      v-model="popoverOpen"
      teleport="body"
    >
      <template #trigger="{ toggle, triggerProps }">
        <ExampleButton
          v-bind="triggerProps"
          class="w-fit"
          @click="toggle"
        >
          {{ popoverValue?.toString() ?? "Choose date" }}
        </ExampleButton>
      </template>
      <template #content>
        <Calendar
          v-model="popoverValue"
          prevent-deselect
          :placeholder="new CalendarDate(2026, 8, 1)"
          @value-change="popoverOpen = false"
        />
      </template>
    </Popover>
  </div>
</template>
