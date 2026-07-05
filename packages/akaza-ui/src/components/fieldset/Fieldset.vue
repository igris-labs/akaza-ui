<script setup lang="ts">
import type { FieldsetProps } from ".";
import { computed, useId, useSlots } from "vue";

const {
  legend,
  description,
  disabled = false,
  invalid = false,
  ui,
} = defineProps<FieldsetProps>();

const slots = useSlots();
const autoId = useId();
const descriptionId = `akaza-fieldset-description-${autoId}`;
const hasLegend = computed(() => !!(legend || slots.legend));
const hasDescription = computed(() => !!(description || slots.description));
</script>

<template>
  <fieldset
    :disabled="disabled"
    :aria-describedby="hasDescription ? descriptionId : undefined"
    :aria-invalid="invalid || undefined"
    :class="ui?.root"
    :data-disabled="disabled || undefined"
    :data-invalid="invalid || undefined"
    :data-akaza-invalid="invalid || undefined"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-fieldset"
  >
    <legend
      v-if="hasLegend"
      :class="ui?.legend"
      class="akaza-fieldset-legend"
    >
      <slot name="legend">{{ legend }}</slot>
    </legend>

    <p
      v-if="hasDescription"
      :id="descriptionId"
      :class="ui?.description"
      class="akaza-fieldset-description"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <div :class="ui?.content" class="akaza-fieldset-content">
      <slot />
    </div>
  </fieldset>
</template>

<style>
.akaza-fieldset {
  border: 0;
  min-inline-size: 0;
  padding: 0;
}
</style>
