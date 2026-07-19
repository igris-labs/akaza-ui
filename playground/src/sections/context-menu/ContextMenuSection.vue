<script setup lang="ts">
import type { AkazaChangeEventDetails, MenuItem } from "akaza-ui";
import { computed, ref } from "vue";
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

const items = computed<MenuItem[][]>(() => [
  [
    { type: "label", label: "File" },
    { label: "Open" },
    { label: "Rename" },
    { label: "Duplicate" },
  ],
  [
    { type: "checkbox", label: "Show grid", checked: showGrid.value, onUpdateChecked: (value) => (showGrid.value = value) },
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
</script>

<template>
  <section id="context-menu">
    <h2 :class="sectionTitle">Context Menu</h2>
    <p :class="sectionDescription">
      Right-click triggered menu that positions at the pointer while keeping Menu roles, keyboard nav, checkbox/radio items, and submenus.
    </p>

    <div :class="canvasCol">
      <ContextMenu
        v-model:radio-values="sort"
        :items="items"
        :ui="contextMenuUi"
        @select="onSelect"
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
  </section>
</template>
