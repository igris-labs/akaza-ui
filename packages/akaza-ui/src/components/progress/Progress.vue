<script setup lang="ts">
import type { ProgressProps } from ".";
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
const lower = computed(() => Number.isFinite(min) ? min : 0);
const upper = computed(() => Number.isFinite(max) && max > lower.value ? max : lower.value + 100);
const value = computed(() => model.value === null || !Number.isFinite(model.value)
  ? null
  : Math.min(upper.value, Math.max(lower.value, model.value)));

const state = computed(() => {
  if (value.value === null) return "indeterminate";
  return value.value >= upper.value ? "complete" : "loading";
});

const percentage = computed(() => {
  if (value.value === null) return null;
  return ((value.value - lower.value) / (upper.value - lower.value)) * 100;
});

const ariaValueText = computed(() => {
  if (getValueLabel) return getValueLabel(value.value, upper.value);
  return undefined;
});
</script>

<template>
  <div
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuemin="lower"
    :aria-valuemax="upper"
    :aria-valuenow="value ?? undefined"
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
        :value="value"
        :percentage="percentage"
        :max="upper"
        :min="lower"
        :state="state"
      />
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-progress-indicator {
    height: 100%;
    width: 100%;
  }
}
</style>
