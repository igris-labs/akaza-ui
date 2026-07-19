<script setup lang="ts">
import type { ToastType } from "akaza-ui";
import { Toast, useToast } from "akaza-ui";
import { computed } from "vue";

const toast = useToast();
const openCount = computed(() => toast.toasts.value.filter((item) => item.state === "open").length);
const types: Array<{ label: string; type: ToastType }> = [
  { label: "Standard", type: "status" },
  { label: "Success", type: "success" },
  { label: "Info", type: "info" },
  { label: "Warning", type: "warning" },
  { label: "Alert", type: "alert" },
  { label: "Error", type: "error" },
];

function show(type: ToastType) {
  toast.add({
    title: `${type.slice(0, 1).toUpperCase()}${type.slice(1)} notification`,
    description: `This toast exposes type="${type}" to custom content.`,
    type,
    duration: type === "error" || type === "alert" ? 0 : 5000,
  });
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="item in types"
      :key="item.type"
      type="button"
      class="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
      @click="show(item.type)"
    >
      {{ item.label }}
    </button>
    <span class="rounded-md bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
      Open: {{ openCount }}
    </span>
  </div>

  <Toast
    :ui="{
      viewport: 'w-[min(100vw,24rem)]',
      toast: 'relative grid gap-1 rounded-lg border border-neutral-300 bg-white p-4 pr-10 shadow-lg data-[akaza-type=error]:border-red-500 data-[akaza-type=warning]:border-amber-500 dark:border-neutral-800 dark:bg-neutral-900',
      title: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100',
      description: 'text-sm text-neutral-600 dark:text-neutral-400',
      close: 'absolute right-2 top-2 size-6 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    }"
  />
</template>
