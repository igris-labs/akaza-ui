<script setup lang="ts">
import type { CalendarProps, CalendarSlots } from "./index";
import { Calendar as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { calendarVariants, resolveCalendarVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<CalendarProps>(), {
  locale: undefined,
  dir: undefined,
  calendarLabel: undefined,
  weekStartsOn: undefined,
  weekdayFormat: undefined,
  fixedWeeks: undefined,
  numberOfMonths: undefined,
  pagedNavigation: undefined,
  preventDeselect: undefined,
  selectionMode: undefined,
  multiple: undefined,
  allowNonContiguousRanges: undefined,
  maximumDays: undefined,
  fixedDate: undefined,
  disabled: undefined,
  readOnly: undefined,
  initialFocus: undefined,
  disableDaysOutsideCurrentView: undefined,
  minValue: undefined,
  maxValue: undefined,
  isDateDisabled: undefined,
  isDateUnavailable: undefined,
  nextPage: undefined,
  prevPage: undefined,
  ui: undefined,
  modelValue: undefined,
  placeholder: undefined,
});
defineSlots<CalendarSlots>();
const attrs = useAttrs();
const styles = computed(() => calendarVariants(resolveCalendarVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, size: _size, rangeColor: _rangeColor, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get focusDate() {
    return primitive.value!.focusDate;
  },
  get nextPage() {
    return primitive.value!.nextPage;
  },
  get previousPage() {
    return primitive.value!.previousPage;
  },
  get selectDate() {
    return primitive.value!.selectDate;
  },
  get placeholder() {
    return primitive.value!.placeholder;
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
        :name="name as keyof CalendarSlots"
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
