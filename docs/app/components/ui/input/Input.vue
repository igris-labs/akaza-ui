<script setup lang="ts">
import type { InputProps, InputSlots } from "./index";
import { Input as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { inputVariants, resolveInputVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<InputProps>(), {
  id: undefined,
  name: undefined,
  type: undefined,
  placeholder: undefined,
  autocomplete: undefined,
  inputmode: undefined,
  minlength: undefined,
  maxlength: undefined,
  pattern: undefined,
  required: undefined,
  disabled: undefined,
  readonly: undefined,
  invalid: undefined,
  ariaLabel: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<InputSlots>();
const attrs = useAttrs();
const styles = computed(() => inputVariants(resolveInputVariants(props, uiConfig)));
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
        :name="name as keyof InputSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
