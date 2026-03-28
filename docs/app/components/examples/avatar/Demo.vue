<script setup lang="ts">
import { Avatar } from "akaza-ui";
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- Loaded image -->
    <Avatar src="https://i.pravatar.cc/80?img=1" alt="Alice">
      <template #fallback>
        <span
          class="flex size-full items-center justify-center bg-violet-100 text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
        >
          AL
        </span>
      </template>
    </Avatar>

    <!-- Initials fallback -->
    <Avatar src="/nonexistent.jpg" alt="Bob">
      <template #fallback>
        <span
          class="flex size-full items-center justify-center bg-sky-100 text-sm font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
        >
          BK
        </span>
      </template>
    </Avatar>

    <!-- Icon fallback -->
    <Avatar alt="Guest">
      <template #fallback>
        <span class="flex size-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <svg
            class="size-5 text-neutral-400 dark:text-neutral-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </template>
    </Avatar>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

:deep(.akaza-avatar) {
  @apply size-10 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800;
}

:deep(.akaza-avatar img) {
  @apply size-full object-cover;
}
</style>
