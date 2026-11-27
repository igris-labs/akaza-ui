<script setup lang="ts">
import { useRovingFocus } from "akaza-ui";
import { reactive } from "vue";

const items = [
  { key: "bold", label: "Bold" },
  { key: "italic", label: "Italic" },
  { key: "underline", label: "Underline" },
] as const;
const pressed = reactive({ bold: false, italic: false, underline: false });
const { itemProps } = useRovingFocus({ items });
</script>

<template>
  <div class="grid gap-4">
    <div
      role="toolbar"
      aria-label="Text formatting"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="item in items"
        :key="item.key"
        v-bind="itemProps(item.key)"
        type="button"
        :aria-pressed="pressed[item.key]"
        class="min-h-10 rounded-md border border-border px-3 text-sm font-medium text-foreground not-aria-pressed:hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        @click="pressed[item.key] = !pressed[item.key]"
      >
        {{ item.label }}
      </button>
    </div>
    <p
      class="text-sm text-foreground"
      :class="{ 'font-bold': pressed.bold, italic: pressed.italic, underline: pressed.underline }"
    >
      Sample text
    </p>
  </div>
</template>
