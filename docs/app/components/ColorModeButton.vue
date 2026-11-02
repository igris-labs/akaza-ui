<script setup lang="ts">
import { Button } from "./ui/button";

const colorMode = useColorMode();
</script>

<template>
  <ColorScheme>
    <Button
      variant="ghost"
      size="md"
      shape="icon"
      :aria-label="colorMode.value === 'dark' ? 'Use light theme' : 'Use dark theme'"
      @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path
          v-if="colorMode.value === 'dark'"
          d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
        <path
          v-else
          d="M20.9 13.1A9 9 0 0 1 10.9 3a9 9 0 1 0 10 10.1Z"
        />
      </svg>
    </Button>
    <template #placeholder>
      <span
        class="inline-block size-8"
        aria-hidden="true"
      />
    </template>
  </ColorScheme>
</template>
