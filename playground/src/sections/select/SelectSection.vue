<script setup lang="ts">
import type { AkazaChangeEventDetails, SelectModelValue, SelectOption } from "akaza-ui";
import { ref } from "vue";
import { Dialog, Field, Select } from "akaza-ui";
import { typeaheadHint, typeaheadItems } from "../typeahead";
import {
  buttonGhost,
  canvasCol,
  canvasGrid,
  codePill,
  dialogContent,
  dialogOverlay,
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
const projectDialogOpen = ref(false);
const portaledProject = ref("project-1");
const submittedProject = ref("Not submitted");
const projects = Array.from({ length: 12 }, (_, index) => ({ value: `project-${index + 1}`, label: `Project ${index + 1}` }));

function submitProject(event: Event) {
  submittedProject.value = String(new FormData(event.currentTarget as HTMLFormElement).get("project"));
}
const server = ref("");
const region = ref("iad");
const permissions = ref<string[]>(["read", "deploy"]);
const submittedPermissions = ref("Not submitted");
const guarded = ref("viewer");
const searchable = ref("");
const selectSearch = ref("");
const lastEvent = ref("No event yet.");
const typeaheadSelected = ref("");
const popupOpen = ref(false);
const keepPopupOpen = ref(false);

function guardPopup(open: boolean, details: AkazaChangeEventDetails) {
  if (!open && keepPopupOpen.value) details.cancel();
}

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

function submitPermissions(event: Event) {
  submittedPermissions.value = new FormData(event.currentTarget as HTMLFormElement).getAll("permissions").join(", ") || "none";
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
        <h3 :class="exampleTitle">Cancelable popup dismissal</h3>
        <div :class="canvasCol">
          <label class="flex items-center gap-2 text-sm"><input v-model="keepPopupOpen" type="checkbox">Keep popup open</label>
          <Select v-model:open="popupOpen" :options="plans" autocomplete aria-label="Guarded plan" :ui="selectUi" @open-change="guardPopup" />
          <output :class="codePill">popup: {{ popupOpen ? "open" : "closed" }}</output>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Portal inside a scrolling dialog</h3>
        <div :class="canvasCol">
          <Dialog v-model="projectDialogOpen" title="Project details" :ui="{ overlay: dialogOverlay, content: dialogContent, body: 'max-h-48 overflow-y-auto' }">
            <template #trigger="{ toggle }"><button :class="buttonGhost" type="button" @click="toggle">Open project dialog</button></template>
            <template #body>
              <form class="grid gap-3" @submit.prevent="submitProject">
                <label class="text-sm text-foreground" for="portal-project">Project</label>
                <Select id="portal-project" v-model="portaledProject" :options="projects" name="project" teleport="body" autocomplete search-placeholder="Search projects" :ui="selectUi" />
                <button :class="buttonGhost" type="submit">Save project</button>
                <output :class="codePill">{{ submittedProject }}</output>
                <p class="text-sm text-muted-foreground">The options can extend outside this scrolling body without changing its overflow.</p>
              </form>
            </template>
            <template #footer="{ close }"><button :class="buttonGhost" type="button" @click="close">Close project dialog</button></template>
          </Dialog>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Controlled value</h3>
        <div :class="canvasCol">
          <Select
            v-model="plan"
            aria-label="Plan"
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
        <form :class="canvasCol" @submit.prevent="submitPermissions">
          <Select
            v-model="permissions"
            aria-label="Permissions"
            multiple
            name="permissions"
            :options="permissionOptions"
            placeholder="Choose permissions"
            :ui="selectUi"
            @value-change="log"
          />
          <code :class="codePill">permissions: {{ permissions.join(", ") }}</code>
          <button type="submit" :class="buttonGhost">Submit permissions</button>
          <p :class="eventEntry">Submitted permissions: {{ submittedPermissions }}</p>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">Custom option slot + no-wrap navigation</h3>
        <div :class="canvasCol">
          <Select v-model="region" aria-label="Region" :options="regions" :loop="false" :ui="selectUi">
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
        <h3 :class="exampleTitle">Autocomplete filtering</h3>
        <div :class="canvasCol">
          <Select
            v-model="searchable"
            v-model:search="selectSearch"
            aria-label="Permission"
            autocomplete
            :options="permissionOptions"
            placeholder="Choose permission"
            search-placeholder="Filter permissions"
            :ui="selectUi"
            @value-change="log"
          />
          <code :class="codePill">value: {{ searchable || "(empty)" }}, search: {{ selectSearch || "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">States + cancelable event</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Select
            v-model="guarded"
            aria-label="Role"
            :options="roles"
            :ui="selectUi"
            @value-change="blockOwner"
          />
          <Select
            model-value=""
            aria-label="Disabled plan"
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
    <div class="mt-8">
      <h3 :class="exampleTitle">Typeahead</h3>
      <div :class="canvasCol">
        <p :class="eventEntry">{{ typeaheadHint }}</p>
        <Select v-model="typeaheadSelected" :options="typeaheadItems" aria-label="Typeahead select" placeholder="Choose a command" :ui="selectUi" />
        <code :class="codePill">selected: {{ typeaheadSelected || "None" }}</code>
      </div>
    </div>
  </section>
</template>
