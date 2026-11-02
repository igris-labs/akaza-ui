<script setup lang="ts">
import type { SelectProps, SelectSlots } from "./index";
import { Select as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveSelectVariants, selectVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<SelectProps>(), {
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
  invalid: undefined,
  loop: undefined,
  autocomplete: undefined,
  filter: undefined,
  loading: undefined,
  emptyLabel: undefined,
  searchPlaceholder: undefined,
  resetSearchOnSelect: undefined,
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
defineSlots<SelectSlots>();
const attrs = useAttrs();
const styles = computed(() => selectVariants(resolveSelectVariants(props, uiConfig)));
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
      v-if="!$slots.trigger"
      #trigger="scope"
    >
      <span
        v-if="scope.selectedLabel"
        :class="mergedUi.value"
        class="akaza-select-value"
      >
        <slot
          name="value"
          :option="scope.selectedOption"
          :options="scope.selectedOptions"
          :value="scope.selectedValue"
          :values="scope.selectedValues"
          :label="scope.selectedLabel"
        >{{ scope.selectedLabel }}</slot>
      </span>
      <span
        v-else
        :class="mergedUi.placeholder"
        class="akaza-select-placeholder"
      >{{ scope.placeholder }}</span>
      <svg
        :class="mergedUi.icon"
        class="akaza-select-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof SelectSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
