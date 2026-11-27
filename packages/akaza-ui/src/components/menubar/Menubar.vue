<script setup lang="ts">
import type { Slot } from "vue";
import type { MenubarItem, MenubarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { isComposing } from "@ui-sdk/core";
import { computed, nextTick, onUnmounted, provide, shallowReactive, shallowRef, useId, useSlots, useTemplateRef, watch } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { useTypeaheadSearch } from "../../composables/internal/sdk/useTypeaheadSearch";
import { createChangeDetails } from "../../utils/changeEvent";
import SlotContent from "../../utils/SlotContent";
import { MENU_CONTEXT_KEY } from "../menu/context";
import MenuPanel from "../menu/MenuPanel.vue";
import { getMenuItemValue as getItemValue, normalizeMenuItems as normalizeItems, useMenuActions } from "../menu/useMenuActions";

const {
  items,
  loop = true,
  dir = "ltr",
  disabled = false,
  closeOnSelect = true,
  radioValues,
  ariaLabel,
  ariaLabelledby,
  teleport = "body",
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
const triggerRefs = shallowReactive(new Map<string, HTMLElement>());
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const openValue = defineModel<string | null>({ default: null });
const id = useId();
const slots = useSlots() as Record<string, Slot | undefined>;
let disposed = false;
const typeahead = useTypeaheadSearch({
  items: () => items,
  label: item => item.label ?? "",
  disabled: item => disabled || Boolean(item.disabled),
});
const roving = useRovingGroup({
  keys: () => items.map(getItemValue),
  disabled: key => disabled || !items.some(item => getItemValue(item) === key && !item.disabled),
  preferred: () => {
    const first = items.find(item => !item.disabled);
    return first ? getItemValue(first) : undefined;
  },
  orientation: () => "horizontal",
  loop: () => loop,
});
const renderedValue = shallowRef(openValue.value);
watch(openValue, (value) => {
  if (value !== null) renderedValue.value = value;
}, { flush: "sync" });
const isOpen = computed(() => openValue.value !== null);
const activeItem = computed(() => items.find((item) => getItemValue(item) === renderedValue.value));
const activeGroups = computed(() => normalizeItems(activeItem.value?.children));
const activeTriggerRef = computed(() => {
  const key = openValue.value ?? renderedValue.value;
  return key === null ? null : triggerRefs.get(key) ?? null;
});
let requestedValue: string | null = null;
let requestAccepted = false;
const popup = usePopup({
  kind: "menu",
  open: isOpen,
  content: contentRef,
  trigger: () => activeTriggerRef.value,
  anchor: () => activeTriggerRef.value,
  initialFocus: "none",
  finalFocus: () => activeTriggerRef.value,
  disabled: () => disabled,
  side: () => "bottom",
  align: () => "start",
  sideOffset: () => 4,
  collisionPadding: () => 8,
  cssVarPrefix: "akaza-menubar",
  constrainSize: true,
  transition: () => "akaza-menubar",
  request(next, reason, event) {
    reason = reason === "escape-key" ? "escape" : reason === "outside-press" ? "outside-click" : reason;
    requestAccepted = commitOpen(next ? requestedValue : null, reason, event);
  },
});
const { present, contentAttrs, triggerAttrs, actualAlign, actualSide } = popup;
const layeredContentStyle = computed(() => ({ ...popup.style.value, "--akaza-layer-order": String(popup.layerOrder.value) }));



const { onItemSelect, onCheckboxSelect, onRadioSelect, isRadioChecked } = useMenuActions({
  closeOnSelect: () => closeOnSelect,
  radioValues: () => radioValues,
  close,
  onSelect: (item, details) => emit("select", item, details),
  onCheckChange: (item, checked, details) => emit("check-change", item, checked, details),
  onRadioChange: (group, value, details) => emit("radio-change", group, value, details),
  onRadioValuesChange: values => emit("update:radioValues", values),
});

function getTriggerId(index: number) {
  return `${id}-trigger-${index}`;
}

function getContentId(index: number) {
  return `${id}-content-${index}`;
}

function setTriggerRef(el: HTMLElement | null, item: MenubarItem) {
  const key = getItemValue(item);
  if (el) triggerRefs.set(key, el);
  else triggerRefs.delete(key);
  roving.bind(key, el);
}

function commitOpen(value: string | null, reason: string, event?: Event) {
  if (disabled && value) return false;
  if (openValue.value === value) return true;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", value, changeEvent.details);
  if (changeEvent.canceled()) return false;
  openValue.value = value;
  return true;
}

async function openItem(item: MenubarItem, reason: string, event?: Event, focus: "first" | "last" | false = false) {
  if (item.disabled || !item.children) return;
  const key = getItemValue(item);
  if (isOpen.value) {
    if (!commitOpen(key, reason, event)) return;
  } else {
    requestedValue = key;
    requestAccepted = false;
    popup.setOpen(true, reason, event);
    requestedValue = null;
    if (!requestAccepted) return;
  }
  if (!focus) return;
  roving.remember(getItemValue(item));
  await nextTick();
  if (disposed || openValue.value !== getItemValue(item) || disabled || item.disabled) return;
  const panelItems = panelRef.value?.getItems() ?? [];
  const target = focus === "last" ? panelItems[panelItems.length - 1] : panelItems[0];
  if (target) panelRef.value?.highlightItem(target);
}

function close(reason = "programmatic", event?: Event) {
  if (!isOpen.value) return true;
  requestAccepted = false;
  popup.setOpen(false, reason, event);
  return requestAccepted;
}

function focusTrigger(index: number) {
  if (items[index]) roving.focus(getItemValue(items[index]!));
}

function onTriggerClick(item: MenubarItem, event: MouseEvent) {
  if (disabled || item.disabled) return;
  if (item.children) {
    if (openValue.value === getItemValue(item)) close("trigger", event);
    else void openItem(item, "trigger", event);
    return;
  }
  onItemSelect(item, event);
}

function onTriggerKeydown(event: KeyboardEvent, item: MenubarItem, index: number) {
  if (disabled || item.disabled || event.defaultPrevented || isComposing(event) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === " " && typeahead.active()) {
    const next = typeahead.search(event, index);
    if (next >= 0) focusTrigger(next);
    return;
  }
  const movement = roving.keydown(event, event.currentTarget as HTMLElement);
  if (movement) {
    if (movement.key !== movement.from && openValue.value) {
      const next = items.find(item => getItemValue(item) === movement.key);
      if (next?.children) void openItem(next, "keyboard", event);
      else close("keyboard", event);
    }
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    void openItem(item, "keyboard", event, "first");
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    void openItem(item, "keyboard", event, "last");
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (item.children) void openItem(item, "keyboard", event, "first");
    else onItemSelect(item, event);
  } else if (event.key === "Escape") {
    if (!openValue.value) return;
    event.preventDefault();
    close("escape", event);
  } else {
    const next = typeahead.search(event, index);
    if (next >= 0) focusTrigger(next);
  }
}

async function onContentKeydown(event: KeyboardEvent) {
  if (disabled || isComposing(event) || event.ctrlKey || event.metaKey || event.altKey) return;
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (event.defaultPrevented || (event.key !== forward && event.key !== backward) || openValue.value === null) return;
  const trigger = triggerRefs.get(openValue.value);
  if (!trigger) return;
  const movement = roving.keydown(event, trigger);
  if (!movement || movement.key === movement.from) return;
  const nextItem = items.find(item => getItemValue(item) === movement.key);
  if (!nextItem) return;
  if (nextItem.children) await openItem(nextItem, "keyboard", event, "first");
  else close("keyboard", event);
}

function hasTriggerSlot(item: MenubarItem) {
  return Boolean(slots[item.slot ?? "trigger"]);
}

function getTriggerTabindex(item: MenubarItem) {
  return roving.tabIndex(getItemValue(item));
}

watch(() => disabled, (value) => {
  if (value && openValue.value) close("disabled");
});


provide(MENU_CONTEXT_KEY, {
  get dir() { return dir; },
  get ui() { return ui; },
  get radioValues() { return radioValues; },
  get closeOnSelect() { return closeOnSelect; },
  closeMenu: close,
  onItemSelect,
  onCheckboxSelect,
  onRadioSelect,
  isRadioChecked,
  getItemValue,
  normalizeItems,
  rootSlots: slots,
});

watch(openValue, () => {
  typeahead.reset();
}, { immediate: true });

onUnmounted(() => {
  disposed = true;
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
      v-bind="openValue === getItemValue(item) ? triggerAttrs : {}"
      :id="getTriggerId(index)"
      :key="getItemValue(item)"
      :ref="(el) => setTriggerRef(el as HTMLElement | null, item)"
      type="button"
      role="menuitem"
      :aria-haspopup="item.children ? 'menu' : undefined"
      :aria-expanded="item.children ? openValue === getItemValue(item) : undefined"
      :aria-controls="item.children ? getContentId(index) : undefined"
      :disabled="disabled || Boolean(item.disabled)"
      :tabindex="getTriggerTabindex(item)"
      :data-akaza-state="openValue === getItemValue(item) ? 'open' : 'closed'"
      :data-akaza-disabled="disabled || Boolean(item.disabled) || undefined"
      :class="ui?.trigger"
      class="akaza-menubar-trigger"
      @click="onTriggerClick(item, $event)"
      @keydown="onTriggerKeydown($event, item, index)"
      @mouseenter="openValue && item.children && openItem(item, 'hover', $event)"
    >
      <SlotContent v-if="hasTriggerSlot(item)" :render="slots[item.slot ?? 'trigger']!" :scope="{ item, isOpen: openValue === getItemValue(item) }" />
      <template v-else>
        {{ item.label }}
      </template>
    </button>

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <div
        v-if="present && activeItem?.children"
        v-bind="contentAttrs"
        :id="getContentId(items.indexOf(activeItem))"
        ref="contentRef"
        role="presentation"
        :dir="dir"
        :style="layeredContentStyle"
        :class="ui?.content"
        :data-akaza-state="isOpen ? 'open' : 'closed'"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        class="akaza-menubar-content akaza-menu-content"
        @keydown="onContentKeydown"
      >
        <MenuPanel
          :key="getItemValue(activeItem)"
          ref="panelRef"
          :items="activeGroups"
          :open="isOpen"
          :aria-labelledby="getTriggerId(items.indexOf(activeItem))"
          @navigate="onContentKeydown"
        />
      </div>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-menubar {
    position: relative;
    display: inline-flex;
  }

  .akaza-menubar-content {
    transform-origin: var(--akaza-menubar-transform-origin);
    position: absolute;
    z-index: var(--akaza-z-menubar, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
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
}
</style>
