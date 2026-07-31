<script setup lang="ts">
import type { TagsInputValue } from "akaza-ui";
import { TagsInput } from "akaza-ui";
import { ref } from "vue";

const values = ref<TagsInputValue[]>(["Vue", "TypeScript"]);
const message = ref("Press Enter or comma to add a tag.");

const ui = {
  root: "min-h-10 w-full max-w-md items-center gap-1.5 rounded-lg border border-neutral-300 bg-white p-1.5 text-neutral-900 outline-none data-[akaza-focused]:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:data-[akaza-focused]:border-neutral-100",
  item: "inline-flex h-7 items-center gap-1 rounded-md bg-neutral-100 px-2 text-xs font-medium outline-none data-[akaza-highlighted]:ring-2 data-[akaza-highlighted]:ring-neutral-500 dark:bg-neutral-800",
  delete: "grid size-4 place-items-center rounded text-neutral-500 hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-950 dark:hover:text-neutral-100",
  input: "h-7 min-w-28 flex-1 border-0 bg-transparent px-1 text-sm outline-none placeholder:text-neutral-500",
  clear: "h-7 rounded-md px-2 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
};
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Technologies</p>
    <TagsInput
      v-model="values"
      add-on-paste
      clearable
      :max="5"
      placeholder="Add technology"
      :ui="ui"
      @invalid-value="(_value, details) => message = `Not added: ${details.reason}`"
    />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">{{ message }} {{ values.length }}/5 tags.</p>
  </div>
</template>
