<script setup lang="ts">
import type { TimeRange } from "akaza-ui";
import { Time } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Field, TimeRangeField } from "akaza-ui";
import {
  buttonPrimary,
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  sectionDescription,
  sectionTitle,
  timeRangeFieldUi,
} from "../styles";

const shift = shallowRef<TimeRange>({ start: new Time(9), end: new Time(17) });
const requiredRange = shallowRef<TimeRange>({});
const precise = shallowRef<TimeRange>({ start: new Time(9, 15, 30), end: new Time(10, 45, 30) });
const submitted = ref("Not submitted.");

function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  submitted.value = `${String(data.get("window.start"))} - ${String(data.get("window.end"))}`;
}
</script>

<template>
  <section id="time-range-field">
    <h2 :class="sectionTitle">Time Range Field</h2>
    <p :class="sectionDescription">
      Coordinated start and end time segments with aggregate validation, constraints, and separate native form values.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Working hours</h3>
        <div :class="canvasCol">
          <TimeRangeField v-model="shift" :hour-cycle="24" :ui="timeRangeFieldUi" />
          <code :class="codePill">{{ shift.start?.toString() }} - {{ shift.end?.toString() }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Seconds granularity</h3>
        <div :class="canvasCol">
          <TimeRangeField v-model="precise" granularity="second" :hour-cycle="24" :ui="timeRangeFieldUi" />
          <code :class="codePill">Both endpoints include seconds.</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Required range + native form</h3>
        <form :class="canvasCol" @submit.prevent="submit">
          <Field
            label="Availability window"
            name="window"
            description="Both endpoints are required. End must be on or after start."
            required
            :ui="{ label: fieldLabel, description: fieldDescription, error: fieldError }"
          >
            <TimeRangeField
              v-model="requiredRange"
              :hour-cycle="24"
              :min-value="new Time(8)"
              :max-value="new Time(20)"
              :ui="timeRangeFieldUi"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" :class="buttonPrimary">Submit range</button>
            <code :class="codePill">{{ submitted }}</code>
          </div>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">12-hour, read-only, and disabled</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <TimeRangeField :model-value="shift" :hour-cycle="12" read-only :ui="timeRangeFieldUi" />
          <TimeRangeField :model-value="shift" :hour-cycle="12" disabled :ui="timeRangeFieldUi" />
        </div>
      </div>
    </div>
  </section>
</template>
