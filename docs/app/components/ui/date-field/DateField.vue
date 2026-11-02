<script setup lang="ts">
import type { DateFieldProps, DateFieldSlots } from "./index";
import { DateField as Primitive } from "akaza-ui";

import { computed, nextTick, useAttrs, useTemplateRef } from "vue";
import { cn, mergeRecipeSlots } from "../../../utils/ui";
import { calendarVariants } from "../calendar";
import uiConfig from "../ui.config";
import { dateFieldVariants, resolveDateFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<DateFieldProps>(), {
  id: undefined,
  name: undefined,
  locale: undefined,
  dir: undefined,
  placeholder: undefined,
  minValue: undefined,
  maxValue: undefined,
  isDateUnavailable: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  selectOnFocus: undefined,
  autoAdvance: undefined,
  showCalendar: true,
  calendarLabel: undefined,
  calendarSide: undefined,
  calendarAlign: undefined,
  calendarSideOffset: undefined,
  calendarTeleport: "body",
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
  calendarOpen: undefined,
});
defineSlots<DateFieldSlots>();
const attrs = useAttrs();
const resolved = computed(() => resolveDateFieldVariants(props, uiConfig));
const styles = computed(() => dateFieldVariants(resolved.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  const flat = Object.fromEntries(
    Object.entries(styles.value)
      .filter(([part]) => !["calendar"].includes(part))
      .map(([part, style]) => [
        part,
        cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
      ]),
  );
  return {
    ...flat,
    calendar: mergeRecipeSlots(calendarVariants({ size: resolved.value.size }), {
      ...props.ui?.calendar,
      root: cn(styles.value.calendar(), props.ui?.calendar?.root),
    }),
  };
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
async function onFieldClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (
    props.showCalendar &&
    !props.disabled &&
    !props.readOnly &&
    target.closest(".akaza-date-field-segments")
  ) {
    primitive.value?.openCalendar(event);
    // Calendar initial focus belongs to its button; clicking a segment must keep typing focus.
    await nextTick();
    await nextTick();
    target.focus({ preventScroll: true });
  }
}

defineExpose({
  get validationState() {
    return primitive.value!.validationState;
  },
  get clear() {
    return primitive.value!.clear;
  },
  get closeCalendar() {
    return primitive.value!.closeCalendar;
  },
  get focus() {
    return primitive.value!.focus;
  },
  get openCalendar() {
    return primitive.value!.openCalendar;
  },
  get setValue() {
    return primitive.value!.setValue;
  },
  get toggleCalendar() {
    return primitive.value!.toggleCalendar;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
    @click="onFieldClick"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof DateFieldSlots"
        v-bind="scope ?? {}"
      />
    </template>
    <template
      v-if="!$slots['calendar-trigger']"
      #calendar-trigger
    >
      <svg
        class="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path
          d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        />
      </svg>
    </template>
  </component>
</template>
