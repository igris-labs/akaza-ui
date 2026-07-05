<script setup lang="ts">
import { computed, ref } from "vue";
import { Field, Fieldset, Input } from "akaza-ui";
import {
  buttonGhost,
  canvas,
  canvasCol,
  codePill,
  exampleStack,
  exampleTitle,
  fieldError,
  fieldLabel,
  fieldsetContent,
  fieldsetDescription,
  fieldsetLegend,
  fieldsetRoot,
  inputControl,
  sectionDescription,
  sectionTitle,
} from "../styles";

const name = ref("Ada Lovelace");
const company = ref("");
const disabled = ref(false);
const card = ref("");

const billingSummary = computed(() => {
  const parts = [name.value, company.value].filter(Boolean);
  return parts.length ? parts.join(" · ") : "(empty)";
});

const cardInvalid = computed(() => card.value.length > 0 && card.value.replace(/\s/g, "").length < 12);
</script>

<template>
  <section id="fieldset">
    <h2 :class="sectionTitle">Fieldset</h2>
    <p :class="sectionDescription">
      Native fieldset wrapper with legend, description, disabled, and invalid states.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Grouped fields</h3>
        <div :class="canvas">
          <Fieldset
            legend="Billing details"
            description="Grouped controls share one semantic boundary."
            :ui="{
              root: fieldsetRoot,
              legend: fieldsetLegend,
              description: fieldsetDescription,
              content: fieldsetContent,
            }"
          >
            <Field label="Name" name="billing-name" :ui="{ label: fieldLabel }">
              <Input v-model="name" placeholder="Ada Lovelace" :ui="{ root: inputControl }" />
            </Field>
            <Field label="Company" name="company" :ui="{ label: fieldLabel }">
              <Input v-model="company" placeholder="Analytical Engines Inc." :ui="{ root: inputControl }" />
            </Field>
            <code :class="codePill">billing: {{ billingSummary }}</code>
          </Fieldset>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Disabled group</h3>
        <div :class="canvasCol">
          <button :class="buttonGhost" type="button" @click="disabled = !disabled">
            {{ disabled ? "Enable" : "Disable" }} shipping fields
          </button>
          <Fieldset
            legend="Shipping details"
            description="Native fieldset disabled state disables every nested control."
            :disabled="disabled"
            :ui="{
              root: fieldsetRoot,
              legend: fieldsetLegend,
              description: fieldsetDescription,
              content: fieldsetContent,
            }"
          >
            <Field label="Address" :ui="{ label: fieldLabel }">
              <Input placeholder="221B Baker Street" :ui="{ root: inputControl }" />
            </Field>
            <Field label="City" :ui="{ label: fieldLabel }">
              <Input placeholder="London" :ui="{ root: inputControl }" />
            </Field>
          </Fieldset>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Invalid group state</h3>
        <div :class="canvas">
          <Fieldset
            legend="Payment"
            description="The fieldset can mark the whole group invalid while fields still own their labels."
            :invalid="cardInvalid"
            :ui="{
              root: fieldsetRoot,
              legend: fieldsetLegend,
              description: fieldsetDescription,
              content: fieldsetContent,
            }"
          >
            <Field
              label="Card number"
              :error="cardInvalid ? 'Enter at least 12 digits.' : undefined"
              :ui="{ label: fieldLabel, error: fieldError }"
            >
              <Input
                v-model="card"
                inputmode="numeric"
                placeholder="4242 4242 4242"
                :ui="{ root: inputControl }"
              />
            </Field>
          </Fieldset>
        </div>
      </div>
    </div>
  </section>
</template>
