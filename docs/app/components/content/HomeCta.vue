<script setup lang="ts">
import { Motion, useReducedMotion } from "motion-v";

const shouldReduceMotion = useReducedMotion();
</script>

<template>
  <section class="border-t border-default bg-background px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
    <Motion
      as="div"
      :initial="shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :in-view-options="{ once: true, amount: 0.5 }"
      :transition="{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1],
      }"
      class="motion-reveal mx-auto grid max-w-[96rem] gap-8 lg:grid-cols-12 lg:items-center"
    >
      <div class="lg:col-span-6">
        <h2 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
          Add Akaza UI to your project.
        </h2>
        <p class="mt-3 text-base text-muted">Install the package, then choose a component.</p>
      </div>

      <div class="flex flex-wrap gap-3 lg:col-span-5 lg:col-start-8 lg:justify-end">
        <UButton
          to="/getting-started"
          label="Installation"
          trailing-icon="i-lucide-arrow-right"
          size="lg"
        />
        <UButton
          to="https://github.com/igris-labs/akaza-ui"
          target="_blank"
          label="View source"
          icon="i-simple-icons-github"
          color="neutral"
          variant="subtle"
          size="lg"
        />
      </div>
    </Motion>
  </section>
</template>
