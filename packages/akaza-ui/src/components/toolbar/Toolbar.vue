<script setup lang="ts">
import type { ToolbarItem, ToolbarProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useSlots } from "vue";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { createChangeDetails } from "../../utils/changeEvent";

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
const rovingKeys = computed(() => getRovingKeys(items));
const roving = useRovingGroup({
  keys: () => rovingKeys.value,
  disabled: key => !rovingKeys.value.includes(key),
  preferred: () => rovingKeys.value[0],
  orientation: () => orientation,
  loop: () => loop,
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
  return roving.tabIndex(key);
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (!target.matches("[data-akaza-toolbar-item]")) return;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  roving.keydown(event, target);
}

function selectItem(item: ToolbarItem, event: Event) {
  if (isDisabled(item)) {
    event.preventDefault();
    return;
  }
  const changeEvent = createChangeDetails("trigger", event);
  emit("select", item, changeEvent.details);
  if (!changeEvent.canceled()) item.onSelect?.();
}

function onInput(item: ToolbarItem, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const changeEvent = createChangeDetails("input", event);
  emit("input-change", item, value, changeEvent.details);
  if (!changeEvent.canceled()) item.onUpdateValue?.(value);
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
          :ref="element => roving.bind(`group-${index}/${getItemKey(child, childIndex)}`, element as HTMLElement | null)"
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
        >
          <slot
            v-if="hasSlot(child)"
            :name="child.slot!"
            :item="child"
            :is-disabled="isDisabled(child)"
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
        :ref="element => roving.bind(getItemKey(item, index), element as HTMLElement | null)"
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
      >
        <slot
          v-if="hasSlot(item)"
          :name="item.slot!"
          :item="item"
          :is-disabled="isDisabled(item)"
        />
        <span v-else :class="ui?.label" class="akaza-toolbar-label">{{ item.label }}</span>
      </a>

      <button
        v-else
        :ref="element => roving.bind(getItemKey(item, index), element as HTMLElement | null)"
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
      >
        <slot
          v-if="hasSlot(item)"
          :name="item.slot!"
          :item="item"
          :is-disabled="isDisabled(item)"
        />
        <span v-else :class="ui?.label" class="akaza-toolbar-label">{{ item.label }}</span>
      </button>
    </template>

    <slot />
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-toolbar,
  .akaza-toolbar-group {
    display: inline-flex;
    align-items: center;
  }

  .akaza-toolbar[data-akaza-orientation="vertical"] {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
