<script setup lang="ts">
import type { CSSProperties, Slot } from "vue";
import type {
  NavigationMenuExpandedChangeEventDetails,
  NavigationMenuItem,
  NavigationMenuProps,
  NavigationMenuSlots,
  NavigationMenuValueChangeEventDetails,
} from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside, useResizeObserver } from "@vueuse/core";
import { computed, nextTick, onUnmounted, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import NavigationMenuInline from "./NavigationMenuInline.vue";

const {
  items,
  defaultValue = null,
  orientation = "horizontal",
  contentMode = "auto",
  collapsed = false,
  tooltip = false,
  defaultExpanded = [],
  loop = true,
  dir = "ltr",
  disabled = false,
  openDelay = 80,
  closeDelay = 150,
  sideOffset = 8,
  teleport,
  ariaLabel = "Primary",
  ui,
} = defineProps<NavigationMenuProps>();

const emit = defineEmits<{
  "open-change": [value: string | null, details: AkazaChangeEventDetails];
  "expanded-change": [value: string[], details: NavigationMenuExpandedChangeEventDetails];
  "value-change": [value: string | null, details: NavigationMenuValueChangeEventDetails];
  select: [item: NavigationMenuItem, details: AkazaChangeEventDetails];
}>();

defineSlots<NavigationMenuSlots>();

const openValue = defineModel<string | null>("open", { default: null });
const expandedModel = defineModel<string[] | undefined>("expanded", { default: undefined });
const selectedModel = defineModel<string | null | undefined>({ default: undefined });
const internalSelected = ref<string | null>(defaultValue);
const selectedValue = computed<string | null>({
  get: () => selectedModel.value === undefined ? internalSelected.value : selectedModel.value,
  set: (value) => {
    internalSelected.value = value;
    selectedModel.value = value;
  },
});
const internalExpanded = ref(Array.from(new Set([
  ...defaultExpanded,
  ...collectDefaultExpanded(items),
])));
const expandedValue = computed<string[]>({
  get: () => expandedModel.value ?? internalExpanded.value,
  set: (value) => {
    internalExpanded.value = value;
    expandedModel.value = value;
  },
});
const triggerRefs = ref<Array<HTMLElement | null>>([]);
const panelRefs = ref<Array<HTMLElement | null>>([]);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const activeTriggerIndex = ref(Math.max(0, items.findIndex(isFocusableItem)));
const activationDirection = ref<"left" | "right">();
const previousOpenValue = ref<string | null>(null);
const viewportStyle = ref<CSSProperties>({});
const id = useId();
const slots = useSlots() as Record<string, Slot | undefined>;
const effectiveContentMode = computed(() => {
  if (contentMode !== "auto") return contentMode;
  return orientation === "vertical" && !collapsed ? "inline" : "flyout";
});
const isFlyout = computed(() => effectiveContentMode.value === "flyout");
const floatingSide = computed(() => orientation === "vertical" ? (dir === "rtl" ? "left" : "right") : "bottom");
const teleportTarget = computed(() => {
  if (teleport !== undefined) return teleport;
  return orientation === "vertical" && collapsed ? "body" : false;
});
let openTimer: number | undefined;
let closeTimer: number | undefined;
let typeahead = "";
let typeaheadTimer: number | undefined;
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
  const triggerIndex = items.findIndex((item) => getValue(item) === openValue.value);
  setOpen(null, "escape", event);
  if (triggerIndex >= 0) focusTrigger(triggerIndex);
});

