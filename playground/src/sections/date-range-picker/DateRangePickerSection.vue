<script setup lang="ts">
import type { AkazaChangeEventDetails, CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { DateRangePicker, Field } from "akaza-ui";
import {
  canvasCol,
  codePill,
  dateRangePickerUi,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  sectionDescription,
  sectionTitle,
} from "../styles";

const booking = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
const constrained = shallowRef<CalendarDateRange>({});
const fixed = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 10),
});
const controlledOpen = ref(false);
const guardedOpen = ref(false);
const keepCalendarOpen = ref(false);

function guardCalendar(open: boolean, details: AkazaChangeEventDetails) {
  if (!open && keepCalendarOpen.value) details.cancel();
}

function unavailable(date: CalendarDateValue) {
  return [16, 17].includes(date.day);
}
</script>

<template>
  <section id="date-range-picker">
    <h2 :class="sectionTitle">Date Range Picker</h2>
    <p :class="sectionDescription">
      Date Range Field and range Calendar composed into one keyboard-accessible, collision-aware popup.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Two-month booking range</h3>
        <div :class="canvasCol">
          <DateRangePicker
            v-model="booking"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :number-of-months="2"
            paged-navigation
            fixed-weeks
            close-label="Done"
            :ui="dateRangePickerUi"
          >
            <template #trigger><span aria-hidden="true">▦</span></template>
          </DateRangePicker>
          <code :class="codePill">{{ booking.start?.toString() }} — {{ booking.end?.toString() }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Constraints + close on select</h3>
        <div :class="canvasCol">
          <Field
            label="Stay dates"
            description="Up to 7 days. August 16 and 17 are unavailable."
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <DateRangePicker
              v-model="constrained"
              close-on-select
              :placeholder="new CalendarDate(2026, 8, 1)"
              :maximum-days="7"
              :is-date-unavailable="unavailable"
              :ui="dateRangePickerUi"
            >
              <template #trigger><span aria-hidden="true">▦</span></template>
            </DateRangePicker>
          </Field>
          <code :class="codePill">state: {{ constrained.end ? "complete" : constrained.start ? "select end" : "empty" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Controlled popup + fixed start</h3>
        <div :class="canvasCol">
          <DateRangePicker
            v-model="fixed"
            v-model:open="controlledOpen"
            fixed-date="start"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :ui="dateRangePickerUi"
          >
            <template #trigger="{ isOpen }"><span aria-hidden="true">{{ isOpen ? "×" : "▦" }}</span></template>
            <template #footer>Start remains August 10. Choose checkout date.</template>
          </DateRangePicker>
          <code :class="codePill">popup: {{ controlledOpen ? "open" : "closed" }}</code>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Cancelable calendar dismissal</h3>
        <div :class="canvasCol">
          <label class="flex items-center gap-2 text-sm"><input v-model="keepCalendarOpen" type="checkbox">Keep calendar open</label>
          <DateRangePicker v-model:open="guardedOpen" aria-label="Guarded range" calendar-label="Guarded range calendar" close-label="Done" :placeholder="new CalendarDate(2026, 8, 12)" :ui="dateRangePickerUi" @open-change="guardCalendar" />
          <output :class="codePill">calendar: {{ guardedOpen ? "open" : "closed" }}</output>
        </div>
      </div>
    </div>
  </section>
</template>
