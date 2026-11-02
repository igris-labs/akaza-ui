<script setup lang="ts">
import type { MenuProps, MenuSlots } from "./index";
import { Menu as Primitive } from "akaza-ui";

import { computed, nextTick, onMounted, useAttrs, useId, useTemplateRef, watch } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { menuVariants, resolveMenuVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<MenuProps>(), {
  dir: undefined,
  as: undefined,
  items: undefined,
  side: undefined,
  align: undefined,
  sideOffset: undefined,
  closeOnSelect: undefined,
  radioValues: undefined,
  teleport: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<MenuSlots>();
const attrs = useAttrs();
const contentClass = `ipex-menu-content-${useId().replaceAll(":", "")}`;
const styles = computed(() => menuVariants(resolveMenuVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(
        style(),
        overrides?.[part],
        part === "root" ? props.class : undefined,
        part === "content" ? contentClass : undefined,
      ),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
// Akaza has no initial-highlight option; focus the panel after its opening autofocus.
async function clearInitialHighlight() {
  await nextTick();
  await nextTick();
  await nextTick();
  const content = document.getElementsByClassName(contentClass)[0];
  const panel = content?.querySelector<HTMLElement>('[role="menu"]');
  if (!panel || content?.getAttribute("data-akaza-state") === "closed") return;
  panel.querySelectorAll<HTMLElement>("[data-akaza-highlighted]").forEach((item) => {
    item.removeAttribute("data-akaza-highlighted");
    item.tabIndex = -1;
  });
  panel.tabIndex = -1;
  panel.focus({ preventScroll: true });
}
let keyboardOpening = false;
function onOpenChange(open: boolean, details: { event?: Event }) {
  const event = details.event;
  const keyboard =
    event instanceof KeyboardEvent || (event instanceof MouseEvent && event.detail === 0);
  keyboardOpening = open && keyboard;
  if (open && !keyboard) void clearInitialHighlight();
}
watch(
  () => props.modelValue,
  (open) => {
    if (open && !keyboardOpening) void clearInitialHighlight();
  },
);
onMounted(() => {
  if (props.modelValue) void clearInitialHighlight();
});

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
    @open-change="onOpenChange"
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
        :name="name as keyof MenuSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
