<script setup lang="ts">
import type { TimeRangeFieldProps, TimeRangeFieldSlots } from "./index";
import { TimeRangeField as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn, mergeRecipeSlots } from "../../../utils/ui";
import { timeFieldVariants } from "../time-field";
import uiConfig from "../ui.config";
import { resolveTimeRangeFieldVariants, timeRangeFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<TimeRangeFieldProps>(), {
  id: undefined,
  name: undefined,
  startName: undefined,
  endName: undefined,
  locale: undefined,
  dir: undefined,
  placeholder: undefined,
  minValue: undefined,
  maxValue: undefined,
  isTimeUnavailable: undefined,
  granularity: undefined,
  hourCycle: undefined,
  hideTimeZone: undefined,
  step: undefined,
  stepSnapping: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  selectOnFocus: undefined,
  autoAdvance: undefined,
  startLabel: undefined,
  endLabel: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<TimeRangeFieldSlots>();
const attrs = useAttrs();
const resolved = computed(() => resolveTimeRangeFieldVariants(props, uiConfig));
const styles = computed(() => timeRangeFieldVariants(resolved.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  const flat = Object.fromEntries(
    Object.entries(styles.value)
      .filter(([part]) => !["startField", "endField"].includes(part))
      .map(([part, style]) => [
        part,
        cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
      ]),
  );
  return {
    ...flat,
    startField: mergeRecipeSlots(
      timeFieldVariants({ size: resolved.value.size }),
      props.ui?.startField,
    ),
    endField: mergeRecipeSlots(
      timeFieldVariants({ size: resolved.value.size }),
      props.ui?.endField,
    ),
  };
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
  get focusEnd() {
    return primitive.value!.focusEnd;
  },
  get focusStart() {
    return primitive.value!.focusStart;
  },
  get setValue() {
    return primitive.value!.setValue;
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
        :name="name as keyof TimeRangeFieldSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
