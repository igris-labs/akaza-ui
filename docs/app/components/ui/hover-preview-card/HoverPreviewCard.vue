<script setup lang="ts">
import type { HoverPreviewCardProps, HoverPreviewCardSlots } from "./index";
import { HoverPreviewCard as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { hoverPreviewCardVariants, resolveHoverPreviewCardVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<HoverPreviewCardProps>(), {
  side: undefined,
  align: undefined,
  sideOffset: 4,
  openDelay: undefined,
  closeDelay: undefined,
  disabled: undefined,
  forceMount: undefined,
  openOnClick: undefined,
  arrow: undefined,
  ariaLabel: undefined,
  teleport: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<HoverPreviewCardSlots>();
const attrs = useAttrs();
const styles = computed(() =>
  hoverPreviewCardVariants(resolveHoverPreviewCardVariants(props, uiConfig)),
);
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
</script>
<template>
  <component
    :is="Primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof HoverPreviewCardSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
