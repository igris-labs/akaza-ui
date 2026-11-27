<script setup lang="ts">
import type { ToolbarItem } from "akaza-ui";
import { computed, ref } from "vue";
import { Toolbar } from "akaza-ui";
import {
  canvasCol,
  codePill,
  exampleLabelDescription,
  exampleLabelTitle,
  sectionDescription,
  sectionTitle,
  toolbarUi,
} from "../styles";

const bold = ref(true);
const italic = ref(false);
const align = ref("left");
const fontSize = ref("16");
const rtlAction = ref("None");
const rtlQuery = ref("");
const rtlItems = computed<ToolbarItem[]>(() => [
  { value: "cut", label: "Cut", onSelect: () => { rtlAction.value = "Cut"; } },
  { type: "group", label: "History", children: [
    { value: "undo", label: "Undo", disabled: true },
    { value: "redo", label: "Redo", disabled: true, focusableWhenDisabled: true },
    { value: "copy", label: "Copy", onSelect: () => { rtlAction.value = "Copy"; } },
  ] },
  { type: "input", value: "query", label: "Command query", inputValue: rtlQuery.value, placeholder: "Search", onUpdateValue: value => { rtlQuery.value = value; } },
  { type: "link", value: "help", label: "Help", href: "#toolbar" },
]);

const items = computed<ToolbarItem[]>(() => [
  { label: "Bold", value: "bold", pressed: bold.value, onSelect: () => (bold.value = !bold.value) },
  { label: "Italic", value: "italic", pressed: italic.value, onSelect: () => (italic.value = !italic.value) },
  { type: "separator" },
  {
    type: "group",
    label: "Alignment",
    children: [
      { label: "Left", value: "left", pressed: align.value === "left", onSelect: () => (align.value = "left") },
      { label: "Center", value: "center", pressed: align.value === "center", onSelect: () => (align.value = "center") },
      { label: "Right", value: "right", pressed: align.value === "right", onSelect: () => (align.value = "right") },
    ],
  },
  { type: "separator" },
  {
    type: "input",
    label: "Font size",
    inputType: "number",
    inputValue: fontSize.value,
    min: 8,
    max: 96,
    onUpdateValue: (value) => (fontSize.value = value),
  },
  { type: "link", label: "Help", href: "#help" },
]);
</script>

<template>
  <section id="toolbar">
    <h2 :class="sectionTitle">Toolbar</h2>
    <p :class="sectionDescription">
      A compact command strip with `role="toolbar"`, roving focus, buttons, links, inputs, groups, and separators.
    </p>

    <div class="space-y-8">
      <div>
        <div class="mb-3">
          <h3 :class="exampleLabelTitle">Commands, groups, and functional input</h3>
          <p :class="exampleLabelDescription">Arrow keys move between commands. Text input keeps native cursor keys and updates reactive state.</p>
        </div>
        <div :class="canvasCol">
          <Toolbar :items="items" aria-label="Editor toolbar" :ui="toolbarUi" />
          <code :class="codePill">bold: {{ bold }}, italic: {{ italic }}, align: {{ align }}, size: {{ fontSize }}</code>
        </div>
      </div>

      <div>
        <div class="mb-3">
          <h3 :class="exampleLabelTitle">Vertical and disabled controls</h3>
          <p :class="exampleLabelDescription">Vertical orientation switches roving focus to Arrow Up and Arrow Down.</p>
        </div>
        <div :class="canvasCol">
          <Toolbar
            orientation="vertical"
            aria-label="Object actions"
            :items="[
              { label: 'Move up' },
              { label: 'Move down' },
              { label: 'Delete', disabled: true, focusableWhenDisabled: true },
            ]"
            :ui="toolbarUi"
          />
        </div>
      </div>

      <div>
        <div class="mb-3">
          <h3 :class="exampleLabelTitle">Right-to-left commands and input</h3>
          <p :class="exampleLabelDescription">Undo is skipped. Redo can take focus but cannot run. The input keeps its editing keys.</p>
        </div>
        <div :class="canvasCol" dir="rtl">
          <Toolbar :items="rtlItems" aria-label="RTL commands" :loop="false" :ui="toolbarUi" />
          <code :class="codePill">action: {{ rtlAction }}, query: {{ rtlQuery || '(empty)' }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
