<script setup lang="ts">
import { Menu } from "akaza-ui";

const items = [
  [
    { label: "Edit", value: "edit" },
    { label: "Duplicate", value: "duplicate" },
    { label: "Rename", value: "rename" },
  ],
  [{ label: "Move to trash", value: "delete" }],
];
</script>

<template>
  <Menu
    :items="items"
    side="bottom"
    align="start"
    :side-offset="6"
    :ui="{
      content: 'menu-content',
      item: 'menu-item',
      separator: 'menu-separator',
    }"
  >
    <template #trigger="{ toggle }">
      <button
        class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="() => toggle()"
      >
        Actions
        <svg
          class="size-3.5 text-neutral-400"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </template>
  </Menu>
</template>

<style>
@reference "tailwindcss";

.menu-content {
  @apply z-50 min-w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900;
}

.menu-item {
  @apply flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800;
}

.menu-item[aria-disabled="true"] {
  @apply cursor-not-allowed opacity-40;
}

.menu-separator {
  @apply my-1 h-px bg-neutral-100 dark:bg-neutral-800;
}
</style>
