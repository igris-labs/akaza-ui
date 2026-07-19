<script setup lang="ts">
import type { ToolbarItem } from "akaza-ui";
import { Toolbar } from "akaza-ui";
import { computed, ref } from "vue";

const bold = ref(true);
const italic = ref(false);
const size = ref("16");

const items = computed<ToolbarItem[]>(() => [
  { label: "Bold", pressed: bold.value, onSelect: () => (bold.value = !bold.value) },
  { label: "Italic", pressed: italic.value, onSelect: () => (italic.value = !italic.value) },
  { type: "separator" },
  { type: "input", label: "Size", inputType: "number", inputValue: size.value, onUpdateValue: (value) => (size.value = value) },
  { type: "link", label: "Help", href: "#help" },
]);
</script>

<template>
  <Toolbar
    :items="items"
    aria-label="Editor toolbar"
    :ui="{
      root: 'gap-1 rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900',
      button: 'h-8 rounded-lg px-3 text-sm text-neutral-600 data-[akaza-state=on]:bg-white data-[akaza-state=on]:text-neutral-900 data-[akaza-state=on]:shadow-sm dark:text-neutral-300 dark:data-[akaza-state=on]:bg-neutral-800 dark:data-[akaza-state=on]:text-white',
      input: 'h-8 w-20 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-800 dark:bg-neutral-950',
      link: 'h-8 rounded-lg px-3 text-sm text-neutral-600 no-underline hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-800',
      separator: 'mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-800',
    }"
  />
</template>