const panelItems = computed(() => items.filter((item) => item.type !== "label" && item.type !== "separator" && item.children?.length));
const activeItem = computed(() => panelItems.value.find((item) => getValue(item) === openValue.value));
const activeTopItem = computed(() => items.find((item) => getValue(item) === openValue.value));
const activeTooltipItem = computed(() => {
  const item = activeTopItem.value;
  return collapsed && tooltip && item && !item.children?.length && item.type !== "label" && item.type !== "separator"
    ? item
    : undefined;
});
const activePanelRef = computed(() => {
  const index = panelItems.value.findIndex((item) => getValue(item) === openValue.value);
  return index >= 0 ? panelRefs.value[index] ?? null : null;
});
const activeTriggerRef = computed(() => {
  const index = items.findIndex((item) => getValue(item) === openValue.value);
  return index >= 0 ? triggerRefs.value[index] ?? null : null;
});
const { actualAlign, actualSide, style: contentStyle } = useFloatingPosition({
  reference: activeTriggerRef,
  floating: contentRef,
  active: () => isFlyout.value && Boolean(activeItem.value?.children || activeTooltipItem.value),
  side: floatingSide,
  align: "start",
  sideOffset: () => sideOffset,
  cssVarPrefix: "akaza-navigation-menu",
});
const indicatorRevision = ref(0);
useResizeObserver(rootRef, () => { indicatorRevision.value += 1; });
useResizeObserver(activeTriggerRef, () => { indicatorRevision.value += 1; });
useResizeObserver(activePanelRef, updateViewportSize);
const indicatorStyle = computed(() => {
  if (orientation !== "horizontal") return {};
  void indicatorRevision.value;
  const index = items.findIndex((item) => getValue(item) === openValue.value);
  const trigger = triggerRefs.value[index];
  const root = rootRef.value;
  if (!trigger || !root) return {};
  const triggerRect = trigger.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  return {
    left: `${triggerRect.left - rootRect.left}px`,
    width: `${triggerRect.width}px`,
  };
});

function getValue(item: NavigationMenuItem): string {
  return item.value ?? (typeof item.to === "string" ? item.to : item.href) ?? item.label;
}

function hasDestination(item: NavigationMenuItem): boolean {
  return Boolean(item.as || item.to != null || item.href !== undefined);
}

function getLeafComponent(item: NavigationMenuItem) {
  if (item.as) return item.as;
  if (item.to != null) return "RouterLink";
  if (item.href !== undefined) return "a";
  return "button";
}

function getDestinationProps(item: NavigationMenuItem): { to: unknown } | { href: string } | Record<string, never> {
  if (item.to != null) return { to: item.to };
  if (item.href !== undefined) return { href: item.href };
  return {};
}

function collectDefaultExpanded(source: NavigationMenuItem[]): string[] {
  const values: string[] = [];
  for (const item of source) {
    if (item.defaultExpanded && item.children?.length) values.push(getValue(item));
    if (item.children?.length) values.push(...collectDefaultExpanded(item.children));
  }
  return values;
}

function isFocusableItem(item: NavigationMenuItem): boolean {
  return item.type !== "label" && item.type !== "separator" && !item.disabled;
}

function isItemActive(item: NavigationMenuItem): boolean {
  return selectedValue.value !== null
    ? getValue(item) === selectedValue.value
    : Boolean(item.active);
}

function containsActiveItem(item: NavigationMenuItem): boolean {
  return isItemActive(item) || Boolean(item.children?.some(containsActiveItem));
}

function getTriggerId(index: number) {
  return `${id}-trigger-${index}`;
}

function getContentId(index: number) {
  return `${id}-content-${index}`;
}

function getTooltipId(index: number) {
  return `${id}-tooltip-${index}`;
}

function updateViewportSize() {
  const panel = activePanelRef.value;
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  viewportStyle.value = {
    "--akaza-navigation-menu-viewport-width": `${rect.width}px`,
    "--akaza-navigation-menu-viewport-height": `${rect.height}px`,
  } as CSSProperties;
}

function getActivationDirection(previous: string, next: string): "left" | "right" | undefined {
  const previousIndex = items.findIndex((item) => getValue(item) === previous);
  const nextIndex = items.findIndex((item) => getValue(item) === next);
  if (previousIndex < 0 || nextIndex < 0 || previousIndex === nextIndex) return undefined;
  const forward = nextIndex > previousIndex;
  if (dir === "rtl") return forward ? "left" : "right";
  return forward ? "right" : "left";
}

function setTriggerRef(el: HTMLElement | null, index: number) {
  triggerRefs.value[index] = el;
}

function setIndexedTriggerRef(index: number) {
  return (el: Element | null) => setTriggerRef(el as HTMLElement | null, index);
}

function setIndexedPanelRef(index: number) {
  return (el: unknown) => {
    panelRefs.value[index] = el as HTMLElement | null;
  };
}

function isPanelOpen(item: NavigationMenuItem) {
  return getValue(item) === openValue.value;
}

function getPanelMotion(item: NavigationMenuItem) {
  const value = getValue(item);
  if (!activationDirection.value) return undefined;
  if (value === openValue.value) {
    return activationDirection.value === "right" ? "from-end" : "from-start";
  }
  if (value === previousOpenValue.value) {
    return activationDirection.value === "right" ? "to-start" : "to-end";
  }
  return undefined;
}

