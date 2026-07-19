<script setup lang="ts">
import type { MenubarItem } from "akaza-ui";
import { Menubar } from "akaza-ui";

const items: MenubarItem[] = [
  {
    label: "File",
    children: [
      { label: "New file" },
      { label: "Open" },
      { type: "separator" },
      { label: "Close", disabled: true },
    ],
  },
  {
    label: "View",
    children: [
      { type: "radio", label: "Preview", value: "preview", radioGroup: "view" },
      { type: "radio", label: "Source", value: "source", radioGroup: "view" },
    ],
  },
];
</script>

<template>
  <Menubar
    :items="items"
    :radio-values="{ view: 'preview' }"
    aria-label="Document menu"
    :ui="{
      root: 'gap-1 rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900',
      trigger: 'rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 data-[akaza-state=open]:bg-white data-[akaza-state=open]:text-neutral-900 dark:text-neutral-300 dark:data-[akaza-state=open]:bg-neutral-800 dark:data-[akaza-state=open]:text-white',
      content: 'min-w-40 rounded-xl border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
      item: 'flex cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-700 outline-none hover:bg-neutral-100 data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:data-[akaza-highlighted]:bg-neutral-800',
      separator: 'my-1 h-px bg-neutral-200 dark:bg-neutral-800',
    }"
  />
</template>
