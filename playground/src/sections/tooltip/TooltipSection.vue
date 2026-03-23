<script setup lang="ts">
import { ref } from "vue";
import { Tooltip } from "akaza-ui";

const disabled = ref(false);
</script>

<template>
  <section id="tooltip">
    <h2 class="text-lg font-semibold mb-1">Tooltip</h2>
    <p class="text-sm mb-6 text-muted-foreground">Hover or focus to reveal additional context.</p>

    <!-- Directions -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Directions</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent mb-6">
      <Tooltip :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Top (default)</button>
        </template>
        <template #content>Appears above</template>
      </Tooltip>

      <Tooltip direction="bottom" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Bottom</button>
        </template>
        <template #content>Appears below</template>
      </Tooltip>

      <Tooltip direction="right" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Right</button>
        </template>
        <template #content>Appears to the right</template>
      </Tooltip>

      <Tooltip direction="left" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Left</button>
        </template>
        <template #content>Appears to the left</template>
      </Tooltip>
    </div>

    <!-- Arrow -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Arrow</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent mb-6">
      <Tooltip arrow :ui="{ content: 'tt-content tt-content--arrow' }">
        <template #trigger>
          <button class="tt-btn">With arrow (top)</button>
        </template>
        <template #content>Tooltip with arrow</template>
      </Tooltip>

      <Tooltip arrow direction="bottom" :ui="{ content: 'tt-content tt-content--arrow' }">
        <template #trigger>
          <button class="tt-btn">With arrow (bottom)</button>
        </template>
        <template #content>Tooltip with arrow</template>
      </Tooltip>
    </div>

    <!-- Delay -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Custom delay</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent mb-6">
      <Tooltip :delay-duration="0" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Instant (0ms)</button>
        </template>
        <template #content>No delay</template>
      </Tooltip>

      <Tooltip :delay-duration="800" :close-delay="300" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Slow open + close delay</button>
        </template>
        <template #content>800ms open · 300ms close</template>
      </Tooltip>
    </div>

    <!-- Disabled -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Disabled</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent mb-6">
      <Tooltip :disabled="disabled" :ui="{ content: 'tt-content' }">
        <template #trigger>
          <button class="tt-btn">Hover me</button>
        </template>
        <template #content>Tooltip is active</template>
      </Tooltip>
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="disabled" />
        Disable tooltip
      </label>
    </div>
  </section>
</template>

<style>
.tt-btn {
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--background);
  border: 1px solid var(--border);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--foreground);
  cursor: pointer;
}
.tt-btn:hover {
  background: color-mix(in oklch, var(--muted-foreground) 15%, var(--background));
}

.tt-content {
  position: fixed;
  z-index: 9999;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--foreground);
  color: var(--background);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}

.tt-content--arrow {
  overflow: visible;
}

.tt-content--arrow .akaza-tooltip-arrow {
  background: var(--foreground);
}
</style>
