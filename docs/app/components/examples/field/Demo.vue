<script setup lang="ts">
import { Field, Input } from "akaza-ui";
import { computed, ref } from "vue";

const email = ref("");
const invalid = computed(() => email.value.length > 0 && !email.value.includes("@"));
</script>

<template>
  <Field
    label="Email"
    description="Used for account notifications."
    :error="invalid ? 'Enter a valid email address.' : undefined"
    required
    :ui="{
      label: 'text-sm font-medium text-neutral-900 dark:text-neutral-100',
      description: 'text-xs text-neutral-600 dark:text-neutral-400',
      error: 'text-xs text-red-600 dark:text-red-400',
    }"
  >
    <Input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      class="h-9 w-full max-w-sm rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-900 data-[akaza-invalid]:border-red-500 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-100"
    />
  </Field>
</template>
