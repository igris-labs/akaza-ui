<script setup lang="ts">
import type { AppLayoutProps, AppLayoutSlots } from "./index";
import { AppLayout as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { appLayoutVariants, resolveAppLayoutVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<AppLayoutProps>(), {
  as: undefined,
  mainAs: undefined,
  layout: undefined,
  scroll: undefined,
  viewport: undefined,
  stickyHeader: undefined,
  stickyFooter: undefined,
  stickySides: undefined,
  stickyLeft: undefined,
  stickyRight: undefined,
  safeArea: undefined,
  mainId: undefined,
  mainLabel: undefined,
  skipLink: undefined,
  skipLabel: undefined,
  ui: undefined,
});
defineSlots<AppLayoutSlots>();
const attrs = useAttrs();
const styles = computed(() => appLayoutVariants(resolveAppLayoutVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get main() {
    return primitive.value!.main;
  },
  get focusMain() {
    return primitive.value!.focusMain;
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
        :name="name as keyof AppLayoutSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
