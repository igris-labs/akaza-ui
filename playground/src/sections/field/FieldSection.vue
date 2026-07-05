<script setup lang="ts">
import { computed, ref } from "vue";
import { Field, Input } from "akaza-ui";
import {
  buttonGhost,
  canvas,
  canvasCol,
  codePill,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  fieldRow,
  inputControl,
  sectionDescription,
  sectionTitle,
  stateRow,
} from "../styles";

const username = ref("");
const email = ref("");
const disabled = ref(false);

const usernameError = computed(() => {
  if (!username.value) return "";
  return username.value.length < 3 ? "Use at least 3 characters." : "";
});

const emailError = computed(() => {
  if (!email.value) return "";
  return email.value.includes("@") ? "" : "Enter a valid email address.";
});
</script>

<template>
  <section id="field">
    <h2 :class="sectionTitle">Field</h2>
    <p :class="sectionDescription">
      Label, description, error, and automatic input association.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Label + description + Input</h3>
        <div :class="canvasCol">
          <Field
            label="Username"
            name="username"
            description="The Input inherits id, name, required, disabled, and aria-describedby."
            :error="usernameError || undefined"
            required
            :disabled="disabled"
            :ui="{
              label: fieldLabel,
              description: fieldDescription,
              error: fieldError,
            }"
          >
            <Input
              v-model="username"
              placeholder="rahul"
              :ui="{ root: inputControl }"
            />
          </Field>

          <div :class="fieldRow">
            <button :class="buttonGhost" type="button" @click="disabled = !disabled">
              {{ disabled ? "Enable" : "Disable" }} field
            </button>
            <code :class="codePill">username: {{ username || "(empty)" }}</code>
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Error state</h3>
        <div :class="canvasCol">
          <Field
            label="Email"
            name="field-email"
            description="Type without @ to see error text and invalid data attrs."
            :error="emailError || undefined"
            :ui="{
              label: fieldLabel,
              description: fieldDescription,
              error: fieldError,
            }"
          >
            <Input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              :ui="{ root: inputControl }"
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Scoped state</h3>
        <div :class="canvas">
          <Field
            v-slot="{ dirty, filled, focused, invalid, valid }"
            label="Project"
            description="Slot exposes state for custom UI."
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Input
              placeholder="Project name"
              :ui="{ root: inputControl }"
            />
            <div :class="stateRow">
              <code :class="codePill">valid: {{ valid }}</code>
              <code :class="codePill">invalid: {{ invalid }}</code>
              <code :class="codePill">dirty: {{ dirty }}</code>
              <code :class="codePill">filled: {{ filled }}</code>
              <code :class="codePill">focused: {{ focused }}</code>
            </div>
          </Field>
        </div>
      </div>
    </div>
  </section>
</template>
