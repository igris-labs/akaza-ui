<script setup lang="ts" generic="T extends string | boolean">
import { useId } from "vue";

defineProps<{
  label: string;
  options: { label: string; value: T }[];
  hint?: string;
}>();
const model = defineModel<T>({ required: true });
const id = useId();
</script>

<template>
  <div class="grid gap-2">
    <label :for="id" class="text-xs font-medium">{{ label }}</label>
    <div class="relative min-w-0">
      <select :id="id" v-model="model" :aria-describedby="hint ? `${id}-hint` : undefined" class="min-h-11 w-full min-w-0 appearance-none border border-neutral-300 bg-white py-2 pr-9 pl-3 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
        <option v-for="option in options" :key="String(option.value)" :value="option.value">{{ option.label }}</option>
      </select>
      <UIcon name="i-lucide-chevron-down" class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
    </div>
    <p v-if="hint" :id="`${id}-hint`" class="text-xs leading-5 text-neutral-600 dark:text-neutral-400">{{ hint }}</p>
  </div>
</template>
