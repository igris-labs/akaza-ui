<script setup lang="ts">
import type { SwitchProps, SwitchSlots } from "./index";
import { Switch as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveSwitchVariants, switchVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  trueValue: undefined,
  falseValue: undefined,
  label: undefined,
  description: undefined,
  ariaLabel: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<SwitchSlots>();
const attrs = useAttrs();
const styles = computed(() => switchVariants(resolveSwitchVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "wrapper" ? props.class : undefined),
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
        :name="name as keyof SwitchSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
