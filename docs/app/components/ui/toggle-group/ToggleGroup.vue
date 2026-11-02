<script setup lang="ts">
import type { ToggleGroupProps, ToggleGroupSlots } from "./index";
import { ToggleGroup as Primitive } from "akaza-ui";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useTemplateRef,
} from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveToggleGroupVariants, toggleGroupVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<ToggleGroupProps>(), {
  type: undefined,
  valueKey: undefined,
  labelKey: undefined,
  descriptionKey: undefined,
  disabledKey: undefined,
  disabled: undefined,
  required: undefined,
  name: undefined,
  orientation: undefined,
  loop: undefined,
  rovingFocus: undefined,
  allowEmpty: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<ToggleGroupSlots>();
const attrs = useAttrs();
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
const root = shallowRef<HTMLElement>();
const marker = ref<{ left: number; top: number; width: number; height: number } | null>(null);
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
function measureIndicator() {
  const element = root.value;
  if (!element) return;
  const items = element.querySelectorAll<HTMLElement>(":scope > .akaza-toggle-group-item");
  for (const item of items) resizeObserver?.observe(item);
  const selected =
    element.dataset.akazaType === "multiple"
      ? undefined
      : element.querySelector<HTMLElement>(
          ':scope > .akaza-toggle-group-item[aria-pressed="true"]',
        );
  const next = selected
    ? {
        left: selected.offsetLeft,
        top: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      }
    : null;
  if (JSON.stringify(next) !== JSON.stringify(marker.value)) marker.value = next;
}
onMounted(() => {
  root.value = primitive.value?.$el;
  if (!root.value) return;
  resizeObserver = new ResizeObserver(measureIndicator);
  resizeObserver.observe(root.value);
  mutationObserver = new MutationObserver(measureIndicator);
  mutationObserver.observe(root.value, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-pressed", "data-akaza-type", "data-akaza-orientation"],
  });
  measureIndicator();
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
});
const styles = computed(() => toggleGroupVariants(resolveToggleGroupVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(
        style(),
        part === "item" && marker.value
          ? "data-[akaza-state=on]:border-transparent data-[akaza-state=on]:bg-none data-[akaza-state=on]:shadow-none data-[akaza-state=on]:hover:bg-transparent"
          : undefined,
        overrides?.[part],
        part === "root" ? props.class : undefined,
      ),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return native;
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
        :name="name as keyof ToggleGroupSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
  <Teleport
    v-if="root && marker"
    :to="root"
  >
    <span
      aria-hidden="true"
      data-toggle-group-indicator
      :class="mergedUi.indicator"
      :style="{
        transform: `translate(${marker.left}px, ${marker.top}px)`,
        width: `${marker.width}px`,
        height: `${marker.height}px`,
      }"
    />
  </Teleport>
</template>
