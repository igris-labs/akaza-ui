<script setup lang="ts">
import type { PopoverProps, PopoverSlots } from "./index";
import { Popover as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { popoverVariants, resolvePopoverVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<PopoverProps>(), {
  side: undefined,
  align: undefined,
  sideOffset: 4,
  teleport: undefined,
  transition: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<PopoverSlots>();
const attrs = useAttrs();
const styles = computed(() => popoverVariants(resolvePopoverVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, size: _size, ...native } = props;
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
        :name="name as keyof PopoverSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
