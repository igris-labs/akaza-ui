<script setup lang="ts">
import type { CheckboxGroupValue } from "akaza-ui";
import { CheckboxGroup } from "akaza-ui";
import { ref } from "vue";

const value = ref<CheckboxGroupValue[]>(["email"]);
const options = [
  { value: "email", label: "Email", description: "Product updates and changelog notes." },
  { value: "sms", label: "SMS", description: "Critical security alerts only." },
  { value: "push", label: "Push", description: "In-app notifications." },
];
</script>

<template>
  <div class="grid max-w-sm gap-3">
    <CheckboxGroup
      v-model="value"
      parent
      legend="Notification channels"
      name="channels"
      parent-description="Toggle every enabled channel."
      :options="options"
      :ui="{
        legend: 'mb-1 text-sm font-semibold',
        parentItem: 'mb-2 border-b border-neutral-200 pb-3 dark:border-neutral-800',
        checkbox: {
          wrapper: 'gap-3',
          root: 'mt-0.5 rounded border border-neutral-300 bg-white data-[akaza-state=checked]:border-neutral-900 data-[akaza-state=checked]:bg-neutral-900 data-[akaza-state=checked]:text-white dark:border-neutral-700 dark:bg-neutral-950 dark:data-[akaza-state=checked]:border-white dark:data-[akaza-state=checked]:bg-white dark:data-[akaza-state=checked]:text-neutral-950',
          label: 'text-sm font-medium',
          description: 'block text-xs text-neutral-500 dark:text-neutral-400',
        },
      }"
    />
    <p class="text-xs text-neutral-500">Selected: {{ value.join(", ") || "none" }}</p>
  </div>
</template>
