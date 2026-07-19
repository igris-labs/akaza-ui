<script setup lang="ts">
import type { ToolbarItem, ToolbarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, ref, useSlots } from "vue";

const {
  items = [],
  orientation = "horizontal",
  loop = true,
  disabled = false,
  ariaLabel,
  ariaLabelledby,
  ui,
} = defineProps<ToolbarProps>();

const emit = defineEmits<{
  select: [item: ToolbarItem, details: AkazaChangeEventDetails];
  "input-change": [item: ToolbarItem, value: string, details: AkazaChangeEventDetails];
}>();

type ToolbarSlot = (props: { item: ToolbarItem; isDisabled: boolean }) => unknown;

const slots = useSlots() as Record<string, ToolbarSlot | undefined>;
const requestedActiveKey = ref(findFirstKey(items));
const rovingKeys = computed(() => getRovingKeys(items));
const activeKey = computed({
  get: () => rovingKeys.value.includes(requestedActiveKey.value)
    ? requestedActiveKey.value
    : rovingKeys.value[0] ?? "",
  set: (value: string) => {
    requestedActiveKey.value = value;
  },
});

function getValue(item: ToolbarItem, index: number): string {
  return item.value ?? item.href ?? item.label ?? String(index);
}

function isDisabled(item: ToolbarItem): boolean {
  return disabled || Boolean(item.disabled);
}

function isRovingItem(item: ToolbarItem) {
  return item.type !== "separator" && item.type !== "group" && item.type !== "input";
}

function getItemKey(item: ToolbarItem, index: number, parent = "root") {
  return `${parent}:${getValue(item, index)}`;
}

function findFirstKey(source: ToolbarItem[]): string {
  return getRovingKeys(source)[0] ?? "";
}

function getRovingKeys(source: ToolbarItem[]): string[] {
  const keys: string[] = [];
  for (let index = 0; index < source.length; index++) {
    const item = source[index]!;
    if (item.type === "group") {
      keys.push(...getRovingKeys(item.children ?? []).map((key) => `group-${index}/${key}`));
    } else if (isRovingItem(item) && (!isDisabled(item) || item.focusableWhenDisabled)) {
      keys.push(getItemKey(item, index));
    }
  }
  return keys;
}

function getTabindex(item: ToolbarItem, key: string) {
  if (!isRovingItem(item)) return undefined;
  if (isDisabled(item) && !item.focusableWhenDisabled) return -1;
  return activeKey.value === key ? 0 : -1;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-akaza-toolbar-item]")).filter((el) => {
    if (el instanceof HTMLInputElement) return false;
    if (el.getAttribute("aria-disabled") === "true" && el.dataset.akazaFocusable !== "true") return false;
    return !el.hasAttribute("disabled");
  });
}

function focusNext(root: HTMLElement, current: HTMLElement, delta: number) {
  const items = getFocusable(root);
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0) return;
  let next = currentIndex + delta;
  if (loop) next = (next + items.length) % items.length;
  if (next < 0 || next >= items.length) return;
  items[next]?.focus();
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (!target.matches("[data-akaza-toolbar-item]")) return;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  const root = event.currentTarget as HTMLElement;
  const isVertical = orientation === "vertical";
  const prev = isVertical ? "ArrowUp" : "ArrowLeft";
  const next = isVertical ? "ArrowDown" : "ArrowRight";

  if (event.key === prev || event.key === next) {
    event.preventDefault();
    focusNext(root, target, event.key === next ? 1 : -1);
  } else if (event.key === "Home") {
    event.preventDefault();
    getFocusable(root)[0]?.focus();
  } else if (event.key === "End") {
    event.preventDefault();
    const focusable = getFocusable(root);
    focusable[focusable.length - 1]?.focus();
  }
}

