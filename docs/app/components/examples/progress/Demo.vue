<script setup lang="ts">
import { ref } from 'vue'
import { Progress } from 'akaza-ui'

const value = ref(65)
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <!-- Determinate -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>Upload progress</span>
        <span>{{ value }}%</span>
      </div>
      <Progress
        v-model="value"
        class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
      >
        <template #indicator="{ percentage }">
          <div
            class="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-white"
            :style="{ width: `${percentage}%` }"
          />
        </template>
      </Progress>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <button
        class="flex-1 rounded-lg border border-neutral-200 bg-white py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="value = Math.max(0, value - 20)"
      >
        − 20%
      </button>
      <button
        class="flex-1 rounded-lg border border-neutral-200 bg-white py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="value = Math.min(100, value + 20)"
      >
        + 20%
      </button>
    </div>

    <!-- Indeterminate -->
    <div class="flex flex-col gap-2">
      <span class="text-xs text-neutral-500 dark:text-neutral-400">Indeterminate</span>
      <Progress
        :model-value="null"
        class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
        aria-label="Loading"
      >
        <template #indicator>
          <div class="h-full w-1/3 animate-[indeterminate_1.4s_ease_infinite] rounded-full bg-neutral-900 dark:bg-white" />
        </template>
      </Progress>
    </div>
  </div>
</template>

<style>
@keyframes indeterminate {
  0% { transform: translateX(-100%) scaleX(1); }
  50% { transform: translateX(100%) scaleX(2); }
  100% { transform: translateX(300%) scaleX(1); }
}
</style>
