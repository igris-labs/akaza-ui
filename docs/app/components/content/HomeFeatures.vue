<script setup lang="ts">
const features = [
  {
    icon: "tabler:accessible",
    title: "Fully Accessible",
    description:
      "Built on WAI-ARIA patterns. Keyboard navigation, focus management, and screen reader support are handled for you out of the box.",
  },
  {
    icon: "tabler:brush",
    title: "Completely Unstyled",
    description:
      "Zero default styles. Bring your own CSS, Tailwind, or any design system — full control over every pixel, no overrides needed.",
  },
  {
    icon: "tabler:components",
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
    icon: "tabler:bolt",
    title: "Lightweight",
    description:
      "No runtime bloat. Each component is self-contained with minimal dependencies, so you only ship what you actually use.",
  },
  {
    icon: "tabler:code",
    title: "TypeScript First",
    description:
      "Full type safety throughout. Slot props, component props, and emits are all typed — autocomplete works everywhere.",
  },
];
</script>

<template>
  <section
    class="relative overflow-hidden bg-neutral-50 px-4 py-24 dark:bg-black sm:px-6 sm:py-32 lg:px-8"
  >
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent dark:via-white/15"
      />
      <div
        class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent dark:via-white/15"
      />
    </div>

    <div class="mx-auto max-w-7xl">
      <div
        class="max-w-2xl motion-safe:animate-[akaza-feature-rise_900ms_cubic-bezier(0.32,0.72,0,1)_both]"
      >
        <p
          class="inline-flex rounded-full bg-neutral-950/4 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500 ring-1 ring-black/5 dark:bg-white/[0.06] dark:text-neutral-400 dark:ring-white/10"
        >
          Feature contract
        </p>
        <h2
          class="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-5xl dark:text-white"
        >
          Everything you need, nothing you don't
        </h2>
        <p class="mt-6 max-w-lg text-base leading-7 text-neutral-600 dark:text-neutral-400">
          Akaza UI gives you the hard behavior primitives and leaves the visual system completely in
          your hands.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <NuxtLink
            to="/components"
            class="group inline-flex w-full items-center justify-between gap-4 rounded-full bg-neutral-950 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] dark:bg-white dark:text-neutral-950 sm:w-auto"
          >
            Browse components
            <span
              class="grid size-8 place-items-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105 dark:bg-neutral-950/10"
              aria-hidden="true"
            >
              →
            </span>
          </NuxtLink>
          <NuxtLink
            to="/getting-started/styling"
            class="group inline-flex w-full items-center justify-between gap-4 rounded-full bg-white py-2.5 pl-6 pr-2.5 text-sm font-medium text-neutral-950 ring-1 ring-black/10 transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-50 active:scale-[0.98] dark:bg-white/[0.06] dark:text-white dark:ring-white/10 dark:hover:bg-white/[0.09] sm:w-auto"
          >
            Styling contract
            <span
              class="grid size-8 place-items-center rounded-full bg-neutral-950/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105 dark:bg-white/10"
              aria-hidden="true"
            >
              →
            </span>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="group rounded-[2rem] bg-neutral-950/[0.045] p-1.5 ring-1 ring-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 dark:bg-white/[0.055] dark:ring-white/10"
        >
          <div
            class="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 dark:bg-neutral-950 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.10)] dark:ring-white/10 sm:p-6"
          >
            <div>
              <div class="flex items-start justify-between gap-4">
                <div
                  class="grid size-10 place-items-center rounded-xl bg-neutral-950/[0.04] text-neutral-700 ring-1 ring-black/5 dark:bg-white/[0.06] dark:text-neutral-300 dark:ring-white/10"
                >
                  <UIcon :name="feature.icon" class="size-5" aria-hidden="true" />
                </div>
                <span
                  class="mt-5 h-px flex-1 bg-linear-to-r from-neutral-200 to-transparent dark:from-white/10"
                  aria-hidden="true"
                />
              </div>

              <h3
                class="mt-5 text-lg font-semibold tracking-tight text-neutral-950 dark:text-white"
              >
                {{ feature.title }}
              </h3>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes akaza-feature-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 2.25rem, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
