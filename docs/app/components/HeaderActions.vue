<script setup lang="ts">
import { Button } from "./ui/button";
</script>
<template>
  <div class="flex shrink-0 items-center gap-1">
    <span
      class="mx-2 h-5 w-px bg-border"
      aria-hidden="true"
    />
    <Button
      as="a"
      href="https://github.com/igris-labs/akaza-ui"
      variant="ghost"
      size="md"
      shape="icon"
      aria-label="GitHub repository"
    >
      <Icon
        name="tabler:brand-github"
        class="size-4"
        aria-hidden="true"
      />
    </Button>
    <ColorModeButton />
  </div>
</template>
