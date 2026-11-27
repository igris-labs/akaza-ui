<script setup lang="ts">
import type { MenuItem } from ".";
import { isComposing } from "@ui-sdk/core";
import { computed, inject, nextTick, ref, useId, useTemplateRef, watch } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { useTypeaheadSearch } from "../../composables/internal/sdk/useTypeaheadSearch";
import SlotContent from "../../utils/SlotContent";
import { useDelayedAction } from "../../utils/useDelayedAction";
import { MENU_CONTEXT_KEY } from "./context";

defineOptions({ name: "MenuPanel" });

const { items, ariaLabelledby, open = true } = defineProps<{
  items: MenuItem[][];
  ariaLabelledby?: string;
  open?: boolean;
}>();
const emit = defineEmits<{ navigate: [event: KeyboardEvent] }>();

const ctx = inject(MENU_CONTEXT_KEY)!;

const panelRef = useTemplateRef<HTMLElement>("panelRef");
const groups = computed(() => {
  const occurrences = new Map<string, number>();
  return items.map(group => group.map(item => {
    const identity = ctx.getItemValue(item);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return { item, key: JSON.stringify([identity, occurrence]) };
  }));
});
const itemByKey = computed(() => new Map(groups.value.flat()
  .filter(({ item }) => item.type !== "separator" && item.type !== "label")
  .map(({ item, key }) => [key, item])));
const keys = computed(() => [...itemByKey.value.keys()]);
const elementKeys = new WeakMap<HTMLElement, string>();
const hasFocused = ref(false);
const roving = useRovingGroup({
  keys: () => keys.value,
  disabled: key => !itemByKey.value.has(key) || Boolean(itemByKey.value.get(key)?.disabled),
  preferred: () => undefined,
  orientation: () => "vertical",
  loop: () => true,
});

function bindItem(key: string, element: HTMLElement | null) {
  if (element) elementKeys.set(element, key);
  roving.bind(key, element);
}

function onPanelFocus(event: FocusEvent) {
  if ((event.target as HTMLElement).closest('[role="menu"]') === panelRef.value) hasFocused.value = true;
}

function findSubmenu(value: string) {
  return Array.from(panelRef.value?.querySelectorAll<HTMLElement>(".akaza-menu-submenu-content") ?? [])
    .find(element => element.dataset.akazaSubmenu === value)?.querySelector<HTMLElement>('[role="menu"]');
}
const activeSubmenu = ref<string | null>(null);
const submenuClose = useDelayedAction();
const renderedSubmenu = ref<string | null>(null);
watch(activeSubmenu, (value) => {
  if (value !== null) renderedSubmenu.value = value;
}, { flush: "sync" });
const submenuContent = ref<HTMLElement | null>(null);
const submenuId = `akaza-menu-submenu-${useId()}`;
const submenuTriggerId = `${submenuId}-trigger`;
function getSubmenuTrigger() {
  return Array.from(panelRef.value?.querySelectorAll<HTMLElement>(".akaza-menu-submenu-trigger") ?? [])
    .find(element => element.dataset.akazaValue === renderedSubmenu.value && element.closest('[role="menu"]') === panelRef.value) ?? null;
}
const submenuOptions = computed(() => items.flat().find(item => ctx.getItemValue(item) === renderedSubmenu.value)?.submenu);
const submenuOpen = computed(() => open && activeSubmenu.value !== null);
const submenuPopup = usePopup({
  kind: "menu",
  open: submenuOpen,
  content: submenuContent,
  trigger: getSubmenuTrigger,
  anchor: () => submenuOptions.value?.anchor === "parent"
  ? panelRef.value?.closest<HTMLElement>(".akaza-menu-content, .akaza-context-menu-content, .akaza-menubar-content") ?? panelRef.value
  : getSubmenuTrigger(),
  initialFocus: "none",
  finalFocus: getSubmenuTrigger,
  side: () => ctx.dir === "rtl" ? "left" : "right",
  align: () => submenuOptions.value?.align ?? "start",
  sideOffset: () => submenuOptions.value?.sideOffset ?? 0,
  alignOffset: () => submenuOptions.value?.alignOffset ?? 0,
  collisionPadding: () => 8,
  constrainSize: true,
  cssVarPrefix: "akaza-menu-submenu",
  transition: () => "akaza-menu",
  request(next) {
    if (next) return;
    submenuClose.cancel();
    activeSubmenu.value = null;
  },
});
const submenuStyle = computed(() => ({
  ...submenuPopup.style.value,
  "--akaza-layer-order": String(submenuPopup.layerOrder.value),
}));

