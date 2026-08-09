<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { YearRangePicker } from "akaza-ui";
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

const page = shallowRef<CalendarDateValue>(new CalendarDate(2024, 1, 1));
const range = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 1, 1),
  end: new CalendarDate(2029, 1, 1),
});
const limitedPage = shallowRef<CalendarDateValue>(new CalendarDate(2024, 1, 1));
const limited = shallowRef<CalendarDateRange>({});
</script>

<template>
  <section id="year-range-picker">
    <h2 :class="sectionTitle">Year Range Picker</h2>
    <p :class="sectionDescription">
      Year-level range selection with hover preview, fixed endpoints, maximum length, and custom page size.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Basic range</h3>
        <div :class="canvasCol">
          <YearRangePicker v-model="range" v-model:placeholder="page" :ui="periodPickerUi" />
          <code :class="codePill">{{ range.start?.year ?? "start" }} - {{ range.end?.year ?? "select end" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Maximum 5 years</h3>
        <div :class="canvasCol">
          <YearRangePicker
            v-model="limited"
            v-model:placeholder="limitedPage"
            :maximum-years="5"
            :years-per-page="9"
            :ui="periodPickerUi"
          />
          <code :class="codePill">Choose a range containing at most five years.</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Fixed start + read-only</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <YearRangePicker
            :model-value="{ start: new CalendarDate(2027, 1, 1) }"
            :placeholder="new CalendarDate(2024, 1, 1)"
            fixed-date="start"
            :ui="periodPickerUi"
          />
          <YearRangePicker :model-value="range" :placeholder="page" read-only :ui="periodPickerUi" />
        </div>
      </div>
    </div>
  </section>
</template>
