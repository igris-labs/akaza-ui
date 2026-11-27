<script setup lang="ts">
import type { AkazaChangeEventDetails, ComboboxModelValue, ComboboxOption } from "akaza-ui";
import { ref } from "vue";
import { Combobox, Field } from "akaza-ui";
import {
  canvasCol,
  codePill,
  comboboxUi,
  eventEntry,
  eventLog,
  exampleLabelDescription,
  exampleLabelTitle,
  fieldDescription,
  fieldLabel,
  sectionDescription,
  sectionTitle,
} from "../styles";

const framework = ref("vue");
const search = ref("");
const popupOpen = ref(false);
const keepPopupOpen = ref(false);

function guardPopup(open: boolean, details: AkazaChangeEventDetails) {
  if (!open && keepPopupOpen.value) details.cancel();
}
const skills = ref<string[]>(["a11y"]);
const fieldValue = ref("");
const events = ref<string[]>([]);
const customValue = ref("");
const customOptions = ref<ComboboxOption[]>([{ value: "vue", label: "Vue" }]);
const assignees = ref<ComboboxModelValue>([{ id: 1, name: "Mira" }]);
const assigneeOptions: ComboboxOption[] = [
  { value: { id: 1, name: "Mira" }, label: "Mira" },
  { value: { id: 2, name: "Arun" }, label: "Arun" },
];

function sameAssignee(a: ComboboxModelValue, b: ComboboxModelValue) {
  return typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b) && a.id === b.id;
}

const options: ComboboxOption[] = [
  { type: "label", label: "Frameworks" },
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Build tooling.", disabled: true },
  { type: "separator" },
  { type: "label", label: "Skills" },
  { value: "a11y", label: "Accessibility", description: "Keyboard and screen reader behavior." },
  { value: "forms", label: "Forms", description: "Native validity and state." },
  { value: "overlays", label: "Overlays", description: "Dismissal and focus layers." },
];

function onValue(value: ComboboxModelValue, details: AkazaChangeEventDetails) {
  events.value = [`value: ${Array.isArray(value) ? value.join(", ") : JSON.stringify(value)} (${details.reason})`, ...events.value].slice(0, 4);
}

function onCreate(value: string) {
  customOptions.value.push({ value, label: value });
  customValue.value = value;
}
</script>

<template>
  <section id="combobox">
    <h2 :class="sectionTitle">Combobox</h2>
    <p :class="sectionDescription">
      Input + listbox selection with filtering, `aria-autocomplete`, `aria-activedescendant`, groups, disabled options, and form integration.
    </p>

    <div class="space-y-8">
      <div :class="canvasCol">
        <h3 :class="exampleLabelTitle">Cancelable popup dismissal</h3>
        <label class="flex items-center gap-2 text-sm"><input v-model="keepPopupOpen" type="checkbox">Keep popup open</label>
        <Combobox v-model:open="popupOpen" :options="options" aria-label="Guarded framework" :ui="comboboxUi" @open-change="guardPopup" />
        <output :class="codePill">popup: {{ popupOpen ? "open" : "closed" }}</output>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Controlled search + no-wrap navigation</h3>
          <p :class="exampleLabelDescription">Typing filters options; closing restores selected label instead of leaving stale query text.</p>
        </div>
        <Combobox
          v-model="framework"
          v-model:search="search"
          aria-label="Framework or skill"
          :options="options"
          :loop="false"
          placeholder="Search framework or skill"
          :ui="comboboxUi"
          @value-change="onValue"
        />
        <code :class="codePill">framework: {{ framework }}, search: {{ search || "(empty)" }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Multiple values, tags, removal, and clear</h3>
          <p :class="exampleLabelDescription">Selected values render as removable tags and submit under same field name.</p>
        </div>
        <Combobox
          v-model="skills"
          aria-label="Skills"
          multiple
          clearable
          :options="options"
          placeholder="Choose multiple"
          :ui="comboboxUi"
          @value-change="onValue"
        />
        <code :class="codePill">skills: {{ skills.join(", ") }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Recreated object selections</h3>
        </div>
        <Combobox
          v-model="assignees"
          multiple
          name="assignees"
          aria-label="Assignees"
          :options="assigneeOptions"
          :is-equal="sameAssignee"
          :serialize-value="value => typeof value === 'object' ? String(value.id) : String(value)"
          :ui="comboboxUi"
        />
        <code :class="codePill">assignees: {{ JSON.stringify(assignees) }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Required Field integration</h3>
          <p :class="exampleLabelDescription">Blur empty control to expose native validity through Field error state.</p>
        </div>
        <Field
          label="Required stack"
          name="stack"
          description="Combobox inherits label metadata and submits the selected value."
          required
          :ui="{ label: fieldLabel, description: fieldDescription }"
        >
          <Combobox v-model="fieldValue" :options="options" placeholder="Pick stack" :ui="comboboxUi" />
        </Field>
        <code :class="codePill">stack: {{ fieldValue || "(empty)" }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Create an option</h3>
          <p :class="exampleLabelDescription">Type unmatched value and press Enter or select create row. Creation remains app-controlled.</p>
        </div>
        <Combobox
          v-model="customValue"
          aria-label="New framework"
          creatable
          clearable
          :options="customOptions"
          placeholder="Add a framework"
          :ui="comboboxUi"
          @create="onCreate"
        />
        <code :class="codePill">custom: {{ customValue || "(empty)" }}</code>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div :class="canvasCol">
          <div>
            <h3 :class="exampleLabelTitle">Read-only</h3>
            <p :class="exampleLabelDescription">Value remains visible but cannot open or change.</p>
          </div>
          <Combobox v-model="framework" aria-label="Read-only framework" read-only :options="options" :ui="comboboxUi" />
        </div>
        <div :class="canvasCol">
          <div>
            <h3 :class="exampleLabelTitle">Loading</h3>
            <p :class="exampleLabelDescription">Open to inspect busy listbox state and loading slot.</p>
          </div>
          <Combobox aria-label="Loading options" :options="[]" loading placeholder="Loading options" :ui="comboboxUi" />
        </div>
      </div>

      <div :class="eventLog">
        <p v-for="entry in events" :key="entry" :class="eventEntry">{{ entry }}</p>
      </div>
    </div>
  </section>
</template>
