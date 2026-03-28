<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup } from 'akaza-ui'

const plan = ref('pro')

const options = [
  { value: 'free', label: 'Free', description: 'Up to 3 projects, community support.' },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects, priority support.' },
  { value: 'team', label: 'Team', description: 'Everything in Pro, plus SSO and audit logs.' },
]
</script>

<template>
  <RadioGroup
    v-model="plan"
    :options="options"
    :ui="{ item: 'flex w-72 cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all' }"
    class="flex flex-col gap-2"
  >
    <template #item="{ option, isChecked }">
      <span
        class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        :class="isChecked
          ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
          : 'border-neutral-300 dark:border-neutral-600'"
      >
        <span
          v-if="isChecked"
          class="size-1.5 rounded-full bg-white dark:bg-neutral-900"
        />
      </span>

      <span class="flex flex-col gap-0.5">
        <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {{ option.label }}
        </span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ option.description }}
        </span>
      </span>
    </template>
  </RadioGroup>
</template>
