<script setup lang="ts">
import { HoverPreviewCard } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  codePill,
  hoverPreviewCardUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const open = ref(false);
</script>

<template>
  <section id="hover-preview-card">
    <h2 :class="sectionTitle">Hover Preview Card</h2>
    <p :class="sectionDescription">
      Hover/focus triggered rich preview content with delay, hoverable content, collision-aware side
      fallback, and optional arrow.
    </p>

    <div :class="canvasCol">
      <p class="max-w-md text-sm text-muted-foreground">
        Hover or focus
        <HoverPreviewCard :ui="hoverPreviewCardUi" arrow>
          <template #trigger="{ triggerProps }">
            <a href="#profile" v-bind="triggerProps">Ada Lovelace</a>
          </template>
          <template #content>
            <div class="grid gap-3">
              <div>
                <p class="text-sm font-semibold text-foreground">Ada Lovelace</p>
                <p class="text-xs text-muted-foreground">
                  Mathematician and early computing author.
                </p>
              </div>
              <p class="text-sm leading-relaxed text-muted-foreground">
                Preview cards can contain links, descriptions, metrics, or profile details while
                staying fully styleable.
              </p>
              <a
                href="#profile"
                class="text-sm font-medium text-primary underline underline-offset-4"
                >Open profile</a
              >
            </div>
          </template>
        </HoverPreviewCard>
        to inspect a rich preview without opening a full popover.
      </p>
      <div class="border-t border-border pt-4">
        <HoverPreviewCard
          v-model="open"
          force-mount
          aria-label="Release preview"
          side="top"
          :open-delay="0"
          :ui="hoverPreviewCardUi"
        >
          <template #trigger="{ triggerProps }">
            <button
              type="button"
              v-bind="triggerProps"
              class="text-sm font-medium text-primary underline underline-offset-4"
            >
              Interactive release preview
            </button>
          </template>
          <template #content>
            <div class="grid gap-2">
              <p class="text-sm font-semibold text-foreground">0.0.4-alpha</p>
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View changes
              </button>
            </div>
          </template>
        </HoverPreviewCard>
        <code :class="[codePill, 'ml-3']">open: {{ open }}</code>
      </div>
    </div>
  </section>
</template>
