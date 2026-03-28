<script setup lang="ts">
import { Button } from "akaza-ui";
import { ref } from "vue";

const isLoading = ref(false);

async function handleSave() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isLoading.value = false;
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Primary -->
    <Button
      class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
    >
      Primary
    </Button>

    <!-- Secondary -->
    <Button
      class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
    >
      Secondary
    </Button>

    <!-- Ghost -->
    <Button
      class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      Ghost
    </Button>

    <!-- Destructive -->
    <Button
      class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
    >
      Danger
    </Button>

    <!-- Loading -->
    <Button
      :loading="isLoading"
      :on-click="handleSave"
      loading-auto
      class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
    >
      Save
      <template #loading>
        <span class="flex items-center gap-2">
          <svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Saving…
        </span>
      </template>
    </Button>

    <!-- Disabled -->
    <Button
      disabled
      class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white opacity-40 dark:bg-white dark:text-neutral-900"
    >
      Disabled
    </Button>
  </div>
</template>
