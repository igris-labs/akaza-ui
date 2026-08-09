<script setup lang="ts">
import type { AkazaChangeEventDetails, ListboxModelValue, ListboxValue } from "akaza-ui";
import { ref } from "vue";
import { Field, Listbox } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  listboxUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const framework = ref<ListboxModelValue>("vue");
const permissions = ref<ListboxValue[]>(["read"]);
const filtered = ref<ListboxModelValue>("");
const search = ref("");
const requiredValue = ref<ListboxModelValue>("");
const virtualValue = ref<ListboxModelValue>(42);
const lastEvent = ref("No selection event yet.");

const frameworks = [
  { type: "label" as const, label: "Vue ecosystem" },
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { type: "separator" as const },
  { type: "label" as const, label: "Tooling" },
  { value: "vite", label: "Vite", description: "Frontend build tool." },
  { value: "vitest", label: "Vitest", description: "Test runner.", disabled: true },
];
const permissionOptions = [
  { value: "read", label: "Read records" },
  { value: "write", label: "Edit records" },
  { value: "deploy", label: "Deploy releases" },
];
const virtualOptions = Array.from({ length: 1000 }, (_, index) => ({ value: index, label: `Result ${index + 1}` }));

function logSelection(value: ListboxModelValue, details: AkazaChangeEventDetails) {
  lastEvent.value = `value-change: ${JSON.stringify(value)}, reason: ${details.reason}`;
}
</script>

<template>
  <section id="listbox">
    <h2 :class="sectionTitle">Listbox</h2>
    <p :class="sectionDescription">
      Standalone single or multiple selection with typeahead, range selection, filtering, and virtualization.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single selection + grouped rows</h3>
        <div :class="canvasCol">
          <Listbox v-model="framework" :options="frameworks" aria-label="Framework" :ui="listboxUi" @value-change="logSelection" />
          <code :class="codePill">framework: {{ framework }}</code>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple selection</h3>
        <div :class="canvasCol">
          <Listbox v-model="permissions" multiple :options="permissionOptions" aria-label="Permissions" :ui="listboxUi" />
          <code :class="codePill">permissions: {{ permissions.join(", ") || "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Filterable + empty state</h3>
        <div :class="canvasCol">
          <Listbox
            v-model="filtered"
            v-model:search="search"
            filterable
            :options="frameworks"
            filter-placeholder="Filter frameworks"
            aria-label="Filtered framework"
            :ui="listboxUi"
          />
          <code :class="codePill">search: {{ search || "(empty)" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Field integration + states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field
            label="Default environment"
            name="environment"
            description="Required standalone listbox with native form validity."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Listbox v-model="requiredValue" :options="permissionOptions" :ui="listboxUi" />
          </Field>
          <Listbox model-value="read" disabled :options="permissionOptions" aria-label="Disabled permissions" :ui="listboxUi" />
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Virtualized results</h3>
        <div :class="canvasCol">
          <Listbox
            v-model="virtualValue"
            virtualize
            :virtual-height="192"
            :virtual-item-height="36"
            :options="virtualOptions"
            aria-label="Large result set"
            :ui="listboxUi"
          />
          <code :class="codePill">selected result index: {{ virtualValue }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
