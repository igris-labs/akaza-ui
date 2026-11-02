<script setup lang="ts">
import type { PinInputProps, PinInputSlots } from "./index";
import { PinInput as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { pinInputVariants, resolvePinInputVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<PinInputProps>(), {
  length: undefined,
  type: undefined,
  mask: undefined,
  otp: undefined,
  placeholder: undefined,
  allowedChars: undefined,
  selectOnFocus: undefined,
  autoFocus: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  dir: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<PinInputSlots>();
const attrs = useAttrs();
const styles = computed(() => pinInputVariants(resolvePinInputVariants(props, uiConfig)));
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
        :name="name as keyof PinInputSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
