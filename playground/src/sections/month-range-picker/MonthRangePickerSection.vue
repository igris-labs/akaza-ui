<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthRangePicker } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  periodPickerUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const range = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 3, 1),
  end: new CalendarDate(2026, 6, 1),
});
const limitedPage = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const limited = shallowRef<CalendarDateRange>({});
const fixedPage = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const fixed = shallowRef<CalendarDateRange>({ start: new CalendarDate(2026, 4, 1) });

function unavailable(date: CalendarDateValue) {
  return date.month === 7;
}
</script>

<template>
  <section id="month-range-picker">
    <h2 :class="sectionTitle">Month Range Picker</h2>
    <p :class="sectionDescription">
      Month-level ranges with hover preview, fixed boundaries, maximum length, and unavailable periods.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Basic range</h3>
        <div :class="canvasCol">
          <MonthRangePicker v-model="range" v-model:placeholder="page" :ui="periodPickerUi" />
          <code :class="codePill">
            {{ range.start?.toString() ?? "start" }} - {{ range.end?.toString() ?? "select end" }}
          </code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Maximum 4 months + unavailable July</h3>
        <div :class="canvasCol">
          <MonthRangePicker
            v-model="limited"
            v-model:placeholder="limitedPage"
            :maximum-months="4"
            :is-month-unavailable="unavailable"
            :ui="periodPickerUi"
          />
          <code :class="codePill">Select two endpoints no more than four months apart.</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Fixed start + disabled</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <MonthRangePicker v-model="fixed" v-model:placeholder="fixedPage" fixed-date="start" :ui="periodPickerUi" />
          <MonthRangePicker :model-value="range" :placeholder="page" disabled :ui="periodPickerUi" />
        </div>
      </div>
    </div>
  </section>
</template>
