<script setup lang="ts">
import { ref } from "vue";
import { Tooltip } from "akaza-ui";
import {
  buttonGhost,
  canvasRow,
  sectionDescriptionTight,
  sectionTitle,
  tooltipContent,
} from "../styles";

const disabled = ref(false);
</script>

<template>
  <section id="tooltip">
    <h2 :class="sectionTitle">Tooltip</h2>
    <p :class="sectionDescriptionTight">Hover or focus to reveal additional context.</p>

    <!-- Directions -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Directions</p>
    <div :class="[canvasRow, 'mb-6 gap-6']">
      <Tooltip :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Top (default)</button>
        </template>
        <template #content>Appears above</template>
      </Tooltip>

      <Tooltip direction="bottom" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Bottom</button>
        </template>
        <template #content>Appears below</template>
      </Tooltip>

      <Tooltip direction="right" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Right</button>
        </template>
        <template #content>Appears to the right</template>
      </Tooltip>

      <Tooltip direction="left" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Left</button>
        </template>
        <template #content>Appears to the left</template>
      </Tooltip>
    </div>

    <!-- Arrow -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Arrow</p>
    <div :class="[canvasRow, 'mb-6 gap-6']">
      <Tooltip arrow :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">With arrow (top)</button>
        </template>
        <template #content>Tooltip with arrow</template>
      </Tooltip>

      <Tooltip arrow direction="bottom" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">With arrow (bottom)</button>
        </template>
        <template #content>Tooltip with arrow</template>
      </Tooltip>
    </div>

    <!-- Delay -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Custom delay</p>
    <div :class="[canvasRow, 'mb-6 gap-6']">
      <Tooltip :delay-duration="0" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Instant (0ms)</button>
        </template>
        <template #content>No delay</template>
      </Tooltip>

      <Tooltip :delay-duration="800" :close-delay="300" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Slow open + close delay</button>
        </template>
        <template #content>800ms open · 300ms close</template>
      </Tooltip>
    </div>

    <!-- Disabled -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Disabled</p>
    <div :class="[canvasRow, 'mb-6 gap-6']">
      <Tooltip :disabled="disabled" :ui="{ content: tooltipContent }">
        <template #trigger>
          <button :class="buttonGhost">Hover me</button>
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
