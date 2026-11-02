<script setup lang="ts">
import type { DrawerProps, DrawerSlots } from "./index";
import { Drawer as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { drawerVariants, resolveDrawerVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<DrawerProps>(), {
  as: undefined,
  title: undefined,
  description: undefined,
  ariaLabel: undefined,
  side: undefined,
  inset: undefined,
  closeOnBackdropClick: undefined,
  swipeToClose: undefined,
  teleport: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<DrawerSlots>();
const attrs = useAttrs();
const styles = computed(() => drawerVariants(resolveDrawerVariants(props, uiConfig)));
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
        :name="name as keyof DrawerSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
