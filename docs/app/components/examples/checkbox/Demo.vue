<script setup lang="ts">
import { Checkbox } from "akaza-ui";
import { ref } from "vue";

const notifications = ref(true);
const marketing = ref(false);
const updates = ref<boolean | "indeterminate">("indeterminate");

const checkboxUi = {
  wrapper: "flex items-start gap-3",
  root: "flex size-4 shrink-0 items-center justify-center rounded border border-neutral-400 bg-white transition-colors dark:border-neutral-600 dark:bg-neutral-800 data-[akaza-state=checked]:border-neutral-900 data-[akaza-state=checked]:bg-neutral-900 data-[akaza-state=indeterminate]:bg-neutral-900 dark:data-[akaza-state=checked]:border-white dark:data-[akaza-state=checked]:bg-white dark:data-[akaza-state=indeterminate]:bg-white",
  indicator: "flex items-center justify-center",
  text: "flex flex-col gap-0.5",
  label: "text-sm font-medium text-neutral-900 dark:text-neutral-100",
  description: "text-xs text-neutral-600 dark:text-neutral-400",
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <Checkbox
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account activity."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </Checkbox>

    <Checkbox
      v-model="marketing"
      label="Marketing emails"
      description="Get notified about new features and promotions."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </Checkbox>

    <Checkbox
      v-model="updates"
      label="All updates"
      description="A mix of indeterminate, checked, and unchecked."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked === true"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg
          v-else-if="checked === 'indeterminate'"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 6h6" stroke-linecap="round" />
        </svg>
      </template>
    </Checkbox>
  </div>
</template>
