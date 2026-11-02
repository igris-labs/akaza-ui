<script setup lang="ts">
import type { AlertDialogProps, AlertDialogSlots } from "./index";
import { AlertDialog as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { alertDialogVariants, resolveAlertDialogVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<AlertDialogProps>(), {
  as: undefined,
  teleport: undefined,
  transition: undefined,
  duration: undefined,
  title: undefined,
  ariaLabel: undefined,
  description: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<AlertDialogSlots>();
const attrs = useAttrs();
const styles = computed(() => alertDialogVariants(resolveAlertDialogVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "content" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, width: _width, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get open() {
    return primitive.value!.open;
  },
  get close() {
    return primitive.value!.close;
  },
  get toggle() {
    return primitive.value!.toggle;
  },
  get titleId() {
    return primitive.value!.titleId;
  },
  get descriptionId() {
    return primitive.value!.descriptionId;
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
        :name="name as keyof AlertDialogSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
