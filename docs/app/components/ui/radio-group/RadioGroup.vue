<script setup lang="ts">
import type { RadioGroupProps, RadioGroupSlots } from "./index";
import { RadioGroup as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { radioGroupVariants, resolveRadioGroupVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<RadioGroupProps>(), {
  valueKey: undefined,
  labelKey: undefined,
  descriptionKey: undefined,
  disabled: undefined,
  orientation: undefined,
  as: undefined,
  legend: undefined,
  loop: undefined,
  name: undefined,
  required: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  getItemDisabled: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<RadioGroupSlots>();
const attrs = useAttrs();
const styles = computed(() => radioGroupVariants(resolveRadioGroupVariants(props, uiConfig)));
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
        :name="name as keyof RadioGroupSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
