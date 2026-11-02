<script setup lang="ts">
import type { ComboboxProps, ComboboxSlots } from "./index";
import { Combobox as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { comboboxVariants, resolveComboboxVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<ComboboxProps>(), {
  valueKey: undefined,
  labelKey: undefined,
  descriptionKey: undefined,
  disabledKey: undefined,
  placeholder: undefined,
  multiple: undefined,
  nullableValue: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  loop: undefined,
  filterable: undefined,
  filter: undefined,
  isEqual: undefined,
  serializeValue: undefined,
  loading: undefined,
  emptyLabel: undefined,
  resetSearchOnBlur: undefined,
  resetSearchOnSelect: undefined,
  openOnFocus: undefined,
  openOnClick: undefined,
  openOnInput: undefined,
  clearable: undefined,
  creatable: undefined,
  createLabel: undefined,
  highlightOnHover: undefined,
  side: undefined,
  align: undefined,
  sideOffset: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
  open: undefined,
  search: undefined,
});
defineSlots<ComboboxSlots>();
const attrs = useAttrs();
const styles = computed(() => comboboxVariants(resolveComboboxVariants(props, uiConfig)));
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
        :name="name as keyof ComboboxSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
