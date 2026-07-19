<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { NavigationMenu } from "akaza-ui";
import {
  canvasCol,
  codePill,
  exampleLabelDescription,
  exampleLabelTitle,
  navigationMenuUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const open = ref<string | null>(null);
const selected = ref("none");

const items: NavigationMenuItem[] = [
  {
    label: "Products",
    value: "products",
    children: [
      { label: "Components", href: "#components", description: "Headless Vue primitives.", active: true },
      { label: "Patterns", href: "#patterns", description: "Composed production workflows." },
      {
        label: "Resources",
        description: "More project information.",
        children: [
          { label: "Changelog", href: "#changelog" },
          { label: "Roadmap", href: "#roadmap" },
        ],
      },
    ],
  },
  {
    label: "Docs",
    value: "docs",
    children: [
      { label: "Getting started", href: "#getting-started", description: "Install and configure Akaza UI." },
      { label: "Styling", href: "#styling", description: "ui prop, semantic classes, and data attrs." },
      { label: "Accessibility", href: "#accessibility", description: "Keyboard and screen reader behavior." },
    ],
  },
  { label: "GitHub", href: "#github" },
  { label: "Disabled", href: "#disabled", disabled: true },
];
</script>

<template>
  <section id="navigation-menu">
    <h2 :class="sectionTitle">Navigation Menu</h2>
    <p :class="sectionDescription">
      Top-level site navigation with hover/focus flyouts, keyboard movement across triggers, and semantic navigation markup.
    </p>

    <div :class="canvasCol">
      <div>
        <h3 :class="exampleLabelTitle">Flyouts, direct links, nested links, and disabled state</h3>
        <p :class="exampleLabelDescription">Hover is delayed; keyboard navigation uses roving focus, Home/End, typeahead, and Escape.</p>
      </div>
      <NavigationMenu
        v-model:open="open"
        :items="items"
        :ui="navigationMenuUi"
        @select="item => selected = item.label"
      />
      <code :class="codePill">open: {{ open ?? "(closed)" }}, selected: {{ selected }}</code>
    </div>
  </section>
</template>
