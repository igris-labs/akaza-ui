<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";
import { Field, NumberField } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  numberFieldUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const seats = ref<number | null>(3);
const cpu = ref<number | null>(2);
const percent = ref<number | null>(0.25);
const guarded = ref<number | null>(5);
const lastEvent = ref("No event yet.");

function log(value: number | null, details: AkazaChangeEventDetails) {
  lastEvent.value = `value-change: ${value ?? "(empty)"}, reason: ${details.reason}`;
}

function blockOdd(value: number | null, details: AkazaChangeEventDetails) {
  if (value !== null && value % 2 !== 0) {
    details.cancel();
    lastEvent.value = `Canceled odd value ${value}.`;
    return;
  }
  lastEvent.value = `Accepted ${value ?? "(empty)"}.`;
}
</script>

<template>
  <section id="number-field">
    <h2 :class="sectionTitle">Number Field</h2>
    <p :class="sectionDescription">
      Spinbutton input with increment/decrement buttons, min/max, step, and keyboard control.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Increment/decrement</h3>
        <div :class="canvasCol">
          <NumberField v-model="seats" :min="1" :max="10" :ui="numberFieldUi" @value-change="log" />
          <code :class="codePill">seats: {{ seats ?? "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field integration</h3>
        <div :class="canvasCol">
          <Field
            label="CPU cores"
            name="cpu"
            description="Required number field with native min/max/step validation."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <NumberField v-model="cpu" :min="1" :max="16" :step="1" :ui="numberFieldUi" />
          </Field>
          <code :class="codePill">cpu: {{ cpu ?? "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Decimal step</h3>
        <div :class="canvasCol">
          <NumberField v-model="percent" :min="0" :max="1" :step="0.05" :ui="numberFieldUi" />
          <code :class="codePill">ratio: {{ percent ?? "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">States + cancelable event</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <NumberField v-model="guarded" :min="0" :max="10" :ui="numberFieldUi" @value-change="blockOdd" />
          <NumberField :model-value="4" disabled :ui="numberFieldUi" />
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
