<script setup lang="ts">
import type { MenuItem } from "akaza-ui";
import { ContextMenu } from "../../ui/context-menu";

const items: MenuItem[] = [
  { label: "Open" },
  { label: "Rename" },
  { type: "separator" },
  { label: "Delete", disabled: true },
];
</script>

<template>
  <ContextMenu :items="items">
    <div
      class="grid h-32 w-64 place-items-center rounded-xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground"
    >
      Right-click this area
    </div>
  </ContextMenu>
</template>