function setOpen(value: string | null, reason: string, event?: Event) {
  if (disabled && value) return;
  if (openValue.value === value) return;
  if (reason !== "hover") {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
  } else if (value === null) {
    window.clearTimeout(openTimer);
  }
  let canceled = false;
  emit("open-change", value, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) openValue.value = value;
}

function setExpanded(item: NavigationMenuItem, nextExpanded: boolean, reason: string, event?: Event) {
  if (disabled || item.disabled || !item.children?.length) return;
  const value = getValue(item);
  const values = new Set(expandedValue.value);
  if (nextExpanded) values.add(value);
  else values.delete(value);
  const next = Array.from(values);
  if (next.length === expandedValue.value.length && next.every((entry, index) => entry === expandedValue.value[index])) return;
  let canceled = false;
  emit("expanded-change", next, {
    item,
    expanded: nextExpanded,
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) expandedValue.value = next;
}

function toggleExpanded(item: NavigationMenuItem, event?: Event) {
  const value = getValue(item);
  setExpanded(item, !expandedValue.value.includes(value), event ? "trigger" : "programmatic", event);
}

function selectItem(item: NavigationMenuItem, event: Event) {
  if (disabled || item.disabled) {
    event.preventDefault();
    return;
  }
  item.onClick?.(event as MouseEvent);
  let canceled = false;
  emit("select", item, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) {
    const value = getValue(item);
    if (selectedValue.value !== value) {
      let valueCanceled = false;
      emit("value-change", value, {
        item,
        reason: "select",
        event,
        cancel: () => { valueCanceled = true; },
      });
      if (!valueCanceled) selectedValue.value = value;
    }
    item.onSelect?.();
    if (isFlyout.value) setOpen(null, "select", event);
  } else {
    event.preventDefault();
  }
}

function focusTrigger(index: number) {
  activeTriggerIndex.value = index;
  triggerRefs.value[index]?.focus();
}

function move(index: number, delta: number) {
  const count = items.length;
  let next = index;
  for (let step = 0; step < count; step++) {
    next += delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return;
    const candidate = items[next];
    if (candidate && isFocusableItem(candidate)) {
      focusTrigger(next);
      return;
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent, item: NavigationMenuItem, index: number) {
  if (!isFlyout.value) return;
  const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const moveNextKey = orientation === "vertical" ? "ArrowDown" : nextKey;
  const movePreviousKey = orientation === "vertical" ? "ArrowUp" : previousKey;
  const openKey = orientation === "vertical" ? nextKey : "ArrowDown";
  if (event.key === moveNextKey) {
    event.preventDefault();
    move(index, 1);
  } else if (event.key === movePreviousKey) {
    event.preventDefault();
    move(index, -1);
  } else if ((event.key === openKey || event.key === "Enter" || event.key === " ") && item.children) {
    event.preventDefault();
    setOpen(getValue(item), "keyboard", event);
  } else if (event.key === "Escape") {
    if (!openValue.value) return;
    event.preventDefault();
    setOpen(null, "escape", event);
  } else if (event.key === "Home") {
    event.preventDefault();
    const first = items.findIndex(isFocusableItem);
    if (first >= 0) focusTrigger(first);
  } else if (event.key === "End") {
    event.preventDefault();
    for (let next = items.length - 1; next >= 0; next--) {
      const candidate = items[next];
      if (candidate && isFocusableItem(candidate)) {
        focusTrigger(next);
        break;
      }
    }
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead += event.key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => { typeahead = ""; }, 500);
    const next = items.findIndex((candidate) =>
      isFocusableItem(candidate) && candidate.label.toLowerCase().startsWith(typeahead),
    );
    if (next >= 0) focusTrigger(next);
  }
}

function onTriggerFocus(event: FocusEvent, item: NavigationMenuItem, index: number) {
  activeTriggerIndex.value = index;
  if (collapsed && tooltip && !item.children) setOpen(getValue(item), "focus", event);
}

function onTriggerBlur(event: FocusEvent, item: NavigationMenuItem) {
  if (collapsed && tooltip && !item.children) scheduleClose(event);
}

function getTriggerTabindex(item: NavigationMenuItem, index: number) {
  if (disabled || !isFocusableItem(item)) return -1;
  if (!items[activeTriggerIndex.value] || !isFocusableItem(items[activeTriggerIndex.value]!)) {
    return index === items.findIndex(isFocusableItem) ? 0 : -1;
  }
  return index === activeTriggerIndex.value ? 0 : -1;
}

function scheduleOpen(item: NavigationMenuItem, event: Event) {
  if (!isFlyout.value || (!item.children && !(collapsed && tooltip)) || disabled || item.disabled) return;
  window.clearTimeout(closeTimer);
  window.clearTimeout(openTimer);
  openTimer = window.setTimeout(() => setOpen(getValue(item), "hover", event), openDelay);
}

function scheduleClose(event?: Event) {
  if (!isFlyout.value) return;
  window.clearTimeout(openTimer);
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => setOpen(null, "hover", event), closeDelay);
}

function cancelClose() {
  window.clearTimeout(closeTimer);
}

function getContentItems() {
  if (!activePanelRef.value) return [];
  return Array.from(activePanelRef.value.querySelectorAll<HTMLElement>("[data-akaza-navigation-menu-link]"))
    .filter((element) => element.getAttribute("aria-disabled") !== "true");
}

function onContentKeydown(event: KeyboardEvent) {
  const links = getContentItems();
  const index = links.indexOf(document.activeElement as HTMLElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    links[(index + delta + links.length) % links.length]?.focus();
  } else if (event.key === "Home") {
    event.preventDefault();
    links[0]?.focus();
  } else if (event.key === "End") {
    event.preventDefault();
    links[links.length - 1]?.focus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    const triggerIndex = items.findIndex((item) => getValue(item) === openValue.value);
    setOpen(null, "escape", event);
    if (triggerIndex >= 0) focusTrigger(triggerIndex);
  }
}

function hasSlot(item: NavigationMenuItem, fallback: string) {
  return Boolean(slots[item.slot ?? fallback]);
}

function getSlotProps(item: NavigationMenuItem, depth: number) {
  const value = getValue(item);
  const toggle = (reasonOrEvent?: string | Event, event?: Event) => {
    const sourceEvent = typeof reasonOrEvent === "string" ? event : reasonOrEvent;
    if (effectiveContentMode.value === "inline") toggleExpanded(item, sourceEvent);
    else setOpen(openValue.value === value ? null : value, typeof reasonOrEvent === "string" ? reasonOrEvent : "trigger", sourceEvent);
  };
  return {
    item,
    isOpen: effectiveContentMode.value === "inline" ? expandedValue.value.includes(value) : openValue.value === value,
    isActive: isItemActive(item),
    depth,
    collapsed,
    toggle,
  };
}

function renderSlot(item: NavigationMenuItem, fallback: string, depth = 0) {
  return slots[item.slot ?? fallback]!(getSlotProps(item, depth));
}

function hasPartSlot(name: string) {
  return Boolean(slots[name]);
}

function renderPart(name: string, item: NavigationMenuItem, depth = 0) {
  return slots[name]!(getSlotProps(item, depth));
}

function inlineControls() {
  if (!rootRef.value) return [];
  return Array.from(rootRef.value.querySelectorAll<HTMLElement>("[data-akaza-navigation-menu-inline-control]"))
    .filter(element => !element.closest("[inert]") && element.getAttribute("aria-disabled") !== "true" && !(element as HTMLButtonElement).disabled);
}

function onInlineKeydown(event: KeyboardEvent) {
  if (effectiveContentMode.value !== "inline") return;
  const target = event.target instanceof HTMLElement
    ? event.target.closest<HTMLElement>("[data-akaza-navigation-menu-inline-control]")
    : null;
  if (!target) return;
  const controls = inlineControls();
  const index = controls.indexOf(target);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = loop ? (index + delta + controls.length) % controls.length : index + delta;
    controls[next]?.focus();
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    controls[event.key === "Home" ? 0 : controls.length - 1]?.focus();
  } else if (event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight") && target.getAttribute("aria-expanded") === "false") {
    event.preventDefault();
    target.click();
  } else if (event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight") && target.getAttribute("aria-expanded") === "true") {
    const contentId = target.getAttribute("aria-controls");
    const firstChild = contentId
      ? document.getElementById(contentId)?.querySelector<HTMLElement>("[data-akaza-navigation-menu-inline-control]")
      : null;
    if (firstChild) {
      event.preventDefault();
      firstChild.focus();
    }
  } else if (event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft")) {
    const expanded = target.getAttribute("aria-expanded");
    if (expanded === "true") {
      event.preventDefault();
      target.click();
      return;
    }
    const parentValue = target.closest<HTMLElement>(".akaza-navigation-menu-inline-content")?.dataset.akazaParentValue;
    const parent = controls.find(control => control.dataset.akazaValue === parentValue);
    if (parent) {
      event.preventDefault();
      parent.focus();
    }
  }
}

