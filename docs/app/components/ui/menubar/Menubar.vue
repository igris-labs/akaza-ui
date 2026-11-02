<script setup lang="ts">
import type { MenubarProps, MenubarSlots } from "./index";
import { Menubar as Primitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { menubarVariants, resolveMenubarVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<MenubarProps>(), {
  loop: undefined,
  dir: undefined,
  disabled: undefined,
  closeOnSelect: undefined,
  radioValues: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  teleport: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<MenubarSlots>();
const attrs = useAttrs();
const styles = computed(() => menubarVariants(resolveMenubarVariants(props, uiConfig)));
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
      v-if="!$slots.item"
      #item="{ item, hasSubmenu }"
    >
      <span :class="mergedUi.itemLabel">{{ item.label }}</span>
      <svg
        v-if="hasSubmenu"
        :class="mergedUi.submenuIndicator"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </template>
    <template
      v-if="!$slots['checkbox-item']"
      #checkbox-item="{ item, checked }"
    >
      <span :class="mergedUi.itemLabel">{{ item.label }}</span>
      <svg
        :class="[mergedUi.indicator, checked ? 'opacity-100' : 'opacity-0']"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </template>
    <template
      v-if="!$slots['radio-item']"
      #radio-item="{ item, checked }"
    >
      <span :class="mergedUi.itemLabel">{{ item.label }}</span>
      <svg
        :class="[mergedUi.indicator, checked ? 'opacity-100' : 'opacity-0']"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof MenubarSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
