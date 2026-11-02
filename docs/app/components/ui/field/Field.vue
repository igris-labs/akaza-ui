<script setup lang="ts">
import type { FieldProps, FieldSlots } from "./index";
import { Field as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { fieldVariants, resolveFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<FieldProps>(), {
  as: undefined,
  id: undefined,
  name: undefined,
  label: undefined,
  description: undefined,
  error: undefined,
  errorMatch: undefined,
  required: undefined,
  disabled: undefined,
  invalid: undefined,
  dirty: undefined,
  touched: undefined,
  filled: undefined,
  focused: undefined,
  ui: undefined,
});
defineSlots<FieldSlots>();
const attrs = useAttrs();
const styles = computed(() => fieldVariants(resolveFieldVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, ...native } = props;
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
        :name="name as keyof FieldSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
