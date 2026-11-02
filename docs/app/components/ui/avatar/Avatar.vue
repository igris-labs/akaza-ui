<script setup lang="ts">
import type { AvatarProps, AvatarSlots } from "./index";
import { Avatar as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { avatarVariants, resolveAvatarVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<AvatarProps>(), {
  as: undefined,
  src: undefined,
  alt: undefined,
  text: undefined,
  delayMs: undefined,
  ui: undefined,
});
defineSlots<AvatarSlots>();
const attrs = useAttrs();
const styles = computed(() => avatarVariants(resolveAvatarVariants(props, uiConfig)));
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
        :name="name as keyof AvatarSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
