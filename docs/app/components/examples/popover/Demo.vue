<script setup lang="ts">
import { Button as ExampleButton } from "../../ui/button";

import { Popover } from "../../ui/popover";
</script>

<template>
  <Popover
    teleport="body"
    side="bottom"
    align="center"
    :side-offset="8"
  >
    <template #trigger="{ toggle }">
      <ExampleButton
        class="items-center gap-2"
        @click="() => toggle()"
      >
        <svg
          class="size-4 text-muted-foreground"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
          />
          <path
            d="M8 7v4M8 5.5v.5"
            stroke-linecap="round"
          />
        </svg>
        Learn more
      </ExampleButton>
    </template>

    <template #content="{ close }">
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-foreground">Akaza UI</p>
        <p class="text-xs leading-relaxed text-muted-foreground">
          Headless, accessible Vue components. Bring your own styles and compose UI exactly how you
          want.
        </p>
        <div class="flex items-center justify-between pt-1">
          <a
            href="/getting-started"
            class="text-xs font-medium text-foreground underline-offset-2 hover:underline"
          >
            Documentation →
          </a>
          <ExampleButton @click="() => close()"> Dismiss </ExampleButton>
        </div>
      </div>
    </template>
  </Popover>
</template>
