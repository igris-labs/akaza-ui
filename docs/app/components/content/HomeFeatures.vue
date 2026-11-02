<script setup lang="ts">
const features = [
  {
    icon: "lucide:accessibility",
    title: "Fully Accessible",
    description:
      "Built on WAI-ARIA patterns. Keyboard navigation, focus management, and screen reader support are handled for you out of the box.",
  },
  {
    icon: "lucide:paintbrush",
    title: "Completely Unstyled",
    description:
      "No default visual styles. Bring your own CSS, Tailwind, or any design system — full control over every pixel, no overrides needed.",
  },
  {
    icon: "lucide:layout-template",
    title: "Vue-Native Slots API",
    description:
      "Composing UI feels natural in Vue. Use slots instead of sub-components — no Radix-style boilerplate, just idiomatic Vue templates.",
  },
  {
    icon: "lucide:sliders-horizontal",
    title: "Headless & Flexible",
    description:
      "Components expose all state and behavior through slots and props. You control the markup — Akaza UI handles the logic.",
  },
  {
    icon: "lucide:zap",
    title: "Lightweight",
    description:
      "No runtime bloat. Each component is self-contained with minimal dependencies, so you only ship what you actually use.",
  },
  {
    icon: "lucide:braces",
    title: "TypeScript First",
    description:
      "Full type safety throughout. Slot props, component props, and emits are all typed — autocomplete works everywhere.",
  },
];
</script>
<template>
  <section aria-labelledby="features-title">
    <h2
      id="features-title"
      class="text-2xl font-semibold tracking-tight sm:text-3xl"
    >
      Everything you need, nothing you don't
    </h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="flex items-start gap-3 rounded-xl bg-muted/40 p-5"
      >
        <Icon
          :name="feature.icon"
          class="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div>
          <h3 class="text-sm font-medium text-highlighted">{{ feature.title }}</h3>
          <p class="mt-2 text-[13px] leading-6 text-muted-foreground">{{ feature.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
