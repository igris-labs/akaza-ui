<script setup lang="ts">
import type { Slot } from "vue";
import type { MenubarItem, MenubarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, provide, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { MENU_CONTEXT_KEY } from "../menu/context";
import MenuPanel from "../menu/MenuPanel.vue";

const {
  items,
  loop = true,
  dir = "ltr",
  disabled = false,
  closeOnSelect = true,
  radioValues,
  ariaLabel,
  ariaLabelledby,
  ui,
} = defineProps<MenubarProps>();

const emit = defineEmits<{
  "open-change": [value: string | null, details: AkazaChangeEventDetails];
  select: [item: MenuItem, details: AkazaChangeEventDetails];
  "check-change": [item: MenuItem, checked: boolean, details: AkazaChangeEventDetails];
  "radio-change": [group: string, value: string, details: AkazaChangeEventDetails];
  "update:radioValues": [values: Record<string, string>];
}>();

const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const triggerRefs = ref<Array<HTMLElement | null>>([]);
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const openValue = defineModel<string | null>({ default: null });
const activeTriggerIndex = ref(Math.max(0, items.findIndex((item) => !item.disabled)));
const id = useId();
const slots = useSlots() as Record<string, Slot | undefined>;
let typeahead = "";
let typeaheadTimer: number | undefined;
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
  const index = items.findIndex((item) => getItemValue(item) === openValue.value);
  close("escape", event);
  if (index >= 0) focusTrigger(index);
});

const activeItem = computed(() => items.find((item) => getItemValue(item) === openValue.value));
const activeGroups = computed(() => normalizeItems(activeItem.value?.children));
const activeTriggerRef = computed(() => {
  const index = items.findIndex((item) => getItemValue(item) === openValue.value);
  return index >= 0 ? triggerRefs.value[index] ?? null : null;
});
const { actualAlign, actualSide, style: contentStyle } = useFloatingPosition({
  reference: activeTriggerRef,
  floating: contentRef,
  active: () => Boolean(openValue.value),
  side: "bottom",
  align: "start",
  sideOffset: 4,
  cssVarPrefix: "akaza-menubar",
});

function normalizeItems(raw?: MenuItem[] | MenuItem[][]): MenuItem[][] {
  if (!raw?.length) return [];
  return Array.isArray(raw[0]) ? (raw as MenuItem[][]) : [raw as MenuItem[]];
}

function getItemValue(item: MenuItem): string {
  return (item.value ?? item.label ?? "") as string;
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

function setOpen(value: string | null, reason: string, event?: Event) {
  if (disabled && value) return false;
  if (openValue.value === value) return true;
  let canceled = false;
  emit("open-change", value, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return false;
  openValue.value = value;
  return true;
}

async function openItem(item: MenubarItem, reason: string, event?: Event, focus: "first" | "last" | false = false) {
  if (item.disabled || !item.children) return;
  if (!setOpen(getItemValue(item), reason, event)) return;
  if (!focus) return;
  await nextTick();
  const panelItems = panelRef.value?.getItems() ?? [];
  const target = focus === "last" ? panelItems[panelItems.length - 1] : panelItems[0];
  if (target) panelRef.value?.highlightItem(target);
}

function close(reason = "programmatic", event?: Event) {
  setOpen(null, reason, event);
}

function focusTrigger(index: number) {
  activeTriggerIndex.value = index;
  triggerRefs.value[index]?.focus();
}

function getNextIndex(index: number, delta: number) {
  const count = items.length;
  let next = index;
  for (let step = 0; step < count; step++) {
    next += delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return -1;
    if (!items[next]?.disabled) {
      return next;
    }
  }
  return -1;
}

function move(index: number, delta: number) {
  const next = getNextIndex(index, delta);
  if (next < 0) return;
  focusTrigger(next);
  if (openValue.value) void openItem(items[next]!, "keyboard");
}

function onTriggerClick(item: MenubarItem, event: MouseEvent) {
  if (item.disabled) return;
  if (item.children) {
    if (openValue.value === getItemValue(item)) close("trigger", event);
    else void openItem(item, "trigger", event);
    return;
  }
  onItemSelect(item, event);
}

function onTriggerKeydown(event: KeyboardEvent, item: MenubarItem, index: number) {
  const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (event.key === nextKey) {
    event.preventDefault();
    move(index, 1);
  } else if (event.key === previousKey) {
    event.preventDefault();
    move(index, -1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    void openItem(item, "keyboard", event, "first");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    void openItem(item, "keyboard", event, "last");
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (item.children) void openItem(item, "keyboard", event, "first");
    else onItemSelect(item, event);
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
  } else if (event.key === "Escape") {
    if (!openValue.value) return;
    event.preventDefault();
    close("escape", event);
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead += event.key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => { typeahead = ""; }, 500);
    const next = items.findIndex((candidate) =>
      !candidate.disabled && candidate.label?.toLowerCase().startsWith(typeahead),
    );
    if (next >= 0) focusTrigger(next);
  }
}

async function onContentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    const index = items.findIndex((item) => getItemValue(item) === openValue.value);
    close("escape", event);
    if (index >= 0) focusTrigger(index);
    return;
  }
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (event.key !== forward && event.key !== backward) return;
  const index = items.findIndex((item) => getItemValue(item) === openValue.value);
  const next = getNextIndex(index, event.key === forward ? 1 : -1);
  if (next < 0) return;
  event.preventDefault();
  const nextItem = items[next]!;
  focusTrigger(next);
  if (nextItem.children) await openItem(nextItem, "keyboard", event, "first");
  else close("keyboard", event);
}

