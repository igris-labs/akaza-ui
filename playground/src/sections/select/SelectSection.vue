<script setup lang="ts">
import type { AkazaChangeEventDetails, SelectModelValue, SelectOption } from "akaza-ui";
import { ref } from "vue";
import { Field, Select } from "akaza-ui";
import {
  buttonGhost,
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  eventLog,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  sectionDescription,
  sectionTitle,
  selectUi,
} from "../styles";

const plan = ref("pro");
const server = ref("");
const region = ref("iad");
const permissions = ref<string[]>(["read", "deploy"]);
const guarded = ref("viewer");
const lastEvent = ref("No event yet.");

const plans: SelectOption[] = [
  { value: "free", label: "Free", description: "Personal projects." },
  { value: "pro", label: "Pro", description: "Production apps." },
  { value: "team", label: "Team", description: "Shared workspaces.", disabled: true },
];

const regions: SelectOption[] = [
  { value: "iad", label: "US East", description: "Virginia" },
  { value: "sfo", label: "US West", description: "California" },
  { value: "fra", label: "Europe", description: "Frankfurt" },
];

const roles: SelectOption[] = [
  { value: "viewer", label: "Viewer", description: "Read only." },
  { value: "editor", label: "Editor", description: "Can update content." },
  { value: "owner", label: "Owner", description: "Blocked by cancelable event." },
];

const permissionOptions: SelectOption[] = [
  { type: "label", label: "Project" },
  { value: "read", label: "Read", description: "View project data." },
  { value: "write", label: "Write", description: "Create and update records." },
  { type: "separator" },
  { type: "label", label: "Operations" },
  { value: "deploy", label: "Deploy", description: "Ship production releases." },
  { value: "billing", label: "Billing", description: "Manage invoices.", disabled: true },
];

function formatValue(value: SelectModelValue): string {
  return Array.isArray(value) ? value.join(", ") : value;
}

function log(value: SelectModelValue, details: AkazaChangeEventDetails) {
  lastEvent.value = `value-change: ${value}, reason: ${details.reason}`;
}

function blockOwner(value: SelectModelValue, details: AkazaChangeEventDetails) {
  if (value === "owner") {
    details.cancel();
    lastEvent.value = "Canceled owner selection.";
    return;
  }
  lastEvent.value = `Accepted ${formatValue(value)}.`;
}
</script>

<template>
  <section id="select">
    <h2 :class="sectionTitle">Select</h2>
    <p :class="sectionDescription">
      Listbox select with keyboard navigation, typeahead, form value, and cancelable selection.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Controlled value</h3>
        <div :class="canvasCol">
          <Select
            v-model="plan"
            :options="plans"
            placeholder="Choose plan"
            :ui="selectUi"
            @value-change="log"
          />
          <code :class="codePill">plan: {{ plan }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field + required form value</h3>
        <div :class="canvasCol">
          <Field
            label="Server type"
            name="server"
            description="Select inherits id, name, required, and aria-describedby from Field."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Select
              v-model="server"
              :options="[
                { value: 'api', label: 'API server' },
                { value: 'worker', label: 'Worker' },
                { value: 'cron', label: 'Cron job' },
              ]"
              placeholder="Pick server"
              :ui="selectUi"
            />
          </Field>
          <code :class="codePill">server: {{ server || "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple + grouped options</h3>
        <div :class="canvasCol">
          <Select
            v-model="permissions"
            multiple
            :options="permissionOptions"
            placeholder="Choose permissions"
            :ui="selectUi"
            @value-change="log"
          />
          <code :class="codePill">permissions: {{ permissions.join(", ") }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Custom option slot</h3>
        <div :class="canvasCol">
          <Select v-model="region" :options="regions" :ui="selectUi">
            <template #option="{ label, description, isSelected }">
              <span class="mt-0.5 size-2 rounded-full bg-primary" :class="{ 'opacity-100': isSelected, 'opacity-20': !isSelected }" />
              <span class="grid gap-0.5">
                <span class="text-sm font-medium text-foreground">{{ label }}</span>
                <span class="text-xs text-muted-foreground">{{ description }}</span>
              </span>
            </template>
          </Select>
          <code :class="codePill">region: {{ region }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">States + cancelable event</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Select
            v-model="guarded"
            :options="roles"
            :ui="selectUi"
            @value-change="blockOwner"
          />
          <Select
            model-value=""
            disabled
            :options="plans"
            placeholder="Disabled"
            :ui="selectUi"
          />
          <div :class="eventLog">
            <button :class="buttonGhost" type="button" @click="guarded = 'viewer'">Reset role</button>
            <p :class="eventEntry">{{ lastEvent }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
