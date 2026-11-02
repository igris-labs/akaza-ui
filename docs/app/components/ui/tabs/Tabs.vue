<script setup lang="ts">
import type { TabsProps, TabsSlots } from "./index";
import { Tabs as Primitive } from "akaza-ui";

import { computed, onBeforeUnmount, onMounted, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveTabsVariants, tabsVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<TabsProps>(), {
  orientation: undefined,
  activationMode: undefined,
  unmountOnHide: undefined,
  ariaLabel: undefined,
  labelKey: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<TabsSlots>();
const attrs = useAttrs();
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
let shown: HTMLElement | undefined;
let target: HTMLElement | undefined;
let animation: Animation | undefined;
let generation = 0;
let reducedMotion: MediaQueryList | undefined;
function getPanels() {
  return Array.from(
    primitive.value?.$el?.querySelectorAll<HTMLElement>(
      ":scope > .akaza-tab-panels > .akaza-tab-panel",
    ) ?? [],
  );
}
function settlePanels() {
  generation++;
  animation?.cancel();
  animation = undefined;
  for (const panel of getPanels()) panel.style.removeProperty("visibility");
  shown = target;
}
function motionTarget(panel: HTMLElement) {
  // Keep code surfaces, borders, and headers opaque while their text changes.
  return (
    panel.querySelector<HTMLElement>(
      ":scope > [data-tab-motion], :scope > * > [data-tab-motion]",
    ) ?? panel
  );
}
async function changePanel(next: HTMLElement, panels: HTMLElement[]) {
  const currentContent = shown ? motionTarget(shown) : undefined;
  const opacity = currentContent ? Number(getComputedStyle(currentContent).opacity) : 1;
  const translate = currentContent ? getComputedStyle(currentContent).translate : "none";
  const turn = ++generation;
  animation?.cancel();
  // Native selection owns semantics; only one panel paints during the visual handoff.
  for (const panel of panels) panel.style.visibility = panel === shown ? "visible" : "hidden";
  const easing = getComputedStyle(next).getPropertyValue("--ease-interaction").trim() || "ease-out";
  try {
    if (shown && shown !== next) {
      animation = motionTarget(shown).animate([{ opacity }, { opacity: 0 }], {
        duration: 60 * opacity,
        easing: "ease-out",
        fill: "forwards",
      });
      await animation.finished;
      if (turn !== generation) return;
      shown.style.visibility = "hidden";
      animation.cancel();
    }
    const returning = shown === next;
    shown = next;
    next.style.visibility = "visible";
    animation = motionTarget(next).animate(
      [
        { opacity: returning ? opacity : 0, translate: returning ? translate : "4px 0" },
        { opacity: 1, translate: "0px 0" },
      ],
      { duration: 140, easing, fill: "forwards" },
    );
    await animation.finished;
    if (turn === generation) settlePanels();
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
  }
}
function syncPanels() {
  const panels = getPanels();
  const next = panels.find((panel) => panel.dataset.akazaState === "active");
  for (const panel of panels) {
    const inactive = panel !== next;
    panel.inert = inactive;
    panel.setAttribute("aria-hidden", String(inactive));
  }
  if (next === target) return;
  target = next;
  if (!next || !shown?.isConnected || reducedMotion?.matches) {
    settlePanels();
    return;
  }
  void changePanel(next, panels);
}
function onMotionChange() {
  if (reducedMotion?.matches) settlePanels();
}
onMounted(() => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.addEventListener("change", onMotionChange);
});
onBeforeUnmount(() => {
  generation++;
  animation?.cancel();
  reducedMotion?.removeEventListener("change", onMotionChange);
});

const styles = computed(() => tabsVariants(resolveTabsVariants(props, uiConfig)));
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
    @vue:mounted="syncPanels"
    @vue:updated="syncPanels"
  >
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof TabsSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
