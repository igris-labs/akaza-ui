<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { computed, ref } from "vue";
import { Field, Input } from "akaza-ui";
import {
  buttonGhost,
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  inputControl,
  sectionDescription,
  sectionTitle,
} from "../styles";

const project = ref("Akaza");
const email = ref("");
const guarded = ref("");
const lastChange = ref("No input yet.");

const emailState = computed(() => {
  if (!email.value) return "Empty";
  return email.value.includes("@") ? "Looks valid" : "Missing @";
});

function logChange(value: string, details: AkazaChangeEventDetails) {
  lastChange.value = `value-change: "${value || "(empty)"}", reason: ${details.reason}`;
}

function blockNumbers(value: string, details: AkazaChangeEventDetails) {
  if (/\d/.test(value)) {
    details.cancel();
    lastChange.value = `Canceled "${value}" because numbers are blocked.`;
    return;
  }
  lastChange.value = `Accepted "${value || "(empty)"}".`;
}
</script>

<template>
  <section id="input">
    <h2 :class="sectionTitle">Input</h2>
    <p :class="sectionDescription">
      Native text input with controlled values, native attrs, state attrs, and cancelable changes.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Controlled value</h3>
        <div :class="canvasCol">
          <Input
            v-model="project"
            placeholder="Project name"
            :ui="{ root: inputControl }"
            @value-change="logChange"
          />
          <div class="flex flex-wrap items-center gap-2">
            <button :class="buttonGhost" type="button" @click="project = ''">Clear</button>
            <code :class="codePill">model: {{ project || "(empty)" }}</code>
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Native attrs + Field integration</h3>
        <div :class="canvasCol">
          <Field
            label="Email"
            name="email"
            description="Uses type=email, autocomplete, required, and inherited aria-describedby."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :ui="{ root: inputControl }"
            />
          </Field>
          <p class="text-sm text-muted-foreground">
            State: <span class="font-medium text-foreground">{{ emailState }}</span>
          </p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">States</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-3']">
          <Field label="Invalid" :ui="{ label: fieldLabel }">
            <Input invalid placeholder="aria-invalid=true" :ui="{ root: inputControl }" />
          </Field>
          <Field label="Readonly" :ui="{ label: fieldLabel }">
            <Input readonly model-value="Read only" :ui="{ root: inputControl }" />
          </Field>
          <Field label="Disabled" :ui="{ label: fieldLabel }">
            <Input disabled model-value="Disabled" :ui="{ root: inputControl }" />
          </Field>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">value-change event (cancelable)</h3>
        <div :class="canvasCol">
          <Input
            v-model="guarded"
            placeholder="Letters only"
            :ui="{ root: inputControl }"
            @value-change="blockNumbers"
          />
          <p class="text-xs text-muted-foreground">{{ lastChange }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
