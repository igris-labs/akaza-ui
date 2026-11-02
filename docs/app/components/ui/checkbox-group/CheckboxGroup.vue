<script setup lang="ts">
import type { CheckboxGroupProps, CheckboxGroupSlots } from "./index";
import { CheckboxGroup as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn, mergeRecipeSlots } from "../../../utils/ui";
import { checkboxVariants } from "../checkbox";
import uiConfig from "../ui.config";
import { checkboxGroupVariants, resolveCheckboxGroupVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  valueKey: undefined,
  labelKey: undefined,
  descriptionKey: undefined,
  disabledKey: undefined,
  allValues: undefined,
  parent: undefined,
  parentLabel: undefined,
  parentDescription: undefined,
  disabled: undefined,
  required: undefined,
  orientation: undefined,
  legend: undefined,
  name: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<CheckboxGroupSlots>();
const attrs = useAttrs();
const resolved = computed(() => resolveCheckboxGroupVariants(props, uiConfig));
const styles = computed(() => checkboxGroupVariants(resolved.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  const flat = Object.fromEntries(
    Object.entries(styles.value)
      .filter(([part]) => !["checkbox"].includes(part))
      .map(([part, style]) => [
        part,
        cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
      ]),
  );
  return {
    ...flat,
    checkbox: mergeRecipeSlots(checkboxVariants({ size: resolved.value.size }), props.ui?.checkbox),
  };
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
        :name="name as keyof CheckboxGroupSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
