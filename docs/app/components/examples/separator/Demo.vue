<script setup lang="ts">
import { Separator } from "akaza-ui";
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Horizontal -->
    <div class="flex flex-col gap-3 text-sm text-neutral-700 dark:text-neutral-300">
      <p class="font-medium">Horizontal separator</p>
      <Separator class="h-px w-full bg-neutral-200 dark:bg-neutral-800" />
      <p>Content below the separator.</p>
    </div>

    <!-- Vertical -->
    <div class="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
      <span>Home</span>
      <Separator orientation="vertical" class="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
      <span>About</span>
      <Separator orientation="vertical" class="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
      <span>Contact</span>
    </div>
  </div>
</template>
