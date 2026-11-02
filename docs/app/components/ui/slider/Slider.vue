<script setup lang="ts">
import type { SliderProps, SliderSlots } from "./index";
import { Slider as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveSliderVariants, sliderVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<SliderProps>(), {
  id: undefined,
  name: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  orientation: undefined,
  minStepsBetweenThumbs: undefined,
  inverted: undefined,
  thumbAlignment: undefined,
  required: undefined,
  disabled: undefined,
  invalid: undefined,
  ariaLabel: undefined,
  ariaLabels: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  getValueLabel: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<SliderSlots>();
const attrs = useAttrs();
const styles = computed(() => sliderVariants(resolveSliderVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, ...native } = props;
  return native;
});
</script>
<template>
  <component
    :is="Primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof SliderSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
