<script setup lang="ts">
import { Motion, useReducedMotion } from "motion-v";

const shouldReduceMotion = useReducedMotion();
const enterEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
</script>

<template>
  <section
    class="flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-background px-5 py-12 text-highlighted sm:px-8 sm:py-16 lg:px-12"
  >
    <div
      class="mx-auto grid w-full max-w-384 grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-8 lg:-mt-20"
    >
      <Motion
        as="div"
        :initial="shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{
          duration: shouldReduceMotion ? 0 : 0.7,
          ease: enterEase,
        }"
        class="motion-reveal lg:col-span-6"
      >
        <h1
          class="max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.05em] text-balance sm:text-6xl xl:text-7xl"
        >
          Unstyled
          <span class="text-muted">Vue</span>
          components for accessible interfaces.
        </h1>

        <p class="mt-7 max-w-xl text-lg leading-8 text-muted">
          Headless primitives with a Vue-native slots API. Bring your own styles. Keyboard
          navigation and ARIA are handled.
        </p>

        <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <NuxtLink
            to="/getting-started"
            class="group inline-flex w-full items-center justify-between gap-4 bg-neutral-950 py-2.5 pr-2.5 pl-6 text-sm font-medium whitespace-nowrap text-white transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] dark:bg-white dark:text-neutral-950 sm:w-auto"
          >
            Get started
            <span
              class="grid size-8 place-items-center bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 dark:bg-neutral-950/10"
              aria-hidden="true"
            >
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </span>
          </NuxtLink>

          <NuxtLink
            to="/components"
            class="group inline-flex w-full items-center justify-between gap-4 bg-transparent py-2.5 pr-2.5 pl-6 text-sm font-medium whitespace-nowrap text-neutral-950 ring-1 ring-black/10 transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98] dark:text-white dark:ring-white/15 dark:hover:bg-white/[0.06] sm:w-auto"
          >
            Browse components
            <span
              class="grid size-8 place-items-center bg-neutral-950/5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 dark:bg-white/10"
              aria-hidden="true"
            >
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </span>
          </NuxtLink>
        </div>
      </Motion>

      <Motion
        as="div"
        :initial="shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{
          duration: shouldReduceMotion ? 0 : 0.75,
          delay: shouldReduceMotion ? 0 : 0.1,
          ease: enterEase,
        }"
        class="motion-reveal lg:col-span-5 lg:col-start-8"
      >
        <div
          class="overflow-hidden bg-muted/20 text-neutral-700 ring-1 ring-default dark:bg-neutral-950 dark:text-neutral-300"
        >
          <div class="border-b border-default px-5 py-3">
            <span class="font-mono text-xs text-dimmed">TabsDemo.vue</span>
          </div>

          <pre
            class="overflow-x-auto p-5 font-mono text-[13px] leading-6 sm:text-sm"
            aria-label="Vue Tabs component example"
          ><code><span class="text-violet-700 dark:text-violet-300">&lt;script</span> <span class="text-sky-700 dark:text-sky-300">setup</span> <span class="text-sky-700 dark:text-sky-300">lang</span>=<span class="text-emerald-700 dark:text-emerald-300">"ts"</span><span class="text-violet-700 dark:text-violet-300">&gt;</span>
<span class="text-rose-700 dark:text-rose-300">import</span> { ref } <span class="text-rose-700 dark:text-rose-300">from</span> <span class="text-emerald-700 dark:text-emerald-300">"vue"</span>;
<span class="text-rose-700 dark:text-rose-300">import</span> { Tabs } <span class="text-rose-700 dark:text-rose-300">from</span> <span class="text-emerald-700 dark:text-emerald-300">"akaza-ui"</span>;

<span class="text-rose-700 dark:text-rose-300">const</span> tabs = [
  { value: <span class="text-emerald-700 dark:text-emerald-300">"overview"</span>, label: <span class="text-emerald-700 dark:text-emerald-300">"Overview"</span> },
  { value: <span class="text-emerald-700 dark:text-emerald-300">"usage"</span>, label: <span class="text-emerald-700 dark:text-emerald-300">"Usage"</span> },
];
<span class="text-rose-700 dark:text-rose-300">const</span> active = <span class="text-amber-700 dark:text-amber-300">ref</span>(<span class="text-emerald-700 dark:text-emerald-300">"overview"</span>);
<span class="text-violet-700 dark:text-violet-300">&lt;/script&gt;</span>

<span class="text-violet-700 dark:text-violet-300">&lt;template&gt;</span>
  <span class="text-violet-700 dark:text-violet-300">&lt;Tabs</span> <span class="text-sky-700 dark:text-sky-300">v-model</span>=<span class="text-emerald-700 dark:text-emerald-300">"active"</span> <span class="text-sky-700 dark:text-sky-300">:items</span>=<span class="text-emerald-700 dark:text-emerald-300">"tabs"</span><span class="text-violet-700 dark:text-violet-300">&gt;</span>
    <span class="text-violet-700 dark:text-violet-300">&lt;template</span> <span class="text-sky-700 dark:text-sky-300">#panel-overview</span><span class="text-violet-700 dark:text-violet-300">&gt;</span>
      Accessible behavior, your styles.
    <span class="text-violet-700 dark:text-violet-300">&lt;/template&gt;</span>
  <span class="text-violet-700 dark:text-violet-300">&lt;/Tabs&gt;</span>
<span class="text-violet-700 dark:text-violet-300">&lt;/template&gt;</span></code></pre>
        </div>
      </Motion>
    </div>
  </section>
</template>
