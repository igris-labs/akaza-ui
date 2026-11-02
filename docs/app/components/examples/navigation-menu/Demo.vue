<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { NavigationMenu } from "../../ui/navigation-menu";

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
      {
        label: "Installation",
        to: "/getting-started/installation",
        description: "Install and configure Akaza UI.",
      },
      {
        label: "Styling",
        to: "/getting-started/styling",
        description: "Use ui, classes, and data attrs.",
      },
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
    class="w-full max-w-lg"
    :items="items"
  />
</template>
