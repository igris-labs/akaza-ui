<script setup lang="ts">
import type { CalendarDateValue, YearPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { YearPicker } from "akaza-ui";
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
const selected = shallowRef<YearPickerModelValue>(new CalendarDate(2028, 1, 1));
const multiplePage = shallowRef<CalendarDateValue>(new CalendarDate(2020, 1, 1));
const multiple = shallowRef<YearPickerModelValue>([
  new CalendarDate(2024, 1, 1),
  new CalendarDate(2028, 1, 1),
]);
</script>

<template>
  <section id="year-picker">
    <h2 :class="sectionTitle">Year Picker</h2>
    <p :class="sectionDescription">
      Paged year grid with configurable page size, single or multiple selection, constraints, and roving focus.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single year</h3>
        <div :class="canvasCol">
          <YearPicker v-model="selected" v-model:placeholder="page" :ui="periodPickerUi" />
          <code :class="codePill">selected: {{ Array.isArray(selected) ? "multiple" : selected?.year ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple + 9 years per page</h3>
        <div :class="canvasCol">
          <YearPicker
            v-model="multiple"
            v-model:placeholder="multiplePage"
            multiple
            :years-per-page="9"
            :ui="periodPickerUi"
          />
          <code :class="codePill">
            selected: {{ Array.isArray(multiple) ? multiple.map(value => value.year).join(", ") : "none" }}
          </code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Constraints + states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <YearPicker
            :placeholder="new CalendarDate(2026, 1, 1)"
            :min-value="new CalendarDate(2028, 1, 1)"
            :max-value="new CalendarDate(2033, 1, 1)"
            :ui="periodPickerUi"
          />
          <YearPicker :model-value="new CalendarDate(2028, 1, 1)" :placeholder="page" disabled :ui="periodPickerUi" />
        </div>
      </div>
    </div>
  </section>
</template>
