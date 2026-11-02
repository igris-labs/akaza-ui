<script setup lang="ts">
import type { MonthPickerProps, MonthPickerSlots } from "./index";
import { MonthPicker as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { monthPickerVariants, resolveMonthPickerVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<MonthPickerProps>(), {
  locale: undefined,
  dir: undefined,
  calendarLabel: undefined,
  columns: undefined,
  multiple: undefined,
  preventDeselect: undefined,
  disabled: undefined,
  readOnly: undefined,
  initialFocus: undefined,
  minValue: undefined,
  maxValue: undefined,
  isMonthDisabled: undefined,
  isMonthUnavailable: undefined,
  nextPage: undefined,
  prevPage: undefined,
  ui: undefined,
  modelValue: undefined,
  placeholder: undefined,
});
defineSlots<MonthPickerSlots>();
const attrs = useAttrs();
const styles = computed(() => monthPickerVariants(resolveMonthPickerVariants(props, uiConfig)));
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
  get focusValue() {
    return primitive.value!.focusValue;
  },
  get nextPage() {
    return primitive.value!.nextPage;
  },
  get previousPage() {
    return primitive.value!.previousPage;
  },
  get selectValue() {
    return primitive.value!.selectValue;
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
        :name="name as keyof MonthPickerSlots"
        v-bind="scope ?? {}"
      />
    </template>
    <template
      v-if="!$slots.previous"
      #previous
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m15 5-7 7 7 7" />
      </svg>
    </template>
    <template
      v-if="!$slots.next"
      #next
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </template>
  </component>
</template>
