<script setup lang="ts">
import type { ProgressOrientation, ProgressProps } from ".";
import { computed } from "vue";

const {
  min = 0,
  max = 100,
  orientation = "horizontal",
  ariaLabel,
  getValueLabel,
  ui,
} = defineProps<ProgressProps>();

const model = defineModel<number | null>({ default: null });

const state = computed(() => {
  if (model.value === null) return "indeterminate";
  return model.value >= max ? "complete" : "loading";
});

const percentage = computed(() => {
  if (model.value === null) return null;
  const range = max - min;
  if (range <= 0) return 0;
  return Math.min(100, Math.max(0, ((model.value - min) / range) * 100));
});

const ariaValueText = computed(() => {
  if (getValueLabel) return getValueLabel(model.value, max);
  return undefined;
});
</script>

<template>
  <div
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="model ?? undefined"
    :aria-valuetext="ariaValueText"
    :class="ui?.root"
    :data-akaza-state="state"
    :data-akaza-orientation="orientation"
    :style="percentage !== null ? { '--akaza-progress-percentage': `${percentage}%` } : {}"
    class="akaza-progress"
  >
    <div
      :class="ui?.indicator"
      :data-akaza-state="state"
      class="akaza-progress-indicator"
    >
      <slot
        name="indicator"
        :value="model"
        :percentage="percentage"
        :max="max"
        :min="min"
        :state="state"
      />
    </div>
  </div>
</template>

<style>
.akaza-progress-indicator {
  height: 100%;
  width: 100%;
}
</style>
