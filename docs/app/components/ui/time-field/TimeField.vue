<script setup lang="ts">
import type { TimeFieldProps, TimeFieldSlots } from "./index";
import { TimeField as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveTimeFieldVariants, timeFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<TimeFieldProps>(), {
  id: undefined,
  name: undefined,
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
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<TimeFieldSlots>();
const attrs = useAttrs();
const styles = computed(() => timeFieldVariants(resolveTimeFieldVariants(props, uiConfig)));
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
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get validationState() {
    return primitive.value!.validationState;
  },
  get clear() {
    return primitive.value!.clear;
  },
  get focus() {
    return primitive.value!.focus;
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
        :name="name as keyof TimeFieldSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
