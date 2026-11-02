<script setup lang="ts">
import type { ToolbarItem } from "akaza-ui";
import { computed, ref } from "vue";
import { Toolbar } from "../../ui/toolbar";

const bold = ref(true);
const italic = ref(false);
const size = ref("16");

const items = computed<ToolbarItem[]>(() => [
  { label: "Bold", pressed: bold.value, onSelect: () => (bold.value = !bold.value) },
  { label: "Italic", pressed: italic.value, onSelect: () => (italic.value = !italic.value) },
  { type: "separator" },
  {
    type: "input",
    label: "Size",
    inputType: "number",
    inputValue: size.value,
    onUpdateValue: (value) => (size.value = value),
  },
  { type: "link", label: "Help", href: "#help" },
]);
</script>

<template>
  <Toolbar
    :items="items"
    aria-label="Editor toolbar"
  />
</template>
