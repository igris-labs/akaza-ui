---
seo:
  title: Akaza UI
  description: Vue-native headless UI primitives — accessible, unstyled, and built for Vue.
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
ui:
  title: font-light
---
#top
:hero-background

#title
Unstyled [Vue]{.text-primary} components for accessible user interfaces.

#description
Headless UI primitives with a Vue-native slots API. Bring your own styles — keyboard navigation and ARIA are handled for you.

#links
  :::u-button
  ---
  to: /getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

#default
  :::prose-pre
  ---
  filename: TabsDemo.vue
  ---

  ```vue [TabsDemo.vue]
  <script setup lang="ts">
  import { ref } from "vue";
  import { Tabs } from "akaza-ui";

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "usage", label: "Usage" },
    { value: "api", label: "API" },
  ];
  const active = ref("overview");
  </script>

  <template>
    <Tabs
      :items="tabs"
      v-model="active"
      :ui="{ tab: 'px-4 py-2 text-sm' }"
    >
      <template #panel-overview>Welcome to Akaza UI.</template>
      <template #panel-usage>Import and use any component.</template>
      <template #panel-api>Full TypeScript API docs.</template>
    </Tabs>
  </template>
  ```
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Everything you need, nothing you don't

#links
  :::u-button
  ---
  color: neutral
  size: lg
  target: _blank
  to: https://github.com/igris-labs/akaza-ui
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  View on GitHub
  :::

#features
  :::u-page-feature
  ---
  icon: i-lucide-accessibility
  ---
  #title
  Fully Accessible

  #description
  Built on WAI-ARIA patterns. Keyboard navigation, focus management, and screen reader support are handled for you out of the box.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-paintbrush
  ---
  #title
  Completely Unstyled

  #description
  Zero default styles. Bring your own CSS, Tailwind, or any design system — full control over every pixel, no overrides needed.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-component
  ---
  #title
  Vue-Native Slots API

  #description
  Composing UI feels natural in Vue. Use slots instead of sub-components — no Radix-style boilerplate, just idiomatic Vue templates.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-sliders-horizontal
  ---
  #title
  Headless & Flexible

  #description
  Components expose all state and behavior through slots and props. You control the markup — Akaza UI handles the logic.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-zap
  ---
  #title
  Lightweight

  #description
  No runtime bloat. Each component is self-contained with minimal dependencies, so you only ship what you actually use.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-code-2
  ---
  #title
  TypeScript First

  #description
  Full type safety throughout. Slot props, component props, and emits are all typed — autocomplete works everywhere.
  :::
::


::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Start building
      to: '/getting-started'
      trailingIcon: i-lucide-arrow-right
    - label: View on GitHub
      to: 'https://github.com/igris-labs/akaza-ui'
      target: _blank
      variant: subtle
      icon: i-simple-icons-github
  title: Start building with Akaza UI.
  description: Accessible, unstyled Vue components ready to drop into your project. Style them your way — ship faster.
  class: dark:bg-neutral-950
  ---

  :stars-bg
  :::
::