function onTriggerFocus(index: number) {
  activeTriggerIndex.value = index;
}

function hasTriggerSlot(item: MenubarItem) {
  return Boolean(slots[item.slot ?? "trigger"]);
}

function getTriggerSlot(item: MenubarItem) {
  return slots[item.slot ?? "trigger"]!({
    item,
    isOpen: openValue.value === getItemValue(item),
  });
}

function getTriggerTabindex(item: MenubarItem, index: number) {
  if (item.disabled || disabled) return -1;
  const active = items[activeTriggerIndex.value];
  if (active?.disabled) return index === items.findIndex((candidate) => !candidate.disabled) ? 0 : -1;
  return index === activeTriggerIndex.value ? 0 : -1;
}

watch(() => disabled, (value) => {
  if (value && openValue.value) close("disabled");
});

watch(() => items.length, () => {
  if (!items[activeTriggerIndex.value] || items[activeTriggerIndex.value]?.disabled) {
    activeTriggerIndex.value = Math.max(0, items.findIndex((item) => !item.disabled));
  }
});

function onItemSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  let canceled = false;
  emit("select", item, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  item.onSelect?.();
  if (closeOnSelect) close("select", event);
}

function onCheckboxSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  const next = !item.checked;
  let canceled = false;
  emit("check-change", item, next, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) item.onUpdateChecked?.(next);
}

function isRadioChecked(item: MenuItem): boolean {
  return radioValues?.[item.radioGroup ?? ""] === item.value;
}

function onRadioSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  const group = item.radioGroup ?? "";
  const value = (item.value ?? "") as string;
  let canceled = false;
  emit("radio-change", group, value, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled && radioValues) emit("update:radioValues", { ...radioValues, [group]: value });
}

provide(MENU_CONTEXT_KEY, {
  dir,
  ui,
  radioValues,
  closeOnSelect,
  closeMenu: close,
  onItemSelect,
  onCheckboxSelect,
  onRadioSelect,
  isRadioChecked,
  getItemValue,
  normalizeItems,
  rootSlots: slots,
});

onClickOutside(rootRef, (event) => {
  if (openValue.value) close("outside-click", event);
}, { ignore: [contentRef] });

watch(openValue, (open) => {
  if (open) register();
  else unregister();
}, { immediate: true });

onUnmounted(() => {
  window.clearTimeout(typeaheadTimer);
  unregister();
});
</script>

<template>
  <div
    ref="rootRef"
    role="menubar"
    :dir="dir"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :data-akaza-state="openValue ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    :class="ui?.root"
    class="akaza-menubar"
  >
    <button
      v-for="(item, index) in items"
      :id="getTriggerId(index)"
      :key="getItemValue(item)"
      :ref="(el) => setTriggerRef(el as HTMLElement | null, index)"
      type="button"
      role="menuitem"
      :aria-haspopup="item.children ? 'menu' : undefined"
      :aria-expanded="item.children ? openValue === getItemValue(item) : undefined"
      :aria-controls="item.children ? getContentId(index) : undefined"
      :disabled="disabled || Boolean(item.disabled)"
      :tabindex="getTriggerTabindex(item, index)"
      :data-akaza-state="openValue === getItemValue(item) ? 'open' : 'closed'"
      :data-akaza-disabled="disabled || Boolean(item.disabled) || undefined"
      :class="ui?.trigger"
      class="akaza-menubar-trigger"
      @click="onTriggerClick(item, $event)"
      @focus="onTriggerFocus(index)"
      @keydown="onTriggerKeydown($event, item, index)"
      @mouseenter="openValue && item.children && openItem(item, 'hover', $event)"
    >
      <component :is="() => getTriggerSlot(item)" v-if="hasTriggerSlot(item)" />
      <template v-else>
        {{ item.label }}
      </template>
    </button>

    <Transition name="akaza-menubar">
      <div
        v-if="openValue && activeItem?.children"
        :id="getContentId(items.indexOf(activeItem))"
        ref="contentRef"
        :style="contentStyle"
        :class="ui?.content"
        data-akaza-state="open"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        class="akaza-menubar-content akaza-menu-content"
        @keydown="onContentKeydown"
      >
        <MenuPanel
          ref="panelRef"
          :items="activeGroups"
          :aria-labelledby="getTriggerId(items.indexOf(activeItem))"
        />
      </div>
    </Transition>
  </div>
</template>

<style>
.akaza-menubar {
  position: relative;
  display: inline-flex;
  isolation: isolate;
}

.akaza-menubar-content {
  position: absolute;
  z-index: var(--akaza-z-menubar, 1000);
}

.akaza-menubar-enter-active,
.akaza-menubar-leave-active {
  transition:
    opacity var(--akaza-menubar-duration, 120ms) ease-out,
    scale var(--akaza-menubar-duration, 120ms) ease-out,
    translate var(--akaza-menubar-duration, 120ms) ease-out;
}

.akaza-menubar-enter-from,
.akaza-menubar-leave-to {
  opacity: 0;
  scale: 0.98;
}

.akaza-menubar-enter-from[data-akaza-side="bottom"],
.akaza-menubar-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
.akaza-menubar-enter-from[data-akaza-side="top"],
.akaza-menubar-leave-to[data-akaza-side="top"] { translate: 0 4px; }

@media (prefers-reduced-motion: reduce) {
  .akaza-menubar-enter-active,
  .akaza-menubar-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
