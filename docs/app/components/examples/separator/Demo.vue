<script setup lang="ts">
import { Separator } from "../../ui/separator";
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Horizontal -->
    <div class="flex flex-col gap-3 text-sm text-muted-foreground">
      <p class="font-medium">Horizontal separator</p>
      <Separator class="h-px w-full" />
      <p>Content below the separator.</p>
    </div>

    <!-- Vertical -->
    <div class="flex items-center gap-4 text-sm text-muted-foreground">
      <span>Home</span>
      <Separator
        orientation="vertical"
        class="h-4 w-px"
      />
      <span>About</span>
      <Separator
        orientation="vertical"
        class="h-4 w-px"
      />
      <span>Contact</span>
    </div>
  </div>
</template>
