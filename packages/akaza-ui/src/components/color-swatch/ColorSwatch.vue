<script setup lang="ts">
import type { ColorSwatchProps } from ".";
import { computed } from "vue";
import { parseColor, serializeColor } from "../../composables/color/engine";

const { color = "", ariaLabel, decorative = false, ui } = defineProps<ColorSwatchProps>();
const parsed = computed(() => parseColor(color));
const cssColor = computed(() => serializeColor(parsed.value, "oklch"));
</script>

<template>
  <span
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : (ariaLabel ?? (parsed ? color : 'No color'))"
    :aria-hidden="decorative || undefined"
    :data-akaza-empty="!parsed || undefined"
    :style="{
      backgroundColor: cssColor || 'transparent',
      '--akaza-color': cssColor || 'transparent',
    }"
    :class="ui?.root"
    class="akaza-color-swatch"
  ><slot
    :color="color"
    :css-color="cssColor"
    :is-empty="!parsed"
  /></span>
</template>
