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
const controlledTitle = ref("Parent-owned title");
const acceptUpdates = ref(false);
const allowCancel = ref(false);
const controlledEvent = ref("");

function updateControlled(value: string | null) {
  if (acceptUpdates.value) controlledTitle.value = value ?? "";
  controlledEvent.value = acceptUpdates.value ? "Model update accepted." : "Model update refused; parent value kept.";
}

function guardDraft(value: string, details: AkazaChangeEventDetails) {
  if (!value.includes("!")) return;
  details.cancel();
  controlledEvent.value = "Draft rejected: exclamation marks are not allowed.";
}

function guardCancel(_value: string, details: AkazaChangeEventDetails) {
  if (allowCancel.value) return;
  details.cancel();
  controlledEvent.value = "Cancel rejected; draft stays open.";
}

function logSubmit(value: string, details: AkazaChangeEventDetails) {
  if (value === title.value) {
    details.cancel();
    lastEvent.value = "Unchanged submit canceled; draft stays open.";
    return;
  }
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
            aria-label="Planning title"
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
            aria-label="Planning summary"
            :ui="editableUi"
          />
          <p class="text-xs text-muted-foreground">Double-click preview. Ctrl/Cmd+Enter submits; Escape cancels.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Controlled updates + synchronous vetoes</h3>
        <div :class="canvasCol">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="acceptUpdates" type="checkbox">
            Accept model updates
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="allowCancel" type="checkbox">
            Allow cancel
          </label>
          <Editable
            :model-value="controlledTitle"
            activation-mode="click"
            submit-mode="none"
            aria-label="Controlled title"
            :ui="editableUi"
            @update:model-value="updateControlled"
            @draft-change="guardDraft"
            @cancel="guardCancel"
          />
          <code :class="codePill">parent: {{ controlledTitle }}</code>
          <p :class="eventEntry">{{ controlledEvent }}</p>
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
          <Editable model-value="Read-only value" aria-label="Read-only title" read-only :ui="editableUi" />
        </div>
      </div>
    </div>
  </section>
</template>
