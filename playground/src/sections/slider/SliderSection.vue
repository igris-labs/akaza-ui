<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";
import { Field, Slider } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  sectionDescription,
  sectionTitle,
  sliderUi,
  sliderVerticalUi,
} from "../styles";

const volume = ref(55);
const brightness = ref(40);
const stepValue = ref(30);
const commitLog = ref("No commit yet.");

function onCommit(value: number, details: AkazaChangeEventDetails) {
  commitLog.value = `value-commit: ${value}, reason: ${details.reason}`;
}
</script>

<template>
  <section id="slider">
    <h2 :class="sectionTitle">Slider</h2>
    <p :class="sectionDescription">
      Slider with ARIA value metadata, pointer drag, keyboard steps, and hidden form input.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Controlled value</h3>
        <div :class="canvasCol">
          <Slider v-model="volume" aria-label="Volume" :ui="sliderUi" @value-commit="onCommit" />
          <code :class="codePill">volume: {{ volume }}</code>
          <p :class="eventEntry">{{ commitLog }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field + form input</h3>
        <div :class="canvasCol">
          <Field
            label="Brightness"
            name="brightness"
            description="Slider inherits field name and described-by metadata."
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Slider v-model="brightness" :ui="sliderUi" />
          </Field>
          <code :class="codePill">brightness: {{ brightness }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Step + vertical orientation</h3>
        <div :class="[canvasGrid, 'grid-cols-[1fr_auto] items-center']">
          <div class="space-y-4">
            <Slider v-model="stepValue" :step="10" :ui="sliderUi" aria-label="Stepped slider" />
            <code :class="codePill">step: {{ stepValue }}</code>
          </div>
          <Slider v-model="stepValue" orientation="vertical" :step="10" :ui="sliderVerticalUi" aria-label="Vertical slider" />
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Disabled</h3>
        <div :class="canvasCol">
          <Slider :model-value="70" disabled :ui="sliderUi" aria-label="Disabled slider" />
        </div>
      </div>
    </div>
  </section>
</template>
