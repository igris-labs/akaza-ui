<script setup lang="ts">
import type { AkazaChangeEventDetails, ListboxModelValue, ListboxValue } from "akaza-ui";
import { ref } from "vue";
import { Field, Listbox } from "akaza-ui";
import { typeaheadHint, typeaheadItems } from "../typeahead";
import {
  buttonGhost,
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  inputControl,
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
const virtualEnabled = ref(true);
const virtualOverscan = ref(5);
const lastEvent = ref("No selection event yet.");
const typeaheadSelected = ref<ListboxModelValue>("");
const guarded = ref<ListboxValue[]>(["read"]);
const blockEditHighlight = ref(true);
const rtlValue = ref<ListboxModelValue>("read");
const typedValues = ref<ListboxValue[]>([1]);
const typedOptions = [{ value: 1, label: "Number 1" }, { value: "1", label: "String 1" }];

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
        <h3 :class="exampleTitle">Numeric and string selections + native reset</h3>
        <form :class="canvasCol">
          <Listbox v-model="typedValues" multiple name="typed" :options="typedOptions" aria-label="Typed selections" :ui="listboxUi" />
          <button type="reset" :class="buttonGhost">Reset typed selections</button>
          <code :class="codePill">values: {{ JSON.stringify(typedValues) }}</code>
        </form>
      </div>

      <div>
        <h3 :class="exampleTitle">Cancelable highlight and range selection</h3>
        <div :class="canvasCol">
          <Listbox
            v-model="guarded"
            multiple
            :options="permissionOptions"
            aria-label="Guarded permissions"
            :ui="listboxUi"
            @highlight-change="(option, details) => { if (blockEditHighlight && option?.value === 'write') details.cancel(); }"
          />
          <button type="button" :class="buttonGhost" :aria-pressed="blockEditHighlight" @click="blockEditHighlight = !blockEditHighlight">
            {{ blockEditHighlight ? 'Allow edit highlight' : 'Block edit highlight' }}
          </button>
          <code :class="codePill">permissions: {{ guarded.join(', ') || 'none' }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Horizontal navigation, right-to-left</h3>
        <div :class="canvasCol">
          <Listbox
            v-model="rtlValue"
            :options="permissionOptions"
            orientation="horizontal"
            dir="rtl"
            :loop="false"
            aria-label="RTL permissions"
            :ui="{ ...listboxUi, virtualWrapper: 'flex flex-wrap gap-1' }"
          />
          <code :class="codePill">selected: {{ rtlValue }}</code>
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
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="virtualEnabled" type="checkbox" aria-label="Virtualize Listbox results">
              Virtualize
            </label>
            <label class="flex items-center gap-2 text-sm">
              Overscan
              <input v-model.number="virtualOverscan" type="number" min="0" max="20" aria-label="Listbox overscan" :class="[inputControl, 'w-20']">
            </label>
          </div>
          <Listbox
            v-model="virtualValue"
            :virtualize="virtualEnabled"
            :overscan="virtualOverscan"
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
    <div class="mt-8">
      <h3 :class="exampleTitle">Typeahead</h3>
      <div :class="canvasCol">
        <p :class="eventEntry">{{ typeaheadHint }}</p>
        <Listbox v-model="typeaheadSelected" :options="typeaheadItems" aria-label="Typeahead listbox" :ui="listboxUi" />
        <code :class="codePill">selected: {{ typeaheadSelected || "None" }}</code>
      </div>
    </div>
  </section>
</template>