onClickOutside(rootRef, (event) => {
  if (openValue.value) setOpen(null, "outside-click", event);
}, { ignore: [contentRef] });

watch(() => disabled, (value) => {
  if (value && openValue.value) setOpen(null, "disabled");
});
watch(effectiveContentMode, (mode) => {
  if (mode === "inline" && openValue.value) setOpen(null, "content-mode");
});
watch(() => isFlyout.value && Boolean(activeItem.value?.children || activeTooltipItem.value), (open) => {
  if (open) register();
  else unregister();
}, { immediate: true });
// Direction depends on previous state, including externally controlled v-model updates.
watch(openValue, async (value, previous) => {
  previousOpenValue.value = value && previous ? previous : null;
  activationDirection.value = value && previous ? getActivationDirection(previous, value) : undefined;
  await nextTick();
  updateViewportSize();
});

onUnmounted(() => {
  window.clearTimeout(openTimer);
  window.clearTimeout(closeTimer);
  window.clearTimeout(typeaheadTimer);
  unregister();
});
</script>

<template>
  <nav
    ref="rootRef"
    :dir="dir"
    :aria-label="ariaLabel"
    :data-akaza-state="effectiveContentMode === 'inline' ? (expandedValue.length ? 'open' : 'closed') : (openValue ? 'open' : 'closed')"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-orientation="orientation"
    :data-akaza-content-mode="effectiveContentMode"
    :data-akaza-collapsed="collapsed || undefined"
    :class="ui?.root"
    class="akaza-navigation-menu"
    @mouseenter="cancelClose"
    @mouseleave="scheduleClose($event)"
    @keydown="onInlineKeydown"
  >
    <NavigationMenuInline
      v-if="effectiveContentMode === 'inline'"
      :items="items"
      :expanded="expandedValue"
      :selected-value="selectedValue"
      :depth="0"
      :disabled="disabled"
      :collapsed="collapsed"
      :id-prefix="id"
      :ui="ui"
      :provided-slots="slots"
      @toggle="toggleExpanded"
      @select="selectItem"
    />

    <template v-else>
      <ul :class="ui?.list" class="akaza-navigation-menu-list">
        <li
          v-for="(item, index) in items"
          :key="getValue(item)"
          :class="ui?.item"
          :data-akaza-active="containsActiveItem(item) || undefined"
          :data-akaza-state="item.children?.length ? (openValue === getValue(item) ? 'open' : 'closed') : (isItemActive(item) ? 'active' : 'inactive')"
          :data-akaza-disabled="disabled || item.disabled || undefined"
          class="akaza-navigation-menu-item"
        >
          <div
            v-if="item.type === 'label'"
            :class="ui?.groupLabel"
            class="akaza-navigation-menu-group-label"
          >
            {{ item.label }}
          </div>
          <div
            v-else-if="item.type === 'separator'"
            role="separator"
            :aria-label="item.label || undefined"
            :class="ui?.separator"
            class="akaza-navigation-menu-separator"
          />
          <component
            :is="item.children ? 'button' : getLeafComponent(item)"
            v-else
            :id="getTriggerId(index)"
            :ref="setIndexedTriggerRef(index)"
            v-bind="!item.children ? getDestinationProps(item) : {}"
            :type="item.children || !hasDestination(item) ? 'button' : undefined"
            :disabled="item.children || !hasDestination(item) ? (disabled || item.disabled) : undefined"
            :aria-disabled="!item.children && hasDestination(item) && (disabled || item.disabled) ? true : undefined"
            :aria-current="!item.children && isItemActive(item) ? (item.ariaCurrent ?? 'page') : undefined"
            :aria-expanded="item.children ? openValue === getValue(item) : undefined"
            :aria-controls="item.children ? getContentId(index) : undefined"
            :aria-describedby="collapsed && tooltip && !item.children ? getTooltipId(index) : undefined"
            :aria-label="collapsed ? item.label : undefined"
            :tabindex="getTriggerTabindex(item, index)"
            :class="[item.children ? ui?.trigger : ui?.link, item.children ? 'akaza-navigation-menu-trigger' : 'akaza-navigation-menu-link']"
            :data-akaza-active="containsActiveItem(item) || undefined"
            :data-akaza-state="item.children?.length ? (openValue === getValue(item) ? 'open' : 'closed') : (isItemActive(item) ? 'active' : 'inactive')"
            :data-akaza-disabled="disabled || item.disabled || undefined"
            @click="item.children ? setOpen(openValue === getValue(item) ? null : getValue(item), 'trigger', $event) : selectItem(item, $event)"
            @focus="onTriggerFocus($event, item, index)"
            @blur="onTriggerBlur($event, item)"
            @keydown="onTriggerKeydown($event, item, index)"
            @mouseenter="scheduleOpen(item, $event)"
          >
            <component :is="() => renderSlot(item, item.children ? 'trigger' : 'link')" v-if="hasSlot(item, item.children ? 'trigger' : 'link')" />
            <template v-else>
              <span
                v-if="hasPartSlot('item-leading')"
                :class="ui?.itemLeading"
                class="akaza-navigation-menu-item-leading"
              >
                <component :is="() => renderPart('item-leading', item)" />
              </span>
              <component
                :is="item.icon"
                v-else-if="item.icon"
                :class="ui?.itemLeading"
                class="akaza-navigation-menu-item-leading"
                aria-hidden="true"
              />
              <span
                v-if="hasPartSlot('item-label')"
                :class="ui?.itemLabel"
                class="akaza-navigation-menu-item-label"
              >
                <component :is="() => renderPart('item-label', item)" />
              </span>
              <span v-else :class="ui?.itemLabel" class="akaza-navigation-menu-item-label">{{ item.label }}</span>
              <span v-if="item.badge !== undefined" :class="ui?.badge" class="akaza-navigation-menu-badge">{{ item.badge }}</span>
              <span
                v-if="hasPartSlot('item-trailing')"
                :class="ui?.itemTrailing"
                class="akaza-navigation-menu-item-trailing"
              >
                <component :is="() => renderPart('item-trailing', item)" />
              </span>
              <span
                v-if="item.children?.length && hasPartSlot('child-indicator')"
                :class="ui?.childIndicator"
                :data-akaza-state="openValue === getValue(item) ? 'open' : 'closed'"
                class="akaza-navigation-menu-child-indicator"
                aria-hidden="true"
              >
                <component :is="() => renderPart('child-indicator', item)" />
              </span>
            </template>
          </component>
        </li>
      </ul>

      <div
        v-if="orientation === 'horizontal' && activeItem?.children"
        :style="indicatorStyle"
        :class="ui?.indicator"
        data-akaza-state="open"
        class="akaza-navigation-menu-indicator"
        aria-hidden="true"
      />

      <Teleport :to="teleportTarget || 'body'" :disabled="!teleportTarget">
        <Transition name="akaza-navigation-menu">
          <div
            v-if="activeItem?.children || activeTooltipItem"
            ref="contentRef"
            :style="contentStyle"
            :class="ui?.content"
            data-akaza-state="open"
            :data-akaza-side="actualSide"
            :data-akaza-align="actualAlign"
            class="akaza-navigation-menu-content"
            @mouseenter="cancelClose"
            @mouseleave="scheduleClose($event)"
            @keydown="onContentKeydown"
          >
            <div
              v-if="activeTooltipItem"
              :id="getTooltipId(items.indexOf(activeTooltipItem))"
              role="tooltip"
              :class="ui?.tooltip"
              class="akaza-navigation-menu-tooltip"
            >
              {{ activeTooltipItem.label }}
            </div>
            <div
              v-else
              :style="viewportStyle"
              :class="ui?.viewport"
              :data-akaza-activation-direction="activationDirection"
              class="akaza-navigation-menu-viewport"
            >
              <Transition
                v-for="(panelItem, panelIndex) in panelItems"
                :key="getValue(panelItem)"
                name="akaza-navigation-menu-panel"
              >
                <ul
                  v-show="isPanelOpen(panelItem)"
                  :id="getContentId(items.indexOf(panelItem))"
                  :ref="setIndexedPanelRef(panelIndex)"
                  :aria-labelledby="getTriggerId(items.indexOf(panelItem))"
                  :aria-hidden="!isPanelOpen(panelItem) || undefined"
                  :inert="!isPanelOpen(panelItem) || undefined"
                  :class="[ui?.panel, ui?.contentList]"
                  :data-akaza-state="isPanelOpen(panelItem) ? 'open' : 'closed'"
                  :data-akaza-motion="getPanelMotion(panelItem)"
                  :data-akaza-activation-direction="activationDirection"
                  class="akaza-navigation-menu-panel akaza-navigation-menu-content-list"
                >
                  <li
                    v-for="child in panelItem.children"
                    :key="getValue(child)"
                    :class="ui?.contentItem"
                    :data-akaza-disabled="child.disabled || undefined"
                    :data-akaza-active="containsActiveItem(child) || undefined"
                    :data-akaza-state="isItemActive(child) ? 'active' : 'inactive'"
                    class="akaza-navigation-menu-content-item"
                  >
                    <component
                      :is="getLeafComponent(child)"
                      v-bind="getDestinationProps(child)"
                      :type="!hasDestination(child) ? 'button' : undefined"
                      :disabled="!hasDestination(child) ? child.disabled : undefined"
                      :aria-disabled="child.disabled || undefined"
                      :aria-current="isItemActive(child) ? (child.ariaCurrent ?? 'page') : undefined"
                      :class="ui?.contentLink"
                      :data-akaza-active="containsActiveItem(child) || undefined"
                      :data-akaza-state="isItemActive(child) ? 'active' : 'inactive'"
                      data-akaza-navigation-menu-link
                      class="akaza-navigation-menu-content-link"
                      @click="selectItem(child, $event)"
                    >
                      <component :is="() => renderSlot(child, 'item', 1)" v-if="hasSlot(child, 'item')" />
                      <template v-else>
                        <span :class="ui?.label" class="akaza-navigation-menu-label">{{ child.label }}</span>
                        <span v-if="child.badge !== undefined" :class="ui?.badge" class="akaza-navigation-menu-badge">{{ child.badge }}</span>
                        <span v-if="child.description" :class="ui?.description" class="akaza-navigation-menu-description">{{ child.description }}</span>
                      </template>
                    </component>

                    <ul
                      v-if="child.children?.length"
                      :class="ui?.contentList"
                      class="akaza-navigation-menu-content-list akaza-navigation-menu-sub-list"
                    >
                      <li
                        v-for="nested in child.children"
                        :key="getValue(nested)"
                        :class="ui?.contentItem"
                        :data-akaza-active="isItemActive(nested) || undefined"
                        :data-akaza-state="isItemActive(nested) ? 'active' : 'inactive'"
                        class="akaza-navigation-menu-content-item"
                      >
                        <component
                          :is="getLeafComponent(nested)"
                          v-bind="getDestinationProps(nested)"
                          :type="!hasDestination(nested) ? 'button' : undefined"
                          :disabled="!hasDestination(nested) ? nested.disabled : undefined"
                          :aria-disabled="nested.disabled || undefined"
                          :aria-current="isItemActive(nested) ? (nested.ariaCurrent ?? 'page') : undefined"
                          :class="ui?.contentLink"
                          :data-akaza-active="isItemActive(nested) || undefined"
                          :data-akaza-state="isItemActive(nested) ? 'active' : 'inactive'"
                          data-akaza-navigation-menu-link
                          class="akaza-navigation-menu-content-link"
                          @click="selectItem(nested, $event)"
                        >
                          <component :is="() => renderSlot(nested, 'item', 2)" v-if="hasSlot(nested, 'item')" />
                          <template v-else>{{ nested.label }}</template>
                        </component>
                      </li>
                    </ul>
                  </li>
                </ul>
              </Transition>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </nav>
