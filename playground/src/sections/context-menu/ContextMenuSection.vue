<script setup lang="ts">
import type { AkazaChangeEventDetails, MenuItem } from "akaza-ui";
import { computed, ref, useTemplateRef } from "vue";
import { ContextMenu } from "akaza-ui";
import {
  canvasCol,
  codePill,
  contextMenuUi,
  eventEntry,
  eventLog,
  sectionDescription,
  sectionTitle,
} from "../styles";

const showGrid = ref(true);
const sort = ref<Record<string, string>>({ sort: "name" });
const log = ref<string[]>(["Right-click the panel."]);
const inlineOpen = ref(false);
const keepOpen = ref(false);
const longPressEnabled = ref(true);
const commandTarget = useTemplateRef<HTMLInputElement>("commandTarget");
const inlineItems: MenuItem[] = [
  { label: "Focus next field", onSelect: () => commandTarget.value?.focus() },
  { label: "Share", submenu: { anchor: "parent", align: "end" }, children: [{ label: "Copy link" }, { label: "Email" }] },
];

function onInlineOpenChange(next: boolean, details: AkazaChangeEventDetails) {
  if (!next && keepOpen.value) details.cancel();
  log.value = [`${next ? "open" : "close"} (${details.reason})${!next && keepOpen.value ? " canceled" : ""}`, ...log.value].slice(0, 4);
}

const items = computed<MenuItem[][]>(() => [
  [
    { type: "label", label: "File" },
    { value: "open", label: "Open" },
    { value: "rename", label: "Rename" },
    { value: "duplicate", label: "Duplicate" },
  ],
  [
    { type: "checkbox", value: "grid", label: "Show grid", checked: showGrid.value, onUpdateChecked: (value) => (showGrid.value = value) },
    { type: "radio", label: "Sort by name", value: "name", radioGroup: "sort" },
    { type: "radio", label: "Sort by date", value: "date", radioGroup: "sort" },
  ],
  [
    {
      label: "Share",
      children: [
        { label: "Copy link" },
        { label: "Email" },
      ],
    },
    { label: "Delete", disabled: true },
  ],
]);

function onSelect(item: MenuItem, details: AkazaChangeEventDetails) {
  log.value = [`selected ${item.label} (${details.reason})`, ...log.value].slice(0, 4);
}

function onOpenChange(next: boolean, details: AkazaChangeEventDetails) {
  log.value = [`${next ? "open" : "close"} (${details.reason})`, ...log.value].slice(0, 4);
}
</script>

<template>
  <section id="context-menu">
    <h2 :class="sectionTitle">Context Menu</h2>
    <p :class="sectionDescription">
      Right-click triggered menu that positions at the pointer while keeping Menu roles, keyboard nav, checkbox/radio items, and submenus.
    </p>

    <div :class="canvasCol">
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input v-model="longPressEnabled" type="checkbox"> Enable touch and pen long press
      </label>
      <ContextMenu
        v-model:radio-values="sort"
        :items="items"
        :ui="contextMenuUi"
        :long-press-delay="longPressEnabled ? 700 : 0"
        @select="onSelect"
        @open-change="onOpenChange"
      >
        <div class="grid min-h-36 place-items-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <p class="text-sm font-medium text-foreground">Right-click here</p>
            <p class="mt-1 text-xs text-muted-foreground">Touch and hold, or focus button and press Shift+F10 / Context Menu key.</p>
            <button type="button" class="mt-3 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Keyboard target
            </button>
          </div>
        </div>
      </ContextMenu>

      <code :class="codePill">showGrid: {{ showGrid }}, sort: {{ sort.sort }}</code>
      <div :class="eventLog">
        <p v-for="entry in log" :key="entry" :class="eventEntry">{{ entry }}</p>
      </div>
    </div>
    <div :class="[canvasCol, 'mt-8']">
      <h3 class="text-sm font-medium text-foreground">Inline popup boundary</h3>
      <label class="flex items-center gap-2 text-sm text-foreground">
        <input v-model="keepOpen" type="checkbox"> Cancel close requests
      </label>
      <div class="overflow-hidden rounded-lg border border-border p-4">
        <ContextMenu v-model="inlineOpen" :items="inlineItems" :teleport="false" :ui="contextMenuUi" @open-change="onInlineOpenChange">
          <button type="button" class="rounded-md border border-border px-3 py-2 text-sm text-foreground">Inline context target</button>
        </ContextMenu>
      </div>
      <label class="flex flex-col gap-1 text-sm text-foreground">
        Command focus target
        <input ref="commandTarget" class="rounded-md border border-border bg-background px-3 py-2" placeholder="Next task">
      </label>
      <code :class="codePill">open: {{ inlineOpen }}</code>
    </div>
  </section>
</template>
