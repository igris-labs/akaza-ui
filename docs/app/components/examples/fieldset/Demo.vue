<script setup lang="ts">
import { Field, Fieldset, Input } from "akaza-ui";
</script>

<template>
  <Fieldset
    legend="Billing details"
    description="Grouped fields share one semantic boundary."
    :ui="{
      root: 'rounded-xl border border-neutral-300 p-5 dark:border-neutral-800',
      legend: 'px-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100',
      description: 'mb-4 text-xs text-neutral-600 dark:text-neutral-400',
      content: 'grid gap-4',
    }"
  >
    <Field label="Name" :ui="{ label: 'text-sm font-medium' }">
      <Input
        placeholder="Ada Lovelace"
        class="h-9 w-full max-w-sm rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
      />
    </Field>
    <Field label="Company" :ui="{ label: 'text-sm font-medium' }">
      <Input
        placeholder="Analytical Engines Inc."
        class="h-9 w-full max-w-sm rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
      />
    </Field>
  </Fieldset>
</template>