</template>

<style>
@layer akaza-reset {
.akaza-navigation-menu {
  position: relative;
}

.akaza-navigation-menu-list,
.akaza-navigation-menu-content-list,
.akaza-navigation-menu-inline-list {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
}

.akaza-navigation-menu[data-akaza-orientation="vertical"] > .akaza-navigation-menu-list,
.akaza-navigation-menu-inline-list {
  flex-direction: column;
}

.akaza-navigation-menu[data-akaza-orientation="horizontal"] > .akaza-navigation-menu-inline-list[data-akaza-depth="0"] {
  flex-direction: row;
}

.akaza-navigation-menu-inline-trigger,
.akaza-navigation-menu-inline-link {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
}

.akaza-navigation-menu-inline-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--akaza-navigation-menu-inline-duration, 160ms) ease-out;
}

.akaza-navigation-menu-inline-content[data-akaza-state="open"] {
  grid-template-rows: 1fr;
}

.akaza-navigation-menu-inline-content-inner {
  min-height: 0;
  overflow: hidden;
}

.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-trigger > .akaza-navigation-menu-item-label,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-link > .akaza-navigation-menu-item-label,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-trigger > .akaza-navigation-menu-badge,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-link > .akaza-navigation-menu-badge,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-trigger > .akaza-navigation-menu-child-indicator,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-link > .akaza-navigation-menu-child-indicator,
.akaza-navigation-menu[data-akaza-collapsed] > .akaza-navigation-menu-list > .akaza-navigation-menu-item > .akaza-navigation-menu-group-label {
  display: none;
}

