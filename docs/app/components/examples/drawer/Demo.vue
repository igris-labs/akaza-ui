<script setup lang="ts">
import { Drawer } from "akaza-ui";
</script>

<template>
  <Drawer
    side="right"
    :ui="{
      overlay: 'bg-black/50',
      content: 'w-80 bg-white shadow-xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800',
    }"
  >
    <template #trigger="{ toggle }">
      <button
        class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="() => toggle()"
      >
        Open cart
      </button>
    </template>

    <template #header="{ close, titleId }">
      <div
        class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800"
      >
        <h2 :id="titleId" class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Your cart
        </h2>
        <button
          class="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
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

    <template #body>
      <div class="flex flex-col gap-3 px-5 py-4">
        <div
          v-for="item in [
            { name: 'Akaza UI Pro', price: '$49' },
            { name: 'Component Pack', price: '$19' },
          ]"
          :key="item.name"
          class="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
        >
          <div>
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {{ item.name }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Lifetime license</p>
          </div>
          <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{
            item.price
          }}</span>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div class="mb-3 flex items-center justify-between text-sm">
          <span class="text-neutral-600 dark:text-neutral-400">Total</span>
          <span class="font-semibold text-neutral-900 dark:text-neutral-100">$68</span>
        </div>
        <button
          class="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          @click="() => close()"
        >
          Checkout
        </button>
      </div>
    </template>
  </Drawer>
</template>
