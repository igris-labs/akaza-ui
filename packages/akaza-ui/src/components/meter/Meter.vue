<script setup lang="ts">
import type { MeterProps } from ".";
import { computed, useId } from "vue";

const {
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  ariaLabel,
  ariaLabelledby,
  ariaValueText,
  locale,
  formatOptions,
  getAriaValueText,
  getValueLabel,
  ui,
} = defineProps<MeterProps>();

const autoId = useId();
const labelId = `akaza-meter-label-${autoId}`;
const range = computed(() => max - min);
const clampedValue = computed(() => Math.min(max, Math.max(min, value)));
const percentage = computed(() => {
  if (range.value <= 0) return 0;
  return Math.min(100, Math.max(0, ((clampedValue.value - min) / range.value) * 100));
});
const formatter = computed(() => new Intl.NumberFormat(locale, formatOptions));
const formattedValue = computed(() => formatter.value.format(clampedValue.value));
const computedValueText = computed(() =>
  ariaValueText
  ?? getAriaValueText?.(clampedValue.value, max, min)
  ?? getValueLabel?.(formattedValue.value, clampedValue.value),
);
const state = computed(() => {
  const region = (amount: number) => low !== undefined && amount < low ? "low" : high !== undefined && amount > high ? "high" : "normal";
  const current = region(clampedValue.value);
  return optimum !== undefined && region(optimum) === current ? "optimum" : current;
});
const rootStyle = computed(() => ({
  "--akaza-meter-percentage": `${percentage.value}%`,
}));
</script>

<template>
  <div
    role="meter"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby ?? (label || $slots.label ? labelId : undefined)"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="clampedValue"
    :aria-valuetext="computedValueText"
    :data-akaza-state="state"
    :style="rootStyle"
    :class="ui?.root"
    class="akaza-meter"
  >
    <span
      v-if="label || $slots.label"
      :id="labelId"
      :class="ui?.label"
      class="akaza-meter-label"
    >
      <slot name="label" :value="clampedValue" :formatted-value="formattedValue" :state="state">
        {{ label }}
      </slot>
    </span>

    <span :class="ui?.value" class="akaza-meter-value">
      <slot name="value" :value="clampedValue" :formatted-value="formattedValue" :percentage="percentage" :state="state">
        {{ formattedValue }}
      </slot>
    </span>

    <span :class="ui?.track" class="akaza-meter-track">
      <span
        :class="ui?.indicator"
        :data-akaza-state="state"
        class="akaza-meter-indicator"
      >
        <slot name="indicator" :value="clampedValue" :percentage="percentage" :state="state" />
      </span>
    </span>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-meter-track {
    display: block;
    overflow: hidden;
  }

  .akaza-meter-indicator {
    display: block;
    width: var(--akaza-meter-percentage);
    height: 100%;
  }
}
</style>
