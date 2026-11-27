<script setup lang="ts">
import type { AkazaChangeEventDetails, MenubarItem, MenuItem } from "akaza-ui";
import { ref, useTemplateRef } from "vue";
import { Menubar } from "akaza-ui";
import { typeaheadHint, typeaheadItems } from "../typeahead";
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
const typeaheadCommand = ref("None");
const rtlOpen = ref<string | null>(null);
const rtlCommand = ref("None");
const inlineOpen = ref<string | null>(null);
const keepOpen = ref(false);
const commandTarget = useTemplateRef<HTMLInputElement>("commandTarget");
const inlineItems: MenubarItem[] = [
  { value: "file", label: "File", children: [
    { label: "Focus next field", onSelect: () => commandTarget.value?.focus() },
    { label: "Share", submenu: { anchor: "parent", align: "end" }, children: [{ label: "Copy link" }, { label: "Email" }] },
  ] },
  { value: "edit", label: "Edit", children: [{ label: "Undo" }, { label: "Redo" }] },
];

function onInlineOpenChange(next: string | null, details: AkazaChangeEventDetails) {
  if (next === null && keepOpen.value) details.cancel();
}
const rtlItems: MenubarItem[] = [
  { value: "project", label: "Project", children: [{ label: "Open project" }, { label: "Recent", children: [{ label: "Workspace" }] }] },
  { value: "disabled", label: "Disabled", disabled: true },
  { value: "settings", label: "Settings", children: [{ label: "Preferences" }] },
  { value: "help", label: "Help" },
];

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
          { value: "problems", label: "Problems" },
          { value: "terminal", label: "Terminal" },
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
    <div :class="[canvasCol, 'mt-8']">
      <div>
        <h3 class="text-sm font-medium text-foreground">Typeahead</h3>
        <p class="mt-1 text-xs text-muted-foreground">{{ typeaheadHint }}</p>
      </div>
      <Menubar :items="typeaheadItems" aria-label="Typeahead menubar" :ui="{ ...menubarUi, root: `${menubarUi.root} flex-wrap` }" @select="typeaheadCommand = $event.label ?? 'None'" />
      <code :class="codePill">command: {{ typeaheadCommand }}</code>
    </div>
    <div :class="[canvasCol, 'mt-8']">
      <div>
        <h3 class="text-sm font-medium text-foreground">RTL panel navigation</h3>
        <p class="mt-1 text-xs text-muted-foreground">Move across menus, skip disabled triggers, and open nested panels. Escape returns focus to the active trigger.</p>
      </div>
      <Menubar v-model="rtlOpen" :items="rtlItems" dir="rtl" :loop="false" aria-label="RTL application menu" :ui="{ ...menubarUi, root: `${menubarUi.root} flex-wrap` }" @select="rtlCommand = $event.label ?? 'None'" />
      <code :class="codePill">open: {{ rtlOpen ?? '(closed)' }}, command: {{ rtlCommand }}</code>
    </div>
    <div :class="[canvasCol, 'mt-8']">
      <h3 class="text-sm font-medium text-foreground">Inline popup boundary</h3>
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input v-model="keepOpen" type="checkbox"> Cancel close requests
      </label>
      <div class="overflow-hidden rounded-lg border border-border p-4">
        <Menubar v-model="inlineOpen" :items="inlineItems" :teleport="false" aria-label="Inline editor menu" :ui="menubarUi" @open-change="onInlineOpenChange" />
      </div>
      <label class="flex flex-col gap-1 text-sm text-foreground">
        Command focus target
        <input ref="commandTarget" class="rounded-md border border-border bg-background px-3 py-2" placeholder="Next task">
      </label>
      <code :class="codePill">open: {{ inlineOpen ?? '(closed)' }}</code>
    </div>
  </section>
</template>
