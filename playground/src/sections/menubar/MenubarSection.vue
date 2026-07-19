<script setup lang="ts">
import type { MenubarItem, MenuItem } from "akaza-ui";
import { ref } from "vue";
import { Menubar } from "akaza-ui";
import {
  canvasCol,
  codePill,
  eventEntry,
  menubarUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const selected = ref("No command yet.");
const radioValues = ref<Record<string, string>>({ view: "preview" });
const open = ref<string | null>(null);

const items: MenubarItem[] = [
  {
    label: "File",
    children: [
      { type: "label", label: "Project" },
      { label: "New file" },
      { label: "Open..." },
      { type: "separator" },
      { label: "Close workspace", disabled: true },
    ],
  },
  {
    label: "Edit",
    children: [
      { label: "Undo" },
      { label: "Redo" },
      { type: "separator" },
      { label: "Find" },
    ],
  },
  {
    label: "View",
    children: [
      { type: "radio", label: "Preview", value: "preview", radioGroup: "view" },
      { type: "radio", label: "Source", value: "source", radioGroup: "view" },
      {
        label: "Panels",
        children: [
          { label: "Problems" },
          { label: "Terminal" },
        ],
      },
    ],
  },
  { label: "Save", value: "save", onSelect: () => (selected.value = "Save") },
];

function onSelect(item: MenuItem) {
  selected.value = item.label ?? item.value ?? "Selected";
}
</script>

<template>
  <section id="menubar">
    <h2 :class="sectionTitle">Menubar</h2>
    <p :class="sectionDescription">
      Horizontal menu strip with roving focus across triggers and vertical menu panels underneath each top-level item.
    </p>

    <div :class="canvasCol">
      <Menubar
        v-model="open"
        v-model:radio-values="radioValues"
        :items="items"
        aria-label="Editor menu"
        :ui="menubarUi"
        @select="onSelect"
      />
      <code :class="codePill">open: {{ open ?? "(closed)" }}, view: {{ radioValues.view }}</code>
      <p :class="eventEntry">last command: {{ selected }}</p>
    </div>
  </section>
</template>
