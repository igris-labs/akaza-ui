<script setup lang="ts">
import { Accordion } from 'akaza-ui'

const items = [
  { value: 'a', label: 'What is Akaza UI?', content: 'A headless Vue component library with a Vue-native slots API. Zero default styles.' },
  { value: 'b', label: 'Is it styled?', content: 'No — bring your own CSS, Tailwind, or any design system. Full control over every pixel.' },
  { value: 'c', label: 'Is it accessible?', content: 'Yes, fully WAI-ARIA compliant with keyboard navigation and screen reader support built in.' },
]
</script>

<template>
  <div class="w-full max-w-sm divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
    <Accordion
      :items="items"
      collapsible
      :ui="{ trigger: 'px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60' }"
    >
      <template #trigger="{ item }">
        <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ item.label }}</span>
      </template>
      <template #icon="{ isOpen }">
        <svg
          class="size-4 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
      <template #content="{ item }">
        <p class="px-4 pb-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {{ item.content }}
        </p>
      </template>
    </Accordion>
  </div>
</template>
