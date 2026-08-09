<script setup lang="ts">
import type { AkazaChangeEventDetails, CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { DateRangeField, Field } from "akaza-ui";
import {
  buttonPrimary,
  canvasCol,
  canvasGrid,
  codePill,
  dateRangeFieldUi,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  sectionDescription,
  sectionTitle,
} from "../styles";

const trip = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
const requiredRange = shallowRef<CalendarDateRange>({});
const fixedRange = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 10),
  end: new CalendarDate(2026, 8, 14),
});
const submitted = ref("Not submitted.");
const lastEvent = ref("No canceled range yet.");

function unavailable(date: CalendarDateValue) {
  return date.toString() === "2026-08-16";
}

function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  submitted.value = `${String(data.get("travel.start"))} to ${String(data.get("travel.end"))}`;
}

function guardRange(value: CalendarDateRange, details: AkazaChangeEventDetails) {
  if (value.end?.day === 20) {
    details.cancel();
    lastEvent.value = "Canceled: checkout on August 20 is blocked.";
  }
}
</script>

<template>
  <section id="date-range-field">
    <h2 :class="sectionTitle">Date Range Field</h2>
    <p :class="sectionDescription">
      Two locale-ordered segmented dates with one range model, aggregate validation, fixed endpoints, and native forms.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Controlled range</h3>
        <div :class="canvasCol">
          <DateRangeField v-model="trip" aria-label="Trip dates" :ui="dateRangeFieldUi" />
          <code :class="codePill">{{ trip.start?.toString() }} — {{ trip.end?.toString() }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field validation + native form</h3>
        <form :class="canvasCol" @submit.prevent="submit">
          <Field
            label="Travel dates"
            name="travel"
            description="Required. Maximum 10 days; August 16 is unavailable."
            required
            :ui="{ label: fieldLabel, description: fieldDescription, error: fieldError }"
          >
            <DateRangeField
              v-model="requiredRange"
              :placeholder="new CalendarDate(2026, 8, 1)"
              :maximum-days="10"
              :is-date-unavailable="unavailable"
              :ui="dateRangeFieldUi"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" :class="buttonPrimary">Submit range</button>
            <code :class="codePill">{{ submitted }}</code>
          </div>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">Fixed endpoint + cancelable change</h3>
        <div :class="canvasCol">
          <DateRangeField
            v-model="fixedRange"
            fixed-date="start"
            :ui="dateRangeFieldUi"
            @value-change="guardRange"
          />
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Locale, read-only, and disabled</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <DateRangeField v-model="trip" locale="en-GB" aria-label="UK range" :ui="dateRangeFieldUi" />
          <DateRangeField :model-value="trip" read-only aria-label="Read-only range" :ui="dateRangeFieldUi" />
          <DateRangeField :model-value="trip" disabled aria-label="Disabled range" :ui="dateRangeFieldUi" />
        </div>
      </div>
    </div>
  </section>
</template>