.akaza-navigation-menu-tooltip {
  white-space: nowrap;
}

.akaza-navigation-menu-content {
  position: absolute;
  z-index: var(--akaza-z-navigation-menu, 1000);
  transition:
    left var(--akaza-navigation-menu-resize-duration, 200ms) cubic-bezier(0.22, 1, 0.36, 1),
    top var(--akaza-navigation-menu-resize-duration, 200ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.akaza-navigation-menu-viewport {
  position: relative;
  width: var(--akaza-navigation-menu-viewport-width, auto);
  height: var(--akaza-navigation-menu-viewport-height, auto);
  overflow: hidden;
  transition:
    width var(--akaza-navigation-menu-resize-duration, 200ms) cubic-bezier(0.22, 1, 0.36, 1),
    height var(--akaza-navigation-menu-resize-duration, 200ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.akaza-navigation-menu-panel {
  box-sizing: border-box;
}

.akaza-navigation-menu-panel-enter-active,
.akaza-navigation-menu-panel-leave-active {
  transition:
    opacity var(--akaza-navigation-menu-panel-duration, 180ms) cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--akaza-navigation-menu-panel-duration, 180ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.akaza-navigation-menu-panel-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
}

.akaza-navigation-menu-panel-enter-from,
.akaza-navigation-menu-panel-leave-to {
  opacity: 0;
}

.akaza-navigation-menu-panel-enter-from[data-akaza-motion="from-end"],
.akaza-navigation-menu-panel-leave-to[data-akaza-motion="to-end"] {
  transform: translateX(var(--akaza-navigation-menu-slide-distance, 16px));
}

.akaza-navigation-menu-panel-enter-from[data-akaza-motion="from-start"],
.akaza-navigation-menu-panel-leave-to[data-akaza-motion="to-start"] {
  transform: translateX(calc(var(--akaza-navigation-menu-slide-distance, 16px) * -1));
}

.akaza-navigation-menu-indicator {
  position: absolute;
}

.akaza-navigation-menu-sub-list {
  flex-direction: column;
}

.akaza-navigation-menu-enter-active,
.akaza-navigation-menu-leave-active {
  transition:
    opacity var(--akaza-navigation-menu-duration, 120ms) ease-out,
    scale var(--akaza-navigation-menu-duration, 120ms) ease-out,
    translate var(--akaza-navigation-menu-duration, 120ms) ease-out;
}

.akaza-navigation-menu-enter-from,
.akaza-navigation-menu-leave-to {
  opacity: 0;
  scale: 0.98;
}

.akaza-navigation-menu-enter-from[data-akaza-side="bottom"],
.akaza-navigation-menu-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
.akaza-navigation-menu-enter-from[data-akaza-side="top"],
.akaza-navigation-menu-leave-to[data-akaza-side="top"] { translate: 0 4px; }
.akaza-navigation-menu-enter-from[data-akaza-side="right"],
.akaza-navigation-menu-leave-to[data-akaza-side="right"] { translate: -4px 0; }
.akaza-navigation-menu-enter-from[data-akaza-side="left"],
.akaza-navigation-menu-leave-to[data-akaza-side="left"] { translate: 4px 0; }

@media (prefers-reduced-motion: reduce) {
  .akaza-navigation-menu-enter-active,
  .akaza-navigation-menu-leave-active,
  .akaza-navigation-menu-panel-enter-active,
  .akaza-navigation-menu-panel-leave-active,
  .akaza-navigation-menu-viewport,
  .akaza-navigation-menu-inline-content {
    transition-duration: 0.01ms;
  }
}
}
</style>
