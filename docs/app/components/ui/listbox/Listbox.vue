<script setup lang="ts">
import type { ListboxProps, ListboxSlots } from "./index";
import { Listbox as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { listboxVariants, resolveListboxVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<ListboxProps>(), {
  valueKey: undefined,
  labelKey: undefined,
  descriptionKey: undefined,
  disabledKey: undefined,
  multiple: undefined,
  nullableValue: undefined,
  by: undefined,
  serializeValue: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  autoFocus: undefined,
  loop: undefined,
  orientation: undefined,
  dir: undefined,
  selectionBehavior: undefined,
  filterable: undefined,
  filter: undefined,
  filterPlaceholder: undefined,
  emptyLabel: undefined,
  highlightOnHover: undefined,
  virtualize: undefined,
  virtualItemHeight: undefined,
  virtualHeight: undefined,
  overscan: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
  search: undefined,
});
defineSlots<ListboxSlots>();
const attrs = useAttrs();
const styles = computed(() => listboxVariants(resolveListboxVariants(props, uiConfig)));
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
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get clear() {
    return primitive.value!.clear;
  },
  get focus() {
    return primitive.value!.focus;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof ListboxSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
