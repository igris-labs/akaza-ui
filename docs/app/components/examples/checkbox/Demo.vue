<script setup lang="ts">
import { Checkbox } from "akaza-ui";
import { ref } from "vue";

const notifications = ref(true);
const marketing = ref(false);
const updates = ref<boolean | "indeterminate">("indeterminate");
</script>

<template>
  <div class="flex flex-col gap-4">
    <Checkbox
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account activity."
    >
      <template #indicator="{ checked }">
        <div
          class="flex size-4 items-center justify-center rounded border transition-colors"
          :class="
            checked
              ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
              : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
          "
        >
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
        </div>
      </template>
    </Checkbox>

    <Checkbox
      v-model="marketing"
      label="Marketing emails"
      description="Get notified about new features and promotions."
    >
      <template #indicator="{ checked }">
        <div
          class="flex size-4 items-center justify-center rounded border transition-colors"
          :class="
            checked
              ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
              : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
          "
        >
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
        </div>
      </template>
    </Checkbox>

    <Checkbox
      v-model="updates"
      label="All updates"
      description="A mix of indeterminate, checked, and unchecked."
    >
      <template #indicator="{ checked }">
        <div
          class="flex size-4 items-center justify-center rounded border transition-colors"
          :class="
            checked
              ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
              : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
          "
        >
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
        </div>
      </template>
    </Checkbox>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

:deep(.akaza-checkbox-wrapper) {
  @apply flex cursor-pointer items-start gap-3;
}

:deep(.akaza-checkbox-text) {
  @apply flex flex-col gap-0.5;
}

:deep(.akaza-checkbox-label) {
  @apply text-sm font-medium text-neutral-900 dark:text-neutral-100;
}

:deep(.akaza-checkbox-description) {
  @apply text-xs text-neutral-500 dark:text-neutral-400;
}
</style>
