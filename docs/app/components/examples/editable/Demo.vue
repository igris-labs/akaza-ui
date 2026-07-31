<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { Editable } from "akaza-ui";
import { ref } from "vue";

const value = ref("Quarterly planning notes");
const status = ref("Click the value or press Enter to edit it.");

function onSubmit(nextValue: string, details: AkazaChangeEventDetails) {
  status.value = `Submitted by ${details.reason}: ${nextValue || "(empty)"}`;
}

function onCancel(value: string) {
  status.value = `Canceled. Kept: ${value || "(empty)"}`;
}

const ui = {
  root: "grid w-full max-w-md gap-2",
  preview: "min-h-10 w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100 focus-visible:border-neutral-300 focus-visible:outline-none dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:border-neutral-700",
  input: "min-h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100",
  actions: "flex gap-2",
  edit: "rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
  submit: "rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900",
  cancel: "rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
};
</script>

<template>
  <div class="grid gap-3">
    <Editable
      v-model="value"
      activation-mode="click"
      submit-mode="none"
      select-on-focus
      :ui="ui"
      @submit="onSubmit"
      @cancel="onCancel"
    />
    <div class="grid gap-1 text-xs text-neutral-600 dark:text-neutral-400">
      <p>{{ status }}</p>
      <p>Committed value: <code>{{ value }}</code></p>
    </div>
  </div>
</template>
