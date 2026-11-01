<script setup lang="ts">
import type { Slot } from "vue";
import type {
  NavigationMenuAction,
  NavigationMenuItem,
  NavigationMenuSlotProps,
  NavigationMenuUi,
} from ".";

import SlotContent from "../../utils/SlotContent";
import { getNavigationDestinationProps as getDestinationProps, getNavigationComponent as getLeafComponent, getNavigationValue as getValue, hasNavigationDestination as hasDestination } from "./items";

defineOptions({ name: "NavigationMenuInline" });

const props = defineProps<{
  items: NavigationMenuItem[];
  expanded: string[];
  selectedValue: string | null;
  depth: number;
  disabled: boolean;
  collapsed: boolean;
  idPrefix: string;
  ui: NavigationMenuUi | undefined;
  providedSlots: Record<string, Slot | undefined>;
}>();

const emit = defineEmits<{
  toggle: [item: NavigationMenuItem, event?: Event];
  select: [item: NavigationMenuItem, event: Event];
}>();


function isExpanded(item: NavigationMenuItem): boolean {
  return props.expanded.includes(getValue(item));
}

function isActive(item: NavigationMenuItem): boolean {
  return props.selectedValue !== null
    ? getValue(item) === props.selectedValue
    : Boolean(item.active);
}

function containsActive(item: NavigationMenuItem): boolean {
  return isActive(item) || Boolean(item.children?.some(containsActive));
}

function getTriggerId(item: NavigationMenuItem): string {
  return `${props.idPrefix}-inline-trigger-${encodeURIComponent(getValue(item))}`;
}

function getContentId(item: NavigationMenuItem): string {
  return `${props.idPrefix}-inline-content-${encodeURIComponent(getValue(item))}`;
}

function toggle(item: NavigationMenuItem, event?: Event) {
  emit("toggle", item, event);
}

function slotProps(item: NavigationMenuItem): NavigationMenuSlotProps {
  const action: NavigationMenuAction = (reasonOrEvent, event) => {
    toggle(item, typeof reasonOrEvent === "string" ? event : reasonOrEvent);
  };
  return {
    item,
    isOpen: isExpanded(item),
    isActive: isActive(item),
    depth: props.depth,
    collapsed: props.collapsed,
    toggle: action,
  };
}

function rowSlot(item: NavigationMenuItem) {
  if (item.slot && props.providedSlots[item.slot]) return props.providedSlots[item.slot];
  if (props.providedSlots.item) return props.providedSlots.item;
  return props.providedSlots[item.children?.length ? "trigger" : "link"];
}

function hasPartSlot(name: string) {
  return Boolean(props.providedSlots[name]);
}

</script>

