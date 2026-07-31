<script setup lang="ts">
import type { AkazaChangeEventDetails, TagsInputValue } from "akaza-ui";
import { ref } from "vue";
import { Field, TagsInput } from "akaza-ui";
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
  tagsInputUi,
} from "../styles";

const technologies = ref<TagsInputValue[]>(["Vue", "TypeScript"]);
const recipients = ref<TagsInputValue[]>([]);
const requiredTags = ref<TagsInputValue[]>([]);
const input = ref("");
const lastEvent = ref("Paste or type comma-separated email addresses.");

function isEmail(value: TagsInputValue) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function logInvalid(value: TagsInputValue | string, details: AkazaChangeEventDetails) {
  lastEvent.value = `Rejected ${String(value)}: ${details.reason}`;
}
</script>

<template>
  <section id="tags-input">
    <h2 :class="sectionTitle">Tags Input</h2>
    <p :class="sectionDescription">
      Tokenized text input with keyboard removal, delimiter/paste handling, custom values, and form integration.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Add, remove, and clear</h3>
        <div :class="canvasCol">
          <TagsInput v-model="technologies" clearable placeholder="Add technology" :ui="tagsInputUi" />
          <code :class="codePill">tags: {{ technologies.join(", ") || "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Paste + validation + maximum</h3>
        <div :class="canvasCol">
          <TagsInput
            v-model="recipients"
            v-model:input="input"
            add-on-paste
            add-on-blur
            :max="4"
            :validate="isEmail"
            placeholder="person@example.com"
            :ui="tagsInputUi"
            @invalid-value="logInvalid"
          />
          <code :class="codePill">input: {{ input || "(empty)" }} | recipients: {{ recipients.length }}</code>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field integration + states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field
            label="Project labels"
            name="labels"
            description="At least one label is required."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <TagsInput v-model="requiredTags" placeholder="Add label" :ui="tagsInputUi" />
          </Field>
          <TagsInput :model-value="['locked']" disabled aria-label="Disabled tags" :ui="tagsInputUi" />
        </div>
      </div>
    </div>
  </section>
</template>
