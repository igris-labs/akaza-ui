<script setup lang="ts">
import type { CalendarDateValue, MonthPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthPicker } from "akaza-ui";
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
const selected = shallowRef<MonthPickerModelValue>(new CalendarDate(2026, 8, 1));
const multiplePage = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const multiple = shallowRef<MonthPickerModelValue>([
  new CalendarDate(2026, 3, 1),
  new CalendarDate(2026, 8, 1),
]);
const constrainedPage = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
const constrained = shallowRef<MonthPickerModelValue>();

function unavailable(date: CalendarDateValue) {
  return date.month === 7 || date.month === 12;
}
</script>

<template>
  <section id="month-picker">
    <h2 :class="sectionTitle">Month Picker</h2>
    <p :class="sectionDescription">
      Locale-aware month grid with single or multiple selection, paging, constraints, and roving focus.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single month</h3>
        <div :class="canvasCol">
          <MonthPicker v-model="selected" v-model:placeholder="page" :ui="periodPickerUi" />
          <code :class="codePill">selected: {{ Array.isArray(selected) ? "multiple" : selected?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple months</h3>
        <div :class="canvasCol">
          <MonthPicker v-model="multiple" v-model:placeholder="multiplePage" multiple :ui="periodPickerUi" />
          <code :class="codePill">
            selected: {{ Array.isArray(multiple) ? multiple.map(value => value.month).join(", ") : "none" }}
          </code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Constraints + unavailable</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <MonthPicker
            v-model="constrained"
            v-model:placeholder="constrainedPage"
            :min-value="new CalendarDate(2026, 3, 1)"
            :max-value="new CalendarDate(2026, 10, 1)"
            :is-month-unavailable="unavailable"
            :ui="periodPickerUi"
          />
          <MonthPicker
            :model-value="new CalendarDate(2026, 8, 1)"
            :placeholder="new CalendarDate(2026, 1, 1)"
            read-only
            :ui="periodPickerUi"
          />
        </div>
      </div>
    </div>
  </section>
</template>
