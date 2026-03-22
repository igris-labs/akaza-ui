<script setup lang="ts">
import type { MenuItem } from ".";
import { inject, nextTick, ref, useTemplateRef } from "vue";
import { MENU_CONTEXT_KEY } from "./context";

defineOptions({ name: "MenuPanel" });

const { items } = defineProps<{
  items: MenuItem[][];
}>();

const ctx = inject(MENU_CONTEXT_KEY)!;

const panelRef = useTemplateRef<HTMLElement>("panelRef");
const activeSubmenu = ref<string | null>(null);

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
  const root = el.closest('[role="menu"]') as HTMLElement | null;
  getItems(root).forEach((i) => i.removeAttribute("data-akaza-highlighted"));
  el.setAttribute("data-akaza-highlighted", "");
  el.focus();
}

// ── Typeahead ────────────────────────────────────────────────────────────────

let typeaheadBuffer = "";
let typeaheadTimer: ReturnType<typeof setTimeout>;

function onTypeahead(char: string, itemEls: HTMLElement[]) {
  typeaheadBuffer += char.toLowerCase();
  clearTimeout(typeaheadTimer);
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = "";
  }, 500);

  const match = itemEls.find((el) =>
    el.textContent?.trim().toLowerCase().startsWith(typeaheadBuffer),
  );
  if (match) highlightItem(match);
}

// ── Keyboard ─────────────────────────────────────────────────────────────────

function onPanelKeydown(e: KeyboardEvent) {
  const itemEls = getItems();
  if (!itemEls.length) return;
  const current = itemEls.indexOf(document.activeElement as HTMLElement);

  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault();
      const next = itemEls[current < itemEls.length - 1 ? current + 1 : 0];
      if (next) highlightItem(next);
      break;
    }
    case "ArrowUp": {
      e.preventDefault();
      const prev = itemEls[current > 0 ? current - 1 : itemEls.length - 1];
      if (prev) highlightItem(prev);
      break;
    }
    case "Home": {
      e.preventDefault();
      const first = itemEls[0];
      if (first) highlightItem(first);
      break;
    }
    case "End": {
      e.preventDefault();
      const last = itemEls[itemEls.length - 1];
      if (last) highlightItem(last);
      break;
    }
    case "ArrowRight": {
      e.preventDefault();
      const target = document.activeElement as HTMLElement;
      if (target?.getAttribute("aria-haspopup") === "menu") {
        const val = target.getAttribute("data-akaza-value");
        if (val) {
          activeSubmenu.value = val;
          nextTick(() => {
            // Find the nested MenuPanel's [role="menu"] div inside the submenu content wrapper
            const sub = panelRef.value?.querySelector<HTMLElement>(
              `.akaza-menu-submenu-content[data-akaza-submenu="${val}"] > [role="menu"]`,
            );
            const first = getItems(sub)?.[0];
            if (first) highlightItem(first);
          });
        }
      }
      break;
    }
    case "ArrowLeft":
    case "Escape": {
      e.preventDefault();
      // Let event propagate to parent for submenu close handling
      break;
    }
    default: {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onTypeahead(e.key, itemEls);
      }
    }
  }
}

// ── Submenu state (per-level) ────────────────────────────────────────────────

let submenuCloseTimer: ReturnType<typeof setTimeout>;

function openSubmenu(item: MenuItem) {
  if (item.disabled) return;
  clearTimeout(submenuCloseTimer);
  activeSubmenu.value = ctx.getItemValue(item);
}

function closeSubmenuDelayed() {
  submenuCloseTimer = setTimeout(() => {
    activeSubmenu.value = null;
  }, 150);
}

function cancelSubmenuClose() {
  clearTimeout(submenuCloseTimer);
}

