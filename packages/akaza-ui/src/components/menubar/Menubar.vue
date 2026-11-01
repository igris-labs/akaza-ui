<script setup lang="ts">
import type { Slot } from "vue";
import type { MenubarItem, MenubarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, provide, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useTypeahead } from "../../composables/typeahead";
import { createChangeDetails } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";
import SlotContent from "../../utils/SlotContent";
import { useRovingFocus } from "../../utils/useRovingFocus";
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
useFocusBranch(contentRef);
const triggerRefs = ref<Array<HTMLElement | null>>([]);
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const openValue = defineModel<string | null>({ default: null });
const activeTriggerIndex = ref(Math.max(0, items.findIndex((item) => !item.disabled)));
const id = useId();
const slots = useSlots() as Record<string, Slot | undefined>;
const { push: pushTypeahead } = useTypeahead();
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
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
const layeredContentStyle = computed(() => ({ ...contentStyle.value, "--akaza-layer-order": String(layerOrder.value) }));



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

function setTriggerRef(el: HTMLElement | null, index: number) {
  triggerRefs.value[index] = el;
}

function setOpen(value: string | null, reason: string, event?: Event) {
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

const roving = useRovingFocus({ items: () => items, isDisabled: item => Boolean(item.disabled), loop: () => loop });

function getNextIndex(index: number, delta: number) {
  return roving.nextIndex(index, delta);
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
    const typeahead = pushTypeahead(event.key.toLowerCase());
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

onClickOutside(rootRef, (event) => {
  if (openValue.value) close("outside-click", event);
}, { ignore: [contentRef] });

watch(openValue, (open) => {
  if (open) register();
  else unregister();
}, { immediate: true });

onUnmounted(() => {
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
      <SlotContent v-if="hasTriggerSlot(item)" :render="slots[item.slot ?? 'trigger']!" :scope="{ item, isOpen: openValue === getItemValue(item) }" />
      <template v-else>
        {{ item.label }}
      </template>
    </button>

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition name="akaza-menubar">
        <div
          v-if="openValue && activeItem?.children"
          :id="getContentId(items.indexOf(activeItem))"
          ref="contentRef"
          :style="layeredContentStyle"
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
