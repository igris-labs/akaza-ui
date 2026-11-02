<script setup lang="ts">
import { Button as ExampleButton } from "../../ui/button";

import { Tooltip } from "../../ui/tooltip";
</script>

<template>
  <div class="flex items-center gap-3">
    <Tooltip
      direction="top"
      :delay-duration="200"
    >
      <template #trigger>
        <ExampleButton
          class="size-9 items-center justify-center"
          aria-label="Settings"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle
              cx="8"
              cy="8"
              r="2.5"
            />
            <path
              d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M11.2 4.8l1.4-1.4M3.4 12.6l1.4-1.4"
              stroke-linecap="round"
            />
          </svg>
        </ExampleButton>
      </template>
      <template #content>Settings</template>
    </Tooltip>

    <Tooltip
      direction="top"
      :delay-duration="200"
    >
      <template #trigger>
        <ExampleButton
          class="size-9 items-center justify-center"
          aria-label="Notifications"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M8 1.5A5 5 0 003 6.5v2.5L2 11h12l-1-2V6.5A5 5 0 008 1.5z"
              stroke-linejoin="round"
            />
            <path d="M6.5 11.5a1.5 1.5 0 003 0" />
          </svg>
        </ExampleButton>
      </template>
      <template #content>Notifications</template>
    </Tooltip>

    <Tooltip
      direction="top"
      :delay-duration="200"
    >
      <template #trigger>
        <ExampleButton
          class="size-9 items-center justify-center"
          aria-label="Help"
        >
          <svg
            class="size-4"
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
              d="M6 6.5a2 2 0 113 1.732c-.5.29-1 .768-1 1.268M8 11v.5"
              stroke-linecap="round"
            />
          </svg>
        </ExampleButton>
      </template>
      <template #content>Help center</template>
    </Tooltip>
  </div>
</template>
