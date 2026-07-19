<script setup lang="ts">
import { Motion, useReducedMotion } from "motion-v";

const shouldReduceMotion = useReducedMotion();
const enterEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
  {
    icon: "i-lucide-accessibility",
    title: "Fully Accessible",
    description:
      "Built on WAI-ARIA patterns. Keyboard navigation, focus management, and screen reader support are handled for you out of the box.",
  },
  {
    icon: "i-lucide-paintbrush",
    title: "Completely Unstyled",
    description:
      "Zero default styles. Bring your own CSS, Tailwind, or any design system — full control over every pixel, no overrides needed.",
  },
  {
    icon: "i-lucide-layout-template",
    title: "Vue-Native Slots API",
    description:
      "Composing UI feels natural in Vue. Use slots instead of sub-components — no Radix-style boilerplate, just idiomatic Vue templates.",
  },
  {
    icon: "i-lucide-sliders-horizontal",
    title: "Headless & Flexible",
    description:
      "Components expose all state and behavior through slots and props. You control the markup — Akaza UI handles the logic.",
  },
  {
    icon: "i-lucide-zap",
    title: "Lightweight",
    description:
      "No runtime bloat. Each component is self-contained with minimal dependencies, so you only ship what you actually use.",
  },
  {
    icon: "i-lucide-braces",
    title: "TypeScript First",
    description:
      "Full type safety throughout. Slot props, component props, and emits are all typed — autocomplete works everywhere.",
  },
];
</script>

<template>
  <section class="border-y border-default bg-background px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
    <div class="mx-auto max-w-[96rem]">
      <Motion
        as="div"
        :initial="shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :in-view-options="{ once: true, amount: 0.5 }"
        :transition="{
          duration: shouldReduceMotion ? 0 : 0.65,
          ease: enterEase,
        }"
        class="motion-reveal"
      >
        <h2
          class="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-balance text-highlighted sm:text-5xl"
        >
          Everything you need, nothing you don't
        </h2>
      </Motion>

      <div class="mt-12 grid border-t border-l border-default sm:grid-cols-2 lg:grid-cols-3">
        <Motion
          v-for="(feature, index) in features"
          :key="feature.title"
          as="article"
          :initial="shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :in-view-options="{ once: true, amount: 0.2 }"
          :transition="{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : index * 0.06,
            ease: enterEase,
          }"
          class="motion-reveal min-h-64 border-r border-b border-default p-6 sm:p-8"
        >
          <div class="grid size-10 place-items-center bg-muted/25 ring-1 ring-default">
            <UIcon
              :name="feature.icon"
              class="size-5 text-toned"
              aria-hidden="true"
            />
          </div>

          <h3 class="mt-8 text-lg font-semibold tracking-tight text-highlighted">
            {{ feature.title }}
          </h3>
          <p class="mt-4 max-w-md text-sm leading-6 text-muted">
            {{ feature.description }}
          </p>
        </Motion>
      </div>
    </div>
  </section>
</template>
