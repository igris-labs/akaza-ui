<script setup lang="ts">
import type { TimeValue } from "akaza-ui";
import { Time } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Field, TimeField } from "akaza-ui";
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
  timeFieldUi,
} from "../styles";

const office = shallowRef<TimeValue>(new Time(9, 30));
const precise = shallowRef<TimeValue>(new Time(14, 7, 30));
const requiredTime = shallowRef<TimeValue>();
const submitted = ref("Not submitted.");

function submit(event: Event) {
  submitted.value = `meeting: ${String(new FormData(event.currentTarget as HTMLFormElement).get("meeting"))}`;
}

function unavailable(value: TimeValue) {
  return value.hour === 12;
}
</script>

<template>
  <section id="time-field">
    <h2 :class="sectionTitle">Time Field</h2>
    <p :class="sectionDescription">
      Locale-aware time segments with 12/24-hour cycles, granularity, step snapping, constraints, and native forms.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">12-hour and 24-hour cycles</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <div class="grid gap-3">
            <TimeField v-model="office" :hour-cycle="12" :ui="timeFieldUi" />
            <code :class="codePill">12-hour: {{ office.toString() }}</code>
          </div>
          <div class="grid gap-3">
            <TimeField v-model="office" :hour-cycle="24" :ui="timeFieldUi" />
            <code :class="codePill">24-hour: {{ office.toString() }}</code>
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Seconds + 15-minute snapping</h3>
        <div :class="canvasCol">
          <TimeField
            v-model="precise"
            granularity="second"
            :hour-cycle="24"
            :step="{ minute: 15 }"
            step-snapping
            :ui="timeFieldUi"
          />
          <code :class="codePill">value: {{ precise.toString() }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field validation + native form</h3>
        <form :class="canvasCol" @submit.prevent="submit">
          <Field
            label="Meeting time"
            name="meeting"
            description="Required between 09:00 and 17:00. Noon is unavailable."
            required
            :ui="{ label: fieldLabel, description: fieldDescription, error: fieldError }"
          >
            <TimeField
              v-model="requiredTime"
              :hour-cycle="24"
              :min-value="new Time(9)"
              :max-value="new Time(17)"
              :is-time-unavailable="unavailable"
              :ui="timeFieldUi"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" :class="buttonPrimary">Submit time</button>
            <code :class="codePill">{{ submitted }}</code>
          </div>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">Read-only and disabled</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <TimeField :model-value="new Time(9, 30)" read-only :ui="timeFieldUi" />
          <TimeField :model-value="new Time(9, 30)" disabled :ui="timeFieldUi" />
        </div>
      </div>
    </div>
  </section>
</template>
