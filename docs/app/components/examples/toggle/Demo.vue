<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "../../ui/toggle";

const bold = ref(false);
const italic = ref(false);
const underline = ref(false);
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      role="toolbar"
      aria-label="Text formatting"
      class="flex items-center gap-1 rounded-xl border border-border bg-background p-1"
    >
      <Toggle
        v-model="bold"
        aria-label="Bold"
        class="size-8 items-center justify-center"
      >
        B
      </Toggle>

      <Toggle
        v-model="italic"
        aria-label="Italic"
        class="size-8 items-center justify-center"
      >
        I
      </Toggle>

      <Toggle
        v-model="underline"
        aria-label="Underline"
        class="size-8 items-center justify-center"
      >
        U
      </Toggle>
    </div>

    <p
      class="text-sm text-muted-foreground"
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
