<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import type { NavigationMenuProps, NavigationMenuSlots } from "./index";
import { NavigationMenu as Primitive } from "akaza-ui";

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { navigationMenuVariants, resolveNavigationMenuVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<NavigationMenuProps>(), {
  highlightMode: "hover",
  defaultValue: undefined,
  orientation: undefined,
  contentMode: undefined,
  collapsed: undefined,
  tooltip: undefined,
  defaultExpanded: undefined,
  loop: undefined,
  dir: undefined,
  disabled: undefined,
  openDelay: undefined,
  closeDelay: undefined,
  sideOffset: 2,
  teleport: undefined,
  ariaLabel: undefined,
  ui: undefined,
  open: undefined,
  expanded: undefined,
  modelValue: undefined,
});
const emit = defineEmits<{
  "update:open": [value: string | null];
  openChange: [value: string | null, details: AkazaChangeEventDetails];
}>();
defineSlots<NavigationMenuSlots>();
const localOpen = ref(props.open ?? null);
const openValue = computed(() => (props.open === undefined ? localOpen.value : props.open));
function updateOpen(value: string | null) {
  localOpen.value = value;
  emit("update:open", value);
  void nextTick(restoreHighlight);
}
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
let observer: ResizeObserver | undefined;
let observedList: HTMLElement | null = null;
const trackList = shallowRef<HTMLElement | null>(null);
const tracks = ref<{ top: number; height: number }[]>([]);
function isGroupHeader(control: HTMLElement) {
  return Boolean(control.querySelector("[data-sidebar-group]"));
}
function controlBounds(control: HTMLElement, list: HTMLElement) {
  const rect = control.getBoundingClientRect();
  let top = rect.top;
  let bottom = rect.bottom;
  for (
    let parent = control.parentElement;
    parent && parent !== list;
    parent = parent.parentElement
  ) {
    if (!parent.classList.contains("akaza-navigation-menu-inline-content")) continue;
    if (parent.dataset.akazaState === "closed") return null;
    const clip = parent.getBoundingClientRect();
    top = Math.max(top, clip.top);
    bottom = Math.min(bottom, clip.bottom);
  }
  return bottom > top
    ? { left: rect.left, width: rect.width, top, bottom, height: bottom - top }
    : null;
}
function updateTracks(list: HTMLElement | null) {
  if (!list || props.highlightMode !== "selection-hover") {
    trackList.value = null;
    tracks.value = [];
    return;
  }
  const sections: HTMLElement[][] = [];
  let current: HTMLElement[] = [];
  function flush() {
    if (current.length) sections.push(current);
    current = [];
  }
  function rows(item: Element) {
    return Array.from(
      item.querySelectorAll<HTMLElement>(
        ".akaza-navigation-menu-link, .akaza-navigation-menu-trigger",
      ),
    ).filter(
      (row) =>
        !isGroupHeader(row) &&
        !row.closest('.akaza-navigation-menu-inline-content[data-akaza-state="closed"]'),
    );
  }
  for (const item of list.children) {
    if (item.hasAttribute("data-nav-track")) continue;
    const group = item.querySelector<HTMLElement>(":scope > .akaza-navigation-menu-trigger");
    if (
      item.querySelector(":scope > .akaza-navigation-menu-group-label") ||
      (group && isGroupHeader(group))
    ) {
      flush();
      if (group) {
        current = rows(item);
        flush();
      }
    } else if (item.querySelector(':scope > [role="separator"]')) flush();
    else current.push(...rows(item));
  }
  flush();
  const origin = list.getBoundingClientRect().top;
  const next = sections.flatMap((section) => {
    const visible = section.map((row) => controlBounds(row, list)).filter((box) => box !== null);
    const first = visible[0];
    const last = visible.at(-1);
    return first && last
      ? [{ top: first.top - origin + list.scrollTop, height: last.bottom - first.top }]
      : [];
  });
  trackList.value = list;
  if (JSON.stringify(next) !== JSON.stringify(tracks.value)) tracks.value = next;
}
let hovered: HTMLElement | null = null;
let primaryHighlight: HTMLElement | null = null;
function navigationList(): HTMLElement | null {
  return primitive.value?.$el?.querySelector(":scope > .akaza-navigation-menu-list") ?? null;
}
function highlight(target: HTMLElement | null, prefix = "nav") {
  const list = navigationList();
  if (!list) return;
  if (target && isGroupHeader(target)) target = null;
  if (prefix === "nav") primaryHighlight = target;
  if (!target) {
    list.style.setProperty(`--${prefix}-opacity`, "0");
    return;
  }
  const bounds = list.getBoundingClientRect();
  const box = controlBounds(target, list);
  if (!box) {
    list.style.setProperty(`--${prefix}-opacity`, "0");
    return;
  }
  const radius = getComputedStyle(target).borderRadius;
  if (prefix === "nav")
    list.dataset.ipexHighlightActive = String(target.hasAttribute("data-akaza-active"));
  else list.dataset.ipexHoverActive = String(target === primaryHighlight);
  list.style.setProperty(`--${prefix}-x`, `${box.left - bounds.left + list.scrollLeft}px`);
  list.style.setProperty(`--${prefix}-y`, `${box.top - bounds.top + list.scrollTop}px`);
  list.style.setProperty(`--${prefix}-width`, `${box.width}px`);
  list.style.setProperty(`--${prefix}-height`, `${box.height}px`);
  list.style.setProperty(`--${prefix}-radius`, radius);
  list.style.setProperty(`--${prefix}-opacity`, "1");
}
function restoreHighlight() {
  const list = navigationList();
  if (list !== observedList) {
    if (observedList) observer?.unobserve(observedList);
    observedList = list;
    if (list) observer?.observe(list);
  }
  updateTracks(list);
  if (props.highlightMode !== "hover") {
    const selected =
      list?.querySelector<HTMLElement>(".akaza-navigation-menu-link[data-akaza-active]") ??
      list?.querySelector<HTMLElement>(".akaza-navigation-menu-trigger[data-akaza-active]") ??
      null;
    const closedParent =
      selected &&
      Array.from(
        list!.querySelectorAll<HTMLElement>(
          '.akaza-navigation-menu-inline-content[data-akaza-state="closed"]',
        ),
      ).find((content) => content.contains(selected));
    highlight(
      closedParent?.parentElement?.querySelector<HTMLElement>(
        ":scope > .akaza-navigation-menu-trigger",
      ) ?? selected,
    );
    if (props.highlightMode === "selection-hover")
      highlight(hovered?.isConnected ? hovered : null, "nav-hover");
    return;
  }
  highlight(
    hovered?.isConnected
      ? hovered
      : (list?.querySelector<HTMLElement>('[aria-expanded="true"]') ??
          list?.querySelector<HTMLElement>(".akaza-navigation-menu-link[data-akaza-active]") ??
          null),
  );
}
function onControlHover(event: PointerEvent | FocusEvent) {
  const target =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>(
          ".akaza-navigation-menu-trigger, .akaza-navigation-menu-link",
        )
      : null;
  if (
    !target ||
    !navigationList()?.contains(target) ||
    target.hasAttribute("data-akaza-disabled")
  ) {
    if (props.highlightMode === "selection-hover") {
      hovered = null;
      highlight(null, "nav-hover");
    }
    return;
  }
  hovered = target;
  if (props.highlightMode === "hover") highlight(target);
  else if (props.highlightMode === "selection-hover") highlight(target, "nav-hover");
  if (
    target.classList.contains("akaza-navigation-menu-link") &&
    openValue.value &&
    !props.collapsed
  ) {
    let canceled = false;
    emit("openChange", null, {
      reason: "hover",
      event,
      cancel: () => {
        canceled = true;
      },
    });
    if (!canceled) updateOpen(null);
  }
}
function onNativeOpenChange(value: string | null, details: AkazaChangeEventDetails) {
  // Akaza leaves a pending hover-open timer running when the next item has no children.
  if (
    value &&
    details.reason === "hover" &&
    hovered?.classList.contains("akaza-navigation-menu-link") &&
    !props.collapsed
  ) {
    details.cancel();
    return;
  }
  emit("openChange", value, details);
}
function onControlFocusout(event: FocusEvent) {
  if (
    props.highlightMode === "selection-hover" &&
    !primitive.value?.$el?.contains(event.relatedTarget as Node | null)
  )
    onControlLeave();
}
function onControlLeave() {
  hovered = null;
  restoreHighlight();
}
onBeforeUnmount(() => observer?.disconnect());
watch(
  () => [
    props.size,
    props.orientation,
    props.items,
    props.open,
    props.expanded,
    props.modelValue,
    props.highlightMode,
  ],
  () => {
    void nextTick(restoreHighlight);
  },
  { flush: "post" },
);
onMounted(() => {
  observer = new ResizeObserver(restoreHighlight);
  if (primitive.value?.$el instanceof HTMLElement) observer.observe(primitive.value.$el);
  restoreHighlight();
  if (observedList) observer.observe(observedList);
});
const attrs = useAttrs();
const styles = computed(() =>
  navigationMenuVariants(resolveNavigationMenuVariants(props, uiConfig)),
);
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
  const { class: _class, ui: _ui, size: _size, highlightMode: _highlightMode, ...native } = props;
  return native;
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
    :open="openValue"
    @update:open="updateOpen"
    @open-change="onNativeOpenChange"
    @pointerover="onControlHover"
    @focusin="onControlHover"
    @focusout="onControlFocusout"
    @pointerleave="onControlLeave"
  >
    <template
      v-if="!$slots['child-indicator']"
      #child-indicator
    >
      <svg
        class="size-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof NavigationMenuSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
  <Teleport
    v-if="trackList"
    :to="trackList"
  >
    <li
      v-for="(track, index) in tracks"
      :key="index"
      data-nav-track
      aria-hidden="true"
      role="presentation"
      :class="mergedUi.track"
      :style="{ top: `${track.top}px`, height: `${track.height}px` }"
    />
  </Teleport>
</template>
