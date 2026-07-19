<script setup lang="ts">
import type { Slot } from "vue";
import type { NavigationMenuItem, NavigationMenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, onUnmounted, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useFloatingPosition } from "../../utils/floatingPosition";

const {
  items,
  loop = true,
  dir = "ltr",
  disabled = false,
  openDelay = 80,
  closeDelay = 150,
  ariaLabel = "Primary",
  ui,
} = defineProps<NavigationMenuProps>();

const emit = defineEmits<{
  "open-change": [value: string | null, details: AkazaChangeEventDetails];
  select: [item: NavigationMenuItem, details: AkazaChangeEventDetails];
}>();

const openValue = defineModel<string | null>("open", { default: null });
const triggerRefs = ref<Array<HTMLElement | null>>([]);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const activeTriggerIndex = ref(Math.max(0, items.findIndex((item) => !item.disabled)));
const id = useId();
const slots = useSlots() as Record<string, Slot | undefined>;
let openTimer: number | undefined;
let closeTimer: number | undefined;
let typeahead = "";
let typeaheadTimer: number | undefined;

const activeItem = computed(() => items.find((item) => getValue(item) === openValue.value));
const activeTriggerRef = computed(() => {
  const index = items.findIndex((item) => getValue(item) === openValue.value);
  return index >= 0 ? triggerRefs.value[index] ?? null : null;
});
const { actualAlign, actualSide, style: contentStyle } = useFloatingPosition({
  reference: activeTriggerRef,
  floating: contentRef,
  active: () => Boolean(activeItem.value?.children),
  side: "bottom",
  align: "start",
  sideOffset: 8,
  cssVarPrefix: "akaza-navigation-menu",
});
const indicatorStyle = computed(() => {
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
  return item.value ?? item.href ?? item.label;
}

function getTriggerId(index: number) {
  return `${id}-trigger-${index}`;
}

function getContentId(index: number) {
  return `${id}-content-${index}`;
}

function setTriggerRef(el: HTMLElement | null, index: number) {
  triggerRefs.value[index] = el;
}

function setIndexedTriggerRef(index: number) {
  return (el: Element | null) => setTriggerRef(el as HTMLElement | null, index);
}

function setOpen(value: string | null, reason: string, event?: Event) {
  if (disabled && value) return;
  if (openValue.value === value) return;
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

function selectItem(item: NavigationMenuItem, event: Event) {
  if (disabled || item.disabled) {
    event.preventDefault();
    return;
  }
  let canceled = false;
  emit("select", item, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) {
    item.onSelect?.();
    setOpen(null, "select", event);
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
    if (!items[next]?.disabled) {
      focusTrigger(next);
      return;
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent, item: NavigationMenuItem, index: number) {
  const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (event.key === nextKey) {
    event.preventDefault();
    move(index, 1);
  } else if (event.key === previousKey) {
    event.preventDefault();
    move(index, -1);
  } else if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && item.children) {
    event.preventDefault();
    setOpen(getValue(item), "keyboard", event);
  } else if (event.key === "Escape") {
    setOpen(null, "escape", event);
  } else if (event.key === "Home") {
    event.preventDefault();
    const first = items.findIndex((candidate) => !candidate.disabled);
    if (first >= 0) focusTrigger(first);
  } else if (event.key === "End") {
    event.preventDefault();
    for (let next = items.length - 1; next >= 0; next--) {
      if (!items[next]?.disabled) {
        focusTrigger(next);
        break;
      }
    }
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead += event.key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => { typeahead = ""; }, 500);
    const next = items.findIndex((candidate) =>
      !candidate.disabled && candidate.label.toLowerCase().startsWith(typeahead),
    );
    if (next >= 0) focusTrigger(next);
  }
}

function getTriggerTabindex(item: NavigationMenuItem, index: number) {
  if (disabled || item.disabled) return -1;
  if (items[activeTriggerIndex.value]?.disabled) {
    return index === items.findIndex((candidate) => !candidate.disabled) ? 0 : -1;
  }
  return index === activeTriggerIndex.value ? 0 : -1;
}

function scheduleOpen(item: NavigationMenuItem, event: Event) {
  if (!item.children || disabled || item.disabled) return;
  window.clearTimeout(closeTimer);
  window.clearTimeout(openTimer);
  openTimer = window.setTimeout(() => setOpen(getValue(item), "hover", event), openDelay);
}

function scheduleClose(event?: Event) {
  window.clearTimeout(openTimer);
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => setOpen(null, "hover", event), closeDelay);
}

function cancelClose() {
  window.clearTimeout(closeTimer);
}

function getContentItems() {
  if (!contentRef.value) return [];
  return Array.from(contentRef.value.querySelectorAll<HTMLElement>("[data-akaza-navigation-menu-link]"))
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

function renderSlot(item: NavigationMenuItem, fallback: string) {
  return slots[item.slot ?? fallback]!({ item, isOpen: openValue.value === getValue(item) });
}

onClickOutside(rootRef, (event) => {
  if (openValue.value) setOpen(null, "outside-click", event);
});

watch(() => disabled, (value) => {
  if (value && openValue.value) setOpen(null, "disabled");
});

onUnmounted(() => {
  window.clearTimeout(openTimer);
  window.clearTimeout(closeTimer);
  window.clearTimeout(typeaheadTimer);
});
</script>

<template>
  <nav
    ref="rootRef"
    :dir="dir"
    :aria-label="ariaLabel"
    :data-akaza-state="openValue ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    :class="ui?.root"
    class="akaza-navigation-menu"
    @mouseenter="cancelClose"
    @mouseleave="scheduleClose($event)"
  >
    <ul :class="ui?.list" class="akaza-navigation-menu-list">
      <li
        v-for="(item, index) in items"
        :key="getValue(item)"
        :class="ui?.item"
        :data-akaza-state="openValue === getValue(item) ? 'open' : 'closed'"
        :data-akaza-disabled="disabled || item.disabled || undefined"
        class="akaza-navigation-menu-item"
      >
        <component
          :is="item.children ? 'button' : (item.as ?? (item.href ? 'a' : 'button'))"
          :id="getTriggerId(index)"
          :ref="setIndexedTriggerRef(index)"
          :href="item.href && !item.children ? item.href : undefined"
          :to="!item.children ? item.to : undefined"
          :type="item.children || (!item.as && !item.href) ? 'button' : undefined"
          :disabled="item.children || (!item.as && !item.href) ? (disabled || item.disabled) : undefined"
          :aria-disabled="!item.children && (item.href || item.as) && (disabled || item.disabled) ? true : undefined"
          :aria-current="!item.children && item.active ? (item.ariaCurrent ?? 'page') : undefined"
          :aria-expanded="item.children ? openValue === getValue(item) : undefined"
          :aria-haspopup="item.children ? 'true' : undefined"
          :aria-controls="item.children ? getContentId(index) : undefined"
          :tabindex="getTriggerTabindex(item, index)"
          :class="[item.children ? ui?.trigger : ui?.link, item.children ? 'akaza-navigation-menu-trigger' : 'akaza-navigation-menu-link']"
          :data-akaza-state="openValue === getValue(item) ? 'open' : 'closed'"
          :data-akaza-disabled="disabled || item.disabled || undefined"
          @click="item.children ? setOpen(openValue === getValue(item) ? null : getValue(item), 'trigger', $event) : selectItem(item, $event)"
          @focus="activeTriggerIndex = index"
          @keydown="onTriggerKeydown($event, item, index)"
          @mouseenter="scheduleOpen(item, $event)"
        >
          <component :is="() => renderSlot(item, item.children ? 'trigger' : 'link')" v-if="hasSlot(item, item.children ? 'trigger' : 'link')" />
          <template v-else>
            {{ item.label }}
          </template>
        </component>
      </li>
    </ul>

    <div
      v-if="activeItem?.children"
      :style="indicatorStyle"
      :class="ui?.indicator"
      data-akaza-state="open"
      class="akaza-navigation-menu-indicator"
      aria-hidden="true"
    />

    <Transition name="akaza-navigation-menu">
      <div
        v-if="activeItem?.children"
        :id="getContentId(items.indexOf(activeItem))"
        ref="contentRef"
        :aria-labelledby="getTriggerId(items.indexOf(activeItem))"
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
        <div :class="ui?.viewport" class="akaza-navigation-menu-viewport">
          <ul :class="ui?.contentList" class="akaza-navigation-menu-content-list">
            <li
              v-for="child in activeItem.children"
              :key="getValue(child)"
              :class="ui?.contentItem"
              :data-akaza-disabled="child.disabled || undefined"
              class="akaza-navigation-menu-content-item"
            >
              <component
                :is="child.as ?? (child.href ? 'a' : 'button')"
                :href="child.href"
                :to="child.to"
                :type="!child.as && !child.href ? 'button' : undefined"
                :disabled="!child.as && !child.href ? child.disabled : undefined"
                :aria-disabled="child.disabled || undefined"
                :aria-current="child.active ? (child.ariaCurrent ?? 'page') : undefined"
                :class="ui?.contentLink"
                data-akaza-navigation-menu-link
                class="akaza-navigation-menu-content-link"
                @click="selectItem(child, $event)"
              >
                <component :is="() => renderSlot(child, 'item')" v-if="hasSlot(child, 'item')" />
                <template v-else>
                  <span :class="ui?.label" class="akaza-navigation-menu-label">
                    {{ child.label }}
                  </span>
                  <span
                    v-if="child.description"
                    :class="ui?.description"
                    class="akaza-navigation-menu-description"
                  >
                    {{ child.description }}
                  </span>
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
                  class="akaza-navigation-menu-content-item"
                >
                  <component
                    :is="nested.as ?? (nested.href ? 'a' : 'button')"
                    :href="nested.href"
                    :to="nested.to"
                    :type="!nested.as && !nested.href ? 'button' : undefined"
                    :disabled="!nested.as && !nested.href ? nested.disabled : undefined"
                    :aria-disabled="nested.disabled || undefined"
                    :aria-current="nested.active ? (nested.ariaCurrent ?? 'page') : undefined"
                    :class="ui?.contentLink"
                    data-akaza-navigation-menu-link
                    class="akaza-navigation-menu-content-link"
                    @click="selectItem(nested, $event)"
                  >
                    <component :is="() => renderSlot(nested, 'item')" v-if="hasSlot(nested, 'item')" />
                    <template v-else>{{ nested.label }}</template>
                  </component>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style>
.akaza-navigation-menu {
  position: relative;
}

.akaza-navigation-menu-list,
.akaza-navigation-menu-content-list {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
}

.akaza-navigation-menu-content {
  position: absolute;
  z-index: var(--akaza-z-navigation-menu, 1000);
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

@media (prefers-reduced-motion: reduce) {
  .akaza-navigation-menu-enter-active,
  .akaza-navigation-menu-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
