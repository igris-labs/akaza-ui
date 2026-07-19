<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { NavigationMenu } from "akaza-ui";

const items: NavigationMenuItem[] = [
  {
    label: "Components",
    value: "components",
    children: [
      { label: "Inputs", href: "#inputs", description: "Controls for collecting values." },
      { label: "Overlays", href: "#overlays", description: "Floating and modal primitives." },
    ],
  },
  {
    label: "Guides",
    value: "guides",
    children: [
      { label: "Styling", href: "#styling", description: "Use ui, classes, and data attrs." },
      { label: "Accessibility", href: "#a11y", description: "Keyboard and ARIA behavior." },
    ],
  },
];
</script>

<template>
  <NavigationMenu
    :items="items"
    :ui="{
      root: 'w-full max-w-lg',
      list: 'gap-1 rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900',
      trigger: 'rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 data-[akaza-state=open]:bg-white data-[akaza-state=open]:text-neutral-900 dark:text-neutral-300 dark:data-[akaza-state=open]:bg-neutral-800 dark:data-[akaza-state=open]:text-white',
      content: 'w-full rounded-xl border border-neutral-300 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
      contentList: 'grid gap-1 sm:grid-cols-2',
      contentLink: 'grid gap-1 rounded-lg p-3 text-sm no-underline hover:bg-neutral-100 dark:hover:bg-neutral-800',
      label: 'font-medium text-neutral-900 dark:text-neutral-100',
      description: 'text-xs text-neutral-500 dark:text-neutral-400',
    }"
  />
</template>
