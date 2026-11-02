<script setup lang="ts">
import type { FormProps, FormSlots } from "./index";
import { Form as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { formVariants, resolveFormVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<FormProps>(), {
  id: undefined,
  action: undefined,
  method: undefined,
  autocomplete: undefined,
  novalidate: undefined,
  preventDefault: undefined,
  errors: undefined,
  ui: undefined,
});
defineSlots<FormSlots>();
const attrs = useAttrs();
const styles = computed(() => formVariants(resolveFormVariants(props, uiConfig)));
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
        :name="name as keyof FormSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
