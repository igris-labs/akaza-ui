<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";
import { Field, PinInput } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  pinInputUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const otp = ref("");
const accessCode = ref("AK");
const masked = ref("12");
const lastEvent = ref("Enter all six digits.");
const uppercase = /^[A-Z]$/;

function onComplete(value: string, details: AkazaChangeEventDetails) {
  lastEvent.value = `complete: ${value}, reason: ${details.reason}`;
}
</script>

<template>
  <section id="pin-input">
    <h2 :class="sectionTitle">Pin / OTP Input</h2>
    <p :class="sectionDescription">
      Multi-cell verification input with paste distribution, OTP metadata, masking, and keyboard navigation.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Numeric one-time code</h3>
        <div :class="canvasCol">
          <PinInput v-model="otp" :length="6" type="number" otp aria-label="Verification code" :ui="pinInputUi" @complete="onComplete" />
          <code :class="codePill">otp: {{ otp || "(empty)" }}</code>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Allowed characters</h3>
        <div :class="canvasCol">
          <PinInput v-model="accessCode" :length="4" :allowed-chars="uppercase" aria-label="Uppercase access code" :ui="pinInputUi" />
          <code :class="codePill">code: {{ accessCode || "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Required Field + masked state</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field
            label="Security PIN"
            name="pin"
            description="Blur before completing the value to reveal native invalid state."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <PinInput v-model="masked" mask type="number" :length="4" :ui="pinInputUi" />
          </Field>
          <PinInput model-value="1234" type="number" disabled aria-label="Disabled PIN" :ui="pinInputUi" />
        </div>
      </div>
    </div>
  </section>
</template>
