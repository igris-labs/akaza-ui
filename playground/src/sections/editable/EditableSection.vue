<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { Editable, Field } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  canvasGrid,
  codePill,
  editableUi,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  sectionDescription,
  sectionTitle,
} from "../styles";

const title = ref("Quarterly planning notes");
const summary = ref("Use Ctrl+Enter to submit this multiline value.");
const requiredValue = ref("");
const lastEvent = ref("Click the value or press Enter to edit it.");

function logSubmit(value: string, details: AkazaChangeEventDetails) {
  lastEvent.value = `submit: ${value || "(empty)"}, reason: ${details.reason}`;
}

function logCancel(value: string, details: AkazaChangeEventDetails) {
  lastEvent.value = `cancel: kept ${value || "(empty)"}, reason: ${details.reason}`;
}
</script>

<template>
  <section id="editable">
    <h2 :class="sectionTitle">Editable</h2>
    <p :class="sectionDescription">
      Inline text editing with preview, draft, submit, cancel, form metadata, and activation controls.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Click to edit + select on focus</h3>
        <div :class="canvasCol">
          <Editable
            v-model="title"
            activation-mode="click"
            submit-mode="none"
            :ui="editableUi"
            select-on-focus
            @submit="logSubmit"
            @cancel="logCancel"
          />
          <code :class="codePill">title: {{ title }}</code>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiline + explicit submit</h3>
        <div :class="canvasCol">
          <Editable
            v-model="summary"
            multiline
            auto-resize
            activation-mode="dblclick"
            submit-mode="enter"
            :ui="editableUi"
          />
          <p class="text-xs text-muted-foreground">Double-click preview. Ctrl/Cmd+Enter submits; Escape cancels.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field
            label="Release note"
            name="releaseNote"
            description="Required validation appears after submit or interaction."
            required
            :ui="{ label: fieldLabel, description: fieldDescription, error: fieldError }"
          >
            <Editable v-model="requiredValue" submit-mode="none" :ui="editableUi" />
          </Field>
          <Editable model-value="Read-only value" read-only :ui="editableUi" />
        </div>
      </div>
    </div>
  </section>
</template>
