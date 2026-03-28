<script setup lang="ts">
import { Toggle } from "akaza-ui";
import { ref } from "vue";

const bold = ref(false);
const italic = ref(false);
const underline = ref(false);
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      role="toolbar"
      aria-label="Text formatting"
      class="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <Toggle
        v-model="bold"
        aria-label="Bold"
        class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm font-bold transition-colors"
        :class="
          bold
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        "
      >
        B
      </Toggle>

      <Toggle
        v-model="italic"
        aria-label="Italic"
        class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm italic transition-colors"
        :class="
          italic
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        "
      >
        I
      </Toggle>

      <Toggle
        v-model="underline"
        aria-label="Underline"
        class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm underline transition-colors"
        :class="
          underline
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        "
      >
        U
      </Toggle>
    </div>

    <p
      class="text-sm text-neutral-600 dark:text-neutral-400"
      :class="{
        'font-bold': bold,
        italic,
        underline,
      }"
    >
      The quick brown fox jumps over the lazy dog.
    </p>
  </div>
</template>
