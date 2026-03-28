<script setup lang="ts">
import { AlertDialog } from "akaza-ui";
</script>

<template>
  <AlertDialog
    title="Delete account"
    description="This action is permanent and cannot be undone. All your data will be removed."
  >
    <template #trigger="{ toggle }">
      <button
        class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-700 dark:hover:bg-red-600"
        @click="() => toggle()"
      >
        Delete account
      </button>
    </template>

    <template #header="{ close, titleId }">
      <div class="flex items-start justify-between p-5 pb-0">
        <h2 :id="titleId" class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Delete account
        </h2>
        <button
          class="ml-4 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close"
          @click="() => close()"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </template>

    <template #body="{ descriptionId }">
      <p :id="descriptionId" class="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-400">
        This action is permanent and cannot be undone. All your data will be removed from our
        servers.
      </p>
    </template>

    <template #footer="{ close }">
      <div
        class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800"
      >
        <button
          class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="() => close()"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          @click="() => close()"
        >
          Delete
        </button>
      </div>
    </template>
  </AlertDialog>
</template>
