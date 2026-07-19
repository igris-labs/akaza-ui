<script setup lang="ts">
import type { MenuItem } from "akaza-ui";
import { ContextMenu } from "akaza-ui";

const items: MenuItem[] = [
  { label: "Open" },
  { label: "Rename" },
  { type: "separator" },
  { label: "Delete", disabled: true },
];
</script>

<template>
  <ContextMenu
    :items="items"
    :ui="{
      content: 'min-w-40 rounded-xl border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
      item: 'flex cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-700 outline-none hover:bg-neutral-100 data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:data-[akaza-highlighted]:bg-neutral-800',
      separator: 'my-1 h-px bg-neutral-200 dark:bg-neutral-800',
    }"
  >
    <div class="grid h-32 w-64 place-items-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
      Right-click this area
    </div>
  </ContextMenu>
</template>
