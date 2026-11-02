<script setup lang="ts">
import { HoverPreviewCard } from "../../ui/hover-preview-card";
</script>

<template>
  <p class="text-sm text-muted-foreground">
    Hover
    <HoverPreviewCard arrow>
      <template #trigger="{ triggerProps }">
        <a
          href="#profile"
          class="font-medium text-info underline decoration-info/50 underline-offset-4 hover:decoration-info"
          v-bind="triggerProps"
        >Ada Lovelace</a>
      </template>
      <template #content>
        <p class="text-sm font-semibold text-foreground">Ada Lovelace</p>
        <p class="mt-1 text-sm text-muted-foreground">
          A rich hover preview can hold profile, link, or entity metadata.
        </p>
      </template>
    </HoverPreviewCard>
    to open a preview card.
  </p>
</template>
