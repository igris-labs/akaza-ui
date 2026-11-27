<script setup lang="ts">
import { HoverPreviewCard } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  codePill,
  hoverPreviewCardUi,
  eventEntry,
  eventLog as eventLogClass,
  sectionDescription,
  sectionTitle,
} from "../styles";

const open = ref(false);
const blockEscape = ref(false);
const eventLog = ref<string[]>([]);

function onOpenChange(next: boolean, details: AkazaChangeEventDetails) {
  if (!next && details.reason === "escape" && blockEscape.value) details.cancel();
  eventLog.value = [`${next ? "opened" : "closed"}: ${details.reason}${!next && details.reason === "escape" && blockEscape.value ? " (blocked)" : ""}`, ...eventLog.value].slice(0, 5);
}
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
          @open-change="onOpenChange"
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
          <template #content="{ close }">
            <div class="grid gap-2">
              <p class="text-sm font-semibold text-foreground">0.0.11-alpha</p>
              <button
                type="button"
                class="rounded-md border border-border px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View changes
              </button>
              <button
                type="button"
                class="text-xs text-primary underline underline-offset-4"
                @click="close('done', $event)"
              >Close preview</button>
            </div>
          </template>
        </HoverPreviewCard>
        <code :class="[codePill, 'ml-3']">open: {{ open }}</code>
        <label class="mt-3 flex items-center gap-2 text-xs text-foreground">
          <input v-model="blockEscape" type="checkbox">
          Block Escape close
        </label>
        <div v-if="eventLog.length" :class="eventLogClass">
          <code v-for="(entry, index) in eventLog" :key="index" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
