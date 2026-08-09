<script setup lang="ts">
import type { AkazaChangeEventDetails, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { DateField, Field } from "akaza-ui";
import {
  buttonPrimary,
  canvasCol,
  canvasGrid,
  codePill,
  dateFieldUi,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  sectionDescription,
  sectionTitle,
} from "../styles";

const selected = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
const requiredDate = shallowRef<CalendarDateValue>();
const britishDate = shallowRef<CalendarDateValue>(new CalendarDate(2026, 11, 24));
const guarded = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 14));
const submitted = ref("Not submitted.");
const lastEvent = ref("No canceled change yet.");

function unavailable(date: CalendarDateValue) {
  return date.toString() === "2026-08-18";
}

function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  submitted.value = `start: ${String(data.get("start"))}`;
}

function blockWeekends(value: CalendarDateValue | undefined, details: AkazaChangeEventDetails) {
  if (value && [15, 16].includes(value.day)) {
    details.cancel();
    lastEvent.value = `Canceled ${value.toString()}: weekend dates are blocked.`;
  }
}
</script>

<template>
  <section id="date-field">
    <h2 :class="sectionTitle">Date Field</h2>
    <p :class="sectionDescription">
      Locale-ordered date segments with keyboard editing, an optional calendar, constraints, Field state, and native forms.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Controlled segments + calendar</h3>
        <div :class="canvasCol">
          <DateField v-model="selected" aria-label="Deployment date" show-calendar :ui="dateFieldUi">
            <template #calendar-trigger>Calendar</template>
          </DateField>
          <code :class="codePill">selected: {{ selected?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field validation + native form</h3>
        <form :class="canvasCol" @submit.prevent="submit">
          <Field
            label="Start date"
            name="start"
            description="Required. Allowed from August 10 to August 24; August 18 is unavailable."
            required
            :ui="{ label: fieldLabel, description: fieldDescription, error: fieldError }"
          >
            <DateField
              v-model="requiredDate"
              :placeholder="new CalendarDate(2026, 8, 1)"
              :min-value="new CalendarDate(2026, 8, 10)"
              :max-value="new CalendarDate(2026, 8, 24)"
              :is-date-unavailable="unavailable"
              :ui="dateFieldUi"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" :class="buttonPrimary">Submit date</button>
            <code :class="codePill">{{ submitted }}</code>
          </div>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">Locale order + paste</h3>
        <div :class="canvasCol">
          <Field
            label="UK delivery date"
            description="Uses day/month/year order. Paste 2027-01-09 into any segment."
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <DateField v-model="britishDate" locale="en-GB" :ui="dateFieldUi" />
          </Field>
          <code :class="codePill">delivery: {{ britishDate?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">States + cancelable event</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field label="Guarded date" description="August 15 and 16 are rejected." :ui="{ label: fieldLabel, description: fieldDescription }">
            <DateField v-model="guarded" :ui="dateFieldUi" @value-change="blockWeekends" />
          </Field>
          <div class="grid content-start gap-4">
            <DateField :model-value="new CalendarDate(2026, 8, 12)" aria-label="Read-only date" read-only :ui="dateFieldUi" />
            <DateField :model-value="new CalendarDate(2026, 8, 12)" aria-label="Disabled date" disabled :ui="dateFieldUi" />
          </div>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
