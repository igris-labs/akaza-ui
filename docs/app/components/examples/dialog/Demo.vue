<script setup lang="ts">
import { Dialog } from 'akaza-ui'
</script>

<template>
  <Dialog>
    <template #trigger="{ toggle }">
      <button
        class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="() => toggle()"
      >
        Edit profile
      </button>
    </template>

    <template #header="{ close, titleId }">
      <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <h2 :id="titleId" class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Edit profile
        </h2>
        <button
          class="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close"
          @click="() => close()"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 px-5 py-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">Display name</span>
          <input
            type="text"
            placeholder="Jane Doe"
            class="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">Email</span>
          <input
            type="email"
            placeholder="jane@example.com"
            class="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
          />
        </label>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <button
          class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="() => close()"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          @click="() => close()"
        >
          Save changes
        </button>
      </div>
    </template>
  </Dialog>
</template>
