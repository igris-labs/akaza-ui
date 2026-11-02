<script setup lang="ts">
import type { AccordionProps, AccordionSlots } from "./index";
import { Accordion as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { accordionVariants, resolveAccordionVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<AccordionProps>(), {
  valueKey: undefined,
  labelKey: undefined,
  contentKey: undefined,
  disabledKey: undefined,
  type: undefined,
  collapsible: true,
  disabled: undefined,
  orientation: undefined,
  unmountOnHide: undefined,
  as: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<AccordionSlots>();
const attrs = useAttrs();
const styles = computed(() => accordionVariants(resolveAccordionVariants(props, uiConfig)));
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
        :name="name as keyof AccordionSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
