<script setup lang="ts">
import type { CollapsibleProps, CollapsibleSlots } from "./index";
import { Collapsible as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { collapsibleVariants, resolveCollapsibleVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<CollapsibleProps>(), {
  as: undefined,
  disabled: undefined,
  unmountOnHide: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<CollapsibleSlots>();
const attrs = useAttrs();
const styles = computed(() => collapsibleVariants(resolveCollapsibleVariants(props, uiConfig)));
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
        :name="name as keyof CollapsibleSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