function setSubmenuContent(element: HTMLElement | null, value: string) {
  if (element && renderedSubmenu.value === value) submenuContent.value = element;
  else if (!element && submenuContent.value?.dataset.akazaSubmenu === value) submenuContent.value = null;
}

// ── Focus / highlight ────────────────────────────────────────────────────────

const FOCUSABLE =
  '[role="menuitem"]:not([aria-disabled]),[role="menuitemcheckbox"]:not([aria-disabled]),[role="menuitemradio"]:not([aria-disabled])';

function getItems(container?: HTMLElement | null): HTMLElement[] {
  // Only direct children — don't reach into nested submenu panels
  const el = container ?? panelRef.value;
  if (!el) return [];
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (item) => item.closest('[role="menu"]') === el,
  );
}

function highlightItem(el: HTMLElement) {
  el.focus({ preventScroll: true });
}

// ── Typeahead ────────────────────────────────────────────────────────────────

const typeahead = useTypeaheadSearch({
  items: getItems,
  label: element => itemByKey.value.get(elementKeys.get(element) ?? "")?.label ?? element.textContent?.trim() ?? "",
});

function onTypeahead(event: KeyboardEvent, itemEls: HTMLElement[]) {
  const match = typeahead.search(event, itemEls.indexOf(document.activeElement as HTMLElement));
  if (match >= 0) highlightItem(itemEls[match]!);
}

function onItemKeydown(event: KeyboardEvent, item: MenuItem, activate: (item: MenuItem, event: KeyboardEvent) => void) {
  if (event.defaultPrevented || isComposing(event) || item.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === " " && typeahead.active()) {
    onTypeahead(event, getItems());
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate(item, event);
  }
}

// ── Keyboard ─────────────────────────────────────────────────────────────────

