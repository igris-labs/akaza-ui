<script setup lang="ts">
import { Button as ExampleButton } from "../../ui/button";

import { Menu } from "../../ui/menu";

const items = [
  [
    { label: "Edit", value: "edit" },
    { label: "Duplicate", value: "duplicate" },
    { label: "Rename", value: "rename" },
  ],
  [{ label: "Move to trash", value: "delete" }],
];
</script>

<template>
  <Menu
    teleport="body"
    :items="items"
    side="bottom"
    align="start"
    :side-offset="6"
  >
    <template #trigger="{ toggle, triggerProps }">
      <ExampleButton
        class="items-center gap-2"
        v-bind="triggerProps"
        @click="() => toggle()"
      >
        Actions
        <svg
          class="size-3.5 text-muted-foreground"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </ExampleButton>
    </template>
  </Menu>
</template>
