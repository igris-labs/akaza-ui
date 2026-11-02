<script setup lang="ts">
import { Accordion } from "../../ui/accordion";

const items = [
  {
    value: "a",
    label: "What is Akaza UI?",
    content: "A headless Vue component library with a Vue-native slots API.",
  },
  {
    value: "b",
    label: "Is it styled?",
    content: "Package CSS covers behavior and layout mechanics. You supply the visual styles.",
  },
  {
    value: "c",
    label: "Is it accessible?",
    content:
      "Yes, fully WAI-ARIA compliant with keyboard navigation and screen reader support built in.",
  },
];
</script>

<template>
  <div class="w-full max-w-sm">
    <Accordion
      :items="items"
      collapsible
    />
  </div>
</template>