function onPanelKeydown(e: KeyboardEvent) {
  if (e.defaultPrevented || isComposing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
  const itemEls = getItems();
  if (!itemEls.length) return;
  const focused = document.activeElement as HTMLElement;
  if (!itemEls.includes(focused)) return;
  if (e.key === " " && typeahead.active()) {
    onTypeahead(e, itemEls);
    return;
  }
  const openSubmenuKey = ctx.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const closeSubmenuKey = ctx.dir === "rtl" ? "ArrowRight" : "ArrowLeft";

  if (e.key === openSubmenuKey) {
    const target = document.activeElement as HTMLElement;
    if (target?.getAttribute("aria-haspopup") === "menu") {
      e.preventDefault();
      e.stopPropagation();
      const value = target.getAttribute("data-akaza-value");
      if (value !== null) {
        cancelSubmenuClose();
        activeSubmenu.value = value;
        nextTick(() => {
          if (!open || activeSubmenu.value !== value) return;
          const submenu = findSubmenu(value);
          const first = getItems(submenu)?.[0];
          if (first) highlightItem(first);
        });
      }
    } else {
      emit("navigate", e);
      e.preventDefault();
    }
    return;
  }

  if (e.key === "Escape") return;
  if (e.key === closeSubmenuKey) {
    emit("navigate", e);
    e.preventDefault();
    return;
  }

  if (!roving.keydown(e, focused)) onTypeahead(e, itemEls);
}

// ── Submenu state (per-level) ────────────────────────────────────────────────

watch(() => open, (value) => {
  if (value) return;
  submenuClose.cancel();
  activeSubmenu.value = null;
}, { flush: "sync" });
watch(() => items, () => {
  if (activeSubmenu.value === null) return;
  if (items.flat().some(item => ctx.getItemValue(item) === activeSubmenu.value && item.children && !item.disabled)) return;
  submenuClose.cancel();
  activeSubmenu.value = null;
});

function openSubmenu(item: MenuItem) {
  if (!open || item.disabled) return;
  submenuClose.cancel();
  activeSubmenu.value = ctx.getItemValue(item);
}

function openSubmenuAndFocus(item: MenuItem) {
  openSubmenu(item);
  nextTick(() => {
    if (!open || activeSubmenu.value !== ctx.getItemValue(item)) return;
    const sub = findSubmenu(ctx.getItemValue(item));
    const first = getItems(sub)?.[0];
    if (first) highlightItem(first);
  });
}

function closeSubmenuDelayed() {
  submenuClose.schedule(() => {
    // Pointer movement must not remove the current keyboard focus.
    if (submenuContent.value?.contains(document.activeElement)) return;
    activeSubmenu.value = null;
  }, 150);
}

function cancelSubmenuClose() {
  submenuClose.cancel();
}

function onSubmenuKeydown(e: KeyboardEvent) {
  if (isComposing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
  const closeSubmenuKey = ctx.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  if (e.key === closeSubmenuKey) {
    e.preventDefault();
    e.stopPropagation();
    submenuPopup.setOpen(false, "keyboard", e);
  }
}

// ── Slot rendering helper ────────────────────────────────────────────────────
// Renders a root-level slot if it exists, otherwise falls back to default content.

function hasRootSlot(name: string): boolean {
  return !!ctx.rootSlots[name];
}

defineExpose({ panelRef, getItems, highlightItem });
</script>

<template>
  <div
    ref="panelRef"
    role="menu"
    aria-orientation="vertical"
    :aria-labelledby="ariaLabelledby"
    :dir="ctx.dir"
    :class="ctx.ui?.panel"
    class="akaza-menu-panel"
    @keydown="onPanelKeydown"
    @focusin="onPanelFocus"
  >
    <template v-for="(group, gi) in groups" :key="gi">
      <div
        v-if="gi > 0"
        role="separator"
        :class="ctx.ui?.separator"
        class="akaza-menu-separator"
      />

      <div :class="ctx.ui?.group" class="akaza-menu-group" role="group">
        <template
          v-for="{ item, key } in group"
          :key="key"
        >
          <!-- ── Separator ──────────────────────────────────────────── -->
          <div
            v-if="item.type === 'separator'"
            role="separator"
            :class="ctx.ui?.separator"
            class="akaza-menu-separator"
          />

          <!-- ── Label ──────────────────────────────────────────────── -->
          <div
            v-else-if="item.type === 'label'"
            :class="ctx.ui?.label"
            class="akaza-menu-label"
          >
            <SlotContent
              v-if="hasRootSlot(item.slot ?? 'label')"
              :render="ctx.rootSlots[item.slot ?? 'label']!"
              :scope="{ item }"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Checkbox item ──────────────────────────────────────── -->
          <div
            v-else-if="item.type === 'checkbox'"
            :ref="(element) => bindItem(key, element as HTMLElement | null)"
            role="menuitemcheckbox"
            :aria-checked="item.checked ?? false"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :data-akaza-state="item.checked ? 'checked' : 'unchecked'"
            :tabindex="roving.tabIndex(key)"
            :data-akaza-highlighted="hasFocused && key === roving.tabStop.value ? '' : undefined"
            :class="[ctx.ui?.item, ctx.ui?.checkboxItem]"
            class="akaza-menu-item akaza-menu-checkbox-item"
            @click="ctx.onCheckboxSelect(item, $event)"
            @keydown="onItemKeydown($event, item, ctx.onCheckboxSelect)"
          >
            <SlotContent
              v-if="hasRootSlot(item.slot ?? 'checkbox-item')"
              :render="ctx.rootSlots[item.slot ?? 'checkbox-item']!"
              :scope="{ item, checked: item.checked }"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Radio item ─────────────────────────────────────────── -->
          <div
            v-else-if="item.type === 'radio'"
            :ref="(element) => bindItem(key, element as HTMLElement | null)"
            role="menuitemradio"
            :aria-checked="ctx.isRadioChecked(item)"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :data-akaza-state="
              ctx.isRadioChecked(item) ? 'checked' : 'unchecked'
            "
            :tabindex="roving.tabIndex(key)"
            :data-akaza-highlighted="hasFocused && key === roving.tabStop.value ? '' : undefined"
            :class="[ctx.ui?.item, ctx.ui?.radioItem]"
            class="akaza-menu-item akaza-menu-radio-item"
            @click="ctx.onRadioSelect(item, $event)"
            @keydown="onItemKeydown($event, item, ctx.onRadioSelect)"
          >
            <SlotContent
              v-if="hasRootSlot(item.slot ?? 'radio-item')"
              :render="ctx.rootSlots[item.slot ?? 'radio-item']!"
              :scope="{ item, checked: ctx.isRadioChecked(item) }"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Submenu item ───────────────────────────────────────── -->
          <div
            v-else-if="item.children"
            :class="ctx.ui?.submenu"
            :data-akaza-state="activeSubmenu === ctx.getItemValue(item) ? 'open' : 'closed'"
            class="akaza-menu-submenu"
            @mouseenter="openSubmenu(item)"
            @mouseleave="closeSubmenuDelayed()"
          >
            <div
              v-bind="renderedSubmenu === ctx.getItemValue(item) ? submenuPopup.triggerAttrs.value : {}"
              :id="renderedSubmenu === ctx.getItemValue(item) ? submenuTriggerId : undefined"
              :ref="(element) => bindItem(key, element as HTMLElement | null)"
              role="menuitem"
              aria-haspopup="menu"
              :aria-expanded="activeSubmenu === ctx.getItemValue(item)"
              :aria-controls="activeSubmenu === ctx.getItemValue(item) ? submenuId : undefined"
              :aria-disabled="item.disabled || undefined"
              :data-akaza-disabled="item.disabled || undefined"
              :data-akaza-state="activeSubmenu === ctx.getItemValue(item) ? 'open' : 'closed'"
              :data-akaza-value="ctx.getItemValue(item)"
              :tabindex="roving.tabIndex(key)"
              :data-akaza-highlighted="hasFocused && key === roving.tabStop.value ? '' : undefined"
              :class="[ctx.ui?.item, ctx.ui?.submenuTrigger]"
              class="akaza-menu-item akaza-menu-submenu-trigger"
              @click="openSubmenuAndFocus(item)"
              @keydown="onItemKeydown($event, item, openSubmenuAndFocus)"
            >
              <SlotContent
                v-if="hasRootSlot(item.slot ?? 'item')"
                :render="ctx.rootSlots[item.slot ?? 'item']!"
                :scope="{ item, hasSubmenu: true }"
              />
              <template v-else>{{ item.label }}</template>
            </div>

            <div
              v-if="submenuPopup.present.value && renderedSubmenu === ctx.getItemValue(item)"
              v-bind="submenuPopup.contentAttrs.value"
              :id="submenuId"
              :ref="(el) => setSubmenuContent(el as HTMLElement | null, ctx.getItemValue(item))"
              role="presentation"
              :data-akaza-submenu="ctx.getItemValue(item)"
              :data-akaza-state="submenuOpen ? 'open' : 'closed'"
              :data-akaza-side="submenuPopup.actualSide.value"
              :data-akaza-align="submenuPopup.actualAlign.value"
              :style="submenuStyle"
              :class="ctx.ui?.submenuContent"
              class="akaza-menu-content akaza-menu-submenu-content"
              @keydown.stop="onSubmenuKeydown"
              @mouseenter="cancelSubmenuClose()"
              @mouseleave="closeSubmenuDelayed()"
            >
              <!-- Recursive! -->
              <MenuPanel :items="ctx.normalizeItems(item.children)" :open="submenuOpen" :aria-labelledby="submenuTriggerId" />
            </div>
          </div>

          <!-- ── Regular item (default) ─────────────────────────────── -->
          <div
            v-else
            :ref="(element) => bindItem(key, element as HTMLElement | null)"
            role="menuitem"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :tabindex="roving.tabIndex(key)"
            :data-akaza-highlighted="hasFocused && key === roving.tabStop.value ? '' : undefined"
            :class="ctx.ui?.item"
            class="akaza-menu-item"
            @click="ctx.onItemSelect(item, $event)"
            @keydown="onItemKeydown($event, item, ctx.onItemSelect)"
          >
            <SlotContent
              v-if="hasRootSlot(item.slot ?? 'item')"
              :render="ctx.rootSlots[item.slot ?? 'item']!"
              :scope="{ item, hasSubmenu: false }"
            />
            <template v-else>{{ item.label }}</template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