function onSubmenuKeydown(e: KeyboardEvent, item: MenuItem) {
  if (e.key === "ArrowLeft" || e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    activeSubmenu.value = null;
    const trigger = panelRef.value?.querySelector<HTMLElement>(
      `[data-akaza-value="${ctx.getItemValue(item)}"]`,
    );
    trigger?.focus();
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
    @keydown="onPanelKeydown"
  >
    <template v-for="(group, gi) in items" :key="gi">
      <div
        v-if="gi > 0"
        role="separator"
        :class="ctx.ui?.separator"
        class="akaza-menu-separator"
      />

      <div :class="ctx.ui?.group" class="akaza-menu-group" role="group">
        <template
          v-for="(item, ii) in group"
          :key="item.value ?? `${gi}-${ii}`"
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
            <component
              :is="() => ctx.rootSlots[item.slot ?? 'label']!({ item })"
              v-if="hasRootSlot(item.slot ?? 'label')"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Checkbox item ──────────────────────────────────────── -->
          <div
            v-else-if="item.type === 'checkbox'"
            role="menuitemcheckbox"
            :aria-checked="item.checked ?? false"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :data-akaza-state="item.checked ? 'checked' : 'unchecked'"
            :tabindex="item.disabled ? -1 : 0"
            :class="ctx.ui?.item"
            class="akaza-menu-item akaza-menu-checkbox-item"
            @click="ctx.onCheckboxSelect(item, $event)"
            @keydown.enter.prevent="ctx.onCheckboxSelect(item, $event)"
            @keydown.space.prevent="ctx.onCheckboxSelect(item, $event)"
          >
            <component
              :is="
                () =>
                  ctx.rootSlots[item.slot ?? 'checkbox-item']!({
                    item,
                    checked: item.checked,
                  })
              "
              v-if="hasRootSlot(item.slot ?? 'checkbox-item')"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Radio item ─────────────────────────────────────────── -->
          <div
            v-else-if="item.type === 'radio'"
            role="menuitemradio"
            :aria-checked="ctx.isRadioChecked(item)"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :data-akaza-state="
              ctx.isRadioChecked(item) ? 'checked' : 'unchecked'
            "
            :tabindex="item.disabled ? -1 : 0"
            :class="ctx.ui?.item"
            class="akaza-menu-item akaza-menu-radio-item"
            @click="ctx.onRadioSelect(item, $event)"
            @keydown.enter.prevent="ctx.onRadioSelect(item, $event)"
            @keydown.space.prevent="ctx.onRadioSelect(item, $event)"
          >
            <component
              :is="
                () =>
                  ctx.rootSlots[item.slot ?? 'radio-item']!({
                    item,
                    checked: ctx.isRadioChecked(item),
                  })
              "
              v-if="hasRootSlot(item.slot ?? 'radio-item')"
            />
            <template v-else>{{ item.label }}</template>
          </div>

          <!-- ── Submenu item ───────────────────────────────────────── -->
          <div
            v-else-if="item.children"
            class="akaza-menu-submenu"
            @mouseenter="openSubmenu(item)"
            @mouseleave="closeSubmenuDelayed()"
          >
            <div
              role="menuitem"
              aria-haspopup="menu"
              :aria-expanded="activeSubmenu === ctx.getItemValue(item)"
              :aria-disabled="item.disabled || undefined"
              :data-akaza-disabled="item.disabled || undefined"
              :data-akaza-value="ctx.getItemValue(item)"
              :tabindex="item.disabled ? -1 : 0"
              :class="ctx.ui?.item"
              class="akaza-menu-item akaza-menu-submenu-trigger"
            >
              <component
                :is="
                  () =>
                    ctx.rootSlots[item.slot ?? 'item']!({
                      item,
                      hasSubmenu: true,
                    })
                "
                v-if="hasRootSlot(item.slot ?? 'item')"
              />
              <template v-else>{{ item.label }}</template>
            </div>

            <Transition name="akaza-menu">
              <div
                v-if="activeSubmenu === ctx.getItemValue(item)"
                :data-akaza-submenu="ctx.getItemValue(item)"
                :class="ctx.ui?.submenuContent"
                class="akaza-menu-content akaza-menu-submenu-content"
                @keydown.stop="onSubmenuKeydown($event, item)"
                @mouseenter="cancelSubmenuClose()"
                @mouseleave="closeSubmenuDelayed()"
              >
                <!-- Recursive! -->
                <MenuPanel :items="ctx.normalizeItems(item.children)" />
              </div>
            </Transition>
          </div>

          <!-- ── Regular item (default) ─────────────────────────────── -->
          <div
            v-else
            role="menuitem"
            :aria-disabled="item.disabled || undefined"
            :data-akaza-disabled="item.disabled || undefined"
            :tabindex="item.disabled ? -1 : 0"
            :class="ctx.ui?.item"
            class="akaza-menu-item"
            @click="ctx.onItemSelect(item, $event)"
            @keydown.enter.prevent="ctx.onItemSelect(item, $event)"
            @keydown.space.prevent="ctx.onItemSelect(item, $event)"
          >
            <component
              :is="
                () =>
                  ctx.rootSlots[item.slot ?? 'item']!({
                    item,
                    hasSubmenu: false,
                  })
              "
              v-if="hasRootSlot(item.slot ?? 'item')"
            />
            <template v-else>{{ item.label }}</template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
