<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { NavigationMenu } from "akaza-ui";
import { ref } from "vue";

const selected = ref("/components/input");

const items: NavigationMenuItem[] = [
  {
    label: "Components",
    value: "components",
    children: [
      { label: "Input", to: "/components/input", description: "Controls for collecting values." },
      { label: "Dialog", to: "/components/dialog", description: "Modal focus and dismissal." },
      {
        label: "Tree",
        to: "/components/tree",
        description: "Hierarchical navigation and selection.",
      },
    ],
  },
  {
    label: "Guides",
    value: "guides",
    children: [
      { label: "Installation", to: "/getting-started/installation", description: "Install and configure Akaza UI." },
      { label: "Styling", to: "/getting-started/styling", description: "Use ui, classes, and data attrs." },
    ],
  },
  {
    label: "Ecosystem",
    value: "ecosystem",
    children: [
      {
        label: "Inspira UI",
        href: "https://inspira-ui.com",
        description: "Animated UI Components.",
      },
      {
        label: "Inspira UI Pro",
        href: "https://pro.inspira-ui.com",
        description: "Premium Templates.",
      },
      {
        label: "Instruo",
        href: "https://instruo.org",
        description: "Tools, utilities and games.",
      },
    ],
  },
];
</script>

<template>
  <NavigationMenu
    v-model="selected"
    :items="items"
    :ui="{
      root: 'w-full max-w-lg',
      list: 'gap-1 rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900',
      item: 'relative',
      trigger:
        'rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 data-[akaza-active]:bg-white data-[akaza-active]:text-neutral-900 data-[akaza-state=open]:bg-white data-[akaza-state=open]:text-neutral-900 dark:text-neutral-300 dark:data-[akaza-active]:bg-neutral-800 dark:data-[akaza-active]:text-white dark:data-[akaza-state=open]:bg-neutral-800 dark:data-[akaza-state=open]:text-white',
      content:
        'w-full rounded-xl border border-neutral-300 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
      viewport: 'w-full',
      contentList: 'grid gap-1 sm:grid-cols-2',
      contentItem: 'min-w-0',
      contentLink:
        'grid gap-1 rounded-lg p-3 text-sm no-underline hover:bg-neutral-100 data-[akaza-state=active]:bg-neutral-100 dark:hover:bg-neutral-800 dark:data-[akaza-state=active]:bg-neutral-800',
      label: 'font-medium text-neutral-900 dark:text-neutral-100',
      description: 'text-xs text-neutral-500 dark:text-neutral-400',
    }"
  />
</template>