function selectItem(item: ToolbarItem, event: Event) {
  if (isDisabled(item)) {
    event.preventDefault();
    return;
  }
  let canceled = false;
  emit("select", item, {
    reason: "trigger",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) item.onSelect?.();
}

function onItemFocus(event: FocusEvent) {
  const target = event.currentTarget as HTMLElement;
  const key = target.dataset.akazaToolbarKey;
  if (key) activeKey.value = key;
}

function onInput(item: ToolbarItem, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  let canceled = false;
  emit("input-change", item, value, {
    reason: "input",
    event,
    cancel: () => { canceled = true; },
  });
  if (!canceled) item.onUpdateValue?.(value);
  else target.value = String(item.inputValue ?? "");
}

function hasSlot(item: ToolbarItem): boolean {
  return Boolean(item.slot && slots[item.slot]);
}
</script>

<template>
  <div
    role="toolbar"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-orientation="orientation"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="disabled || undefined"
    :class="ui?.root"
    class="akaza-toolbar"
    @keydown="onKeydown"
  >
    <template v-for="(item, index) in items" :key="getValue(item, index)">
      <div
        v-if="item.type === 'separator'"
        role="separator"
        :aria-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
        :data-akaza-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
        :class="ui?.separator"
        class="akaza-toolbar-separator"
      />

      <div
        v-else-if="item.type === 'group'"
        role="group"
        :aria-label="item.label"
        :class="ui?.group"
        class="akaza-toolbar-group"
      >
        <button
          v-for="(child, childIndex) in item.children ?? []"
          :key="getValue(child, childIndex)"
          type="button"
          data-akaza-toolbar-item
          :data-akaza-toolbar-key="`group-${index}/${getItemKey(child, childIndex)}`"
          :data-akaza-focusable="child.focusableWhenDisabled || undefined"
          :aria-pressed="child.pressed ?? undefined"
          :aria-disabled="isDisabled(child) || undefined"
          :disabled="isDisabled(child) && !child.focusableWhenDisabled"
          :tabindex="getTabindex(child, `group-${index}/${getItemKey(child, childIndex)}`)"
          :data-akaza-state="child.pressed ? 'on' : 'off'"
          :data-akaza-disabled="isDisabled(child) || undefined"
          :class="ui?.button"
          class="akaza-toolbar-button"
          @click="selectItem(child, $event)"
          @focus="onItemFocus"
        >
          <component
            :is="() => slots[child.slot!]!({ item: child, isDisabled: isDisabled(child) })"
            v-if="hasSlot(child)"
          />
          <span v-else :class="ui?.label" class="akaza-toolbar-label">{{ child.label }}</span>
        </button>
      </div>

      <input
        v-else-if="item.type === 'input'"
        data-akaza-toolbar-item
        :data-akaza-toolbar-key="getItemKey(item, index)"
        :type="item.inputType ?? 'text'"
        :name="item.name"
        :value="item.inputValue"
        :placeholder="item.placeholder"
        :min="item.min"
        :max="item.max"
        :step="item.step"
        :aria-label="item.label"
        :disabled="isDisabled(item)"
        :data-akaza-disabled="isDisabled(item) || undefined"
        :class="ui?.input"
        class="akaza-toolbar-input"
        @input="onInput(item, $event)"
      >

      <a
        v-else-if="item.type === 'link'"
        :href="item.href"
        data-akaza-toolbar-item
        :data-akaza-toolbar-key="getItemKey(item, index)"
        :data-akaza-focusable="item.focusableWhenDisabled || undefined"
        :aria-disabled="isDisabled(item) || undefined"
        :data-akaza-disabled="isDisabled(item) || undefined"
        :tabindex="getTabindex(item, getItemKey(item, index))"
        :class="ui?.link"
        class="akaza-toolbar-link"
        @click="selectItem(item, $event)"
        @focus="onItemFocus"
      >
        <component
          :is="() => slots[item.slot!]!({ item, isDisabled: isDisabled(item) })"
          v-if="hasSlot(item)"
        />
        <span v-else :class="ui?.label" class="akaza-toolbar-label">{{ item.label }}</span>
      </a>

      <button
        v-else
        type="button"
        data-akaza-toolbar-item
        :data-akaza-toolbar-key="getItemKey(item, index)"
        :data-akaza-focusable="item.focusableWhenDisabled || undefined"
        :aria-pressed="item.pressed ?? undefined"
        :aria-disabled="isDisabled(item) || undefined"
        :disabled="isDisabled(item) && !item.focusableWhenDisabled"
        :tabindex="getTabindex(item, getItemKey(item, index))"
        :data-akaza-state="item.pressed ? 'on' : 'off'"
        :data-akaza-disabled="isDisabled(item) || undefined"
        :class="ui?.button"
        class="akaza-toolbar-button"
        @click="selectItem(item, $event)"
        @focus="onItemFocus"
      >
        <component
          :is="() => slots[item.slot!]!({ item, isDisabled: isDisabled(item) })"
          v-if="hasSlot(item)"
        />
        <span v-else :class="ui?.label" class="akaza-toolbar-label">{{ item.label }}</span>
      </button>
    </template>

    <slot />
  </div>
</template>

<style>
.akaza-toolbar,
.akaza-toolbar-group {
  display: inline-flex;
  align-items: center;
}

.akaza-toolbar[data-akaza-orientation="vertical"] {
  flex-direction: column;
  align-items: stretch;
}
</style>