<template>
  <ul
    :class="[
      depth === 0 ? ui?.list : ui?.inlineList,
      depth === 0 ? 'akaza-navigation-menu-list' : undefined,
    ]"
    :data-akaza-depth="depth"
    class="akaza-navigation-menu-inline-list"
  >
    <li
      v-for="item in items"
      :key="getValue(item)"
      :class="[ui?.item, ui?.inlineItem]"
      :data-akaza-depth="depth"
      :data-akaza-disabled="disabled || item.disabled || undefined"
      :data-akaza-active="containsActive(item) || undefined"
      :data-akaza-state="item.children?.length ? (isExpanded(item) ? 'open' : 'closed') : (isActive(item) ? 'active' : 'inactive')"
      class="akaza-navigation-menu-item akaza-navigation-menu-inline-item"
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

      <template v-else>
        <component
          :is="item.children?.length ? 'button' : getLeafComponent(item)"
          :id="item.children?.length ? getTriggerId(item) : undefined"
          v-bind="!item.children?.length ? getDestinationProps(item) : {}"
          :type="item.children?.length || !hasDestination(item) ? 'button' : undefined"
          :disabled="item.children?.length || !hasDestination(item) ? (disabled || item.disabled) : undefined"
          :aria-disabled="!item.children?.length && hasDestination(item) && (disabled || item.disabled) ? true : undefined"
          :aria-current="!item.children?.length && isActive(item) ? (item.ariaCurrent ?? 'page') : undefined"
          :aria-expanded="item.children?.length ? isExpanded(item) : undefined"
          :aria-controls="item.children?.length ? getContentId(item) : undefined"
          :aria-label="collapsed ? item.label : undefined"
          :class="[
            item.children?.length ? ui?.trigger : ui?.link,
            item.children?.length ? ui?.inlineTrigger : ui?.inlineLink,
            item.children?.length
              ? 'akaza-navigation-menu-trigger akaza-navigation-menu-inline-trigger'
              : 'akaza-navigation-menu-link akaza-navigation-menu-inline-link',
          ]"
          :data-akaza-value="getValue(item)"
          :data-akaza-depth="depth"
          :data-akaza-active="containsActive(item) || undefined"
          :data-akaza-state="item.children?.length ? (isExpanded(item) ? 'open' : 'closed') : (isActive(item) ? 'active' : 'inactive')"
          :data-akaza-disabled="disabled || item.disabled || undefined"
          data-akaza-navigation-menu-inline-control
          @click="item.children?.length ? toggle(item, $event) : emit('select', item, $event)"
        >
          <SlotContent v-if="rowSlot(item)" :render="rowSlot(item)!" :scope="{ ...slotProps(item) }" />
          <template v-else>
            <span
              v-if="hasPartSlot('item-leading')"
              :class="ui?.itemLeading"
              class="akaza-navigation-menu-item-leading"
            >
              <SlotContent :render="providedSlots['item-leading']!" :scope="{ ...slotProps(item) }" />
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
              <SlotContent :render="providedSlots['item-label']!" :scope="{ ...slotProps(item) }" />
            </span>
            <span
              v-else
              :class="ui?.itemLabel"
              class="akaza-navigation-menu-item-label"
            >
              {{ item.label }}
            </span>

            <span
              v-if="item.badge !== undefined"
              :class="ui?.badge"
              class="akaza-navigation-menu-badge"
            >
              {{ item.badge }}
            </span>

            <span
              v-if="hasPartSlot('item-trailing')"
              :class="ui?.itemTrailing"
              class="akaza-navigation-menu-item-trailing"
            >
              <SlotContent :render="providedSlots['item-trailing']!" :scope="{ ...slotProps(item) }" />
            </span>
            <span
              v-if="item.children?.length && hasPartSlot('child-indicator')"
              :class="ui?.childIndicator"
              :data-akaza-state="isExpanded(item) ? 'open' : 'closed'"
              class="akaza-navigation-menu-child-indicator"
              aria-hidden="true"
            >
              <SlotContent :render="providedSlots['child-indicator']!" :scope="{ ...slotProps(item) }" />
            </span>
          </template>
        </component>

        <div
          v-if="item.children?.length"
          :id="getContentId(item)"
          :aria-labelledby="getTriggerId(item)"
          :aria-hidden="!isExpanded(item) || undefined"
          :inert="!isExpanded(item) || undefined"
          :data-akaza-state="isExpanded(item) ? 'open' : 'closed'"
          :data-akaza-parent-value="getValue(item)"
          :class="ui?.inlineContent"
          class="akaza-navigation-menu-inline-content"
        >
          <div
            :class="ui?.inlineContentInner"
            class="akaza-navigation-menu-inline-content-inner"
          >
            <NavigationMenuInline
              :items="item.children"
              :expanded="expanded"
              :selected-value="selectedValue"
              :depth="depth + 1"
              :disabled="disabled || Boolean(item.disabled)"
              :collapsed="collapsed"
              :id-prefix="idPrefix"
              :ui="ui"
              :provided-slots="providedSlots"
              @toggle="(child, event) => emit('toggle', child, event)"
              @select="(child, event) => emit('select', child, event)"
            />
          </div>
        </div>
      </template>
    </li>
  </ul>
</template>
