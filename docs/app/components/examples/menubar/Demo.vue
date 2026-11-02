<script setup lang="ts">
import type { MenubarItem } from "akaza-ui";
import { Menubar } from "../../ui/menubar";

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
  />
</template>
