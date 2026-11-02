<script setup lang="ts">
import type { NumberFieldProps, NumberFieldSlots } from "./index";
import { NumberField as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { numberFieldVariants, resolveNumberFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<NumberFieldProps>(), {
  id: undefined,
  name: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  placeholder: undefined,
  required: undefined,
  disabled: undefined,
  readonly: undefined,
  invalid: undefined,
  stepSnapping: undefined,
  disableWheelChange: undefined,
  invertWheelChange: undefined,
  focusOnChange: undefined,
  scrubLabel: undefined,
  scrubStep: undefined,
  disableScrub: undefined,
  getValueLabel: undefined,
  ariaLabel: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<NumberFieldSlots>();
const attrs = useAttrs();
const styles = computed(() => numberFieldVariants(resolveNumberFieldVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
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
        :name="name as keyof NumberFieldSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
