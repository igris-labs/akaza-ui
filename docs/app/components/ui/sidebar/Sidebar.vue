<script setup lang="ts">
import type { AkazaChangeEventDetails, NavigationMenuValueChangeEventDetails } from "akaza-ui";
import type { SidebarItem, SidebarProps, SidebarSlots } from "./index";
import { Sidebar as Primitive } from "akaza-ui";

import { computed, nextTick, ref, useAttrs, useTemplateRef, watch } from "vue";
import { cn } from "../../../utils/ui";
import { NavigationMenu } from "../navigation-menu";
import uiConfig from "../ui.config";
import {
  groupSidebarItems,
  resolveSidebarVariants,
  sidebarNavigationVariants,
  sidebarVariants,
} from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<SidebarProps>(), {
  mode: undefined,
  design: undefined,
  itemSize: undefined,
  items: undefined,
  modelValue: undefined,
  navigationLabel: undefined,
  as: undefined,
  side: undefined,
  collapsible: undefined,
  defaultOpen: undefined,
  defaultCollapsed: undefined,
  defaultSize: undefined,
  minSize: undefined,
  maxSize: undefined,
  collapsedSize: undefined,
  mobileSize: undefined,
  resizeStep: undefined,
  resizable: undefined,
  transition: undefined,
  mobile: undefined,
  breakpoint: undefined,
  closeOnBackdropClick: undefined,
  closeOnNavigate: undefined,
  swipeToClose: undefined,
  teleport: undefined,
  keyboardShortcut: undefined,
  ariaLabel: undefined,
  resizeAriaLabel: undefined,
  ui: undefined,
  open: undefined,
  collapsed: undefined,
  size: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string | null | undefined];
  select: [item: SidebarItem, details: AkazaChangeEventDetails];
  valueChange: [value: string | null, details: NavigationMenuValueChangeEventDetails];
}>();
const slots = defineSlots<SidebarSlots>();
function onSelect(item: SidebarItem, details: AkazaChangeEventDetails) {
  emit("select", item, details);
}
function onValueChange(value: string | null, details: NavigationMenuValueChangeEventDetails) {
  emit("valueChange", value, details);
}
const resolvedVariants = computed(() => resolveSidebarVariants(props, uiConfig));
const navigationSlotNames = ["item-leading", "item-label", "item-trailing"] as const;
const navigationSlots = computed(() =>
  navigationSlotNames.filter(
    (name) => slots[name] && !(name === "item-label" && resolvedVariants.value.mode === "grouped"),
  ),
);
const navigationSlotSet = new Set<string>(navigationSlotNames);
const forwardedSlots = computed(() =>
  (Object.keys(slots) as (keyof SidebarSlots)[]).filter(
    (name) => name !== "default" && !navigationSlotSet.has(name),
  ),
);
const navigationItems = computed(() =>
  resolvedVariants.value.mode === "grouped"
    ? groupSidebarItems(props.items ?? [])
    : (props.items ?? []),
);
const expanded = ref<string[]>();
const knownBranches = new Set<string>();
watch(
  navigationItems,
  (items) => {
    const defaults: string[] = [];
    function visit(nodes: SidebarItem[]) {
      for (const item of nodes) {
        if (item.type === "label" || item.type === "separator" || !item.children?.length) continue;
        const value =
          item.value ?? (typeof item.to === "string" ? item.to : item.href) ?? item.label;
        if (!knownBranches.has(value) && item.defaultExpanded) defaults.push(value);
        knownBranches.add(value);
        visit(item.children);
      }
    }
    visit(items);
    if (defaults.length) expanded.value = [...new Set([...(expanded.value ?? []), ...defaults])];
  },
  { immediate: true },
);
const navigationUi = computed(() =>
  Object.fromEntries(
    Object.entries(
      sidebarNavigationVariants({
        mode: resolvedVariants.value.mode,
        design: resolvedVariants.value.design,
        itemSize: resolvedVariants.value.itemSize,
        variant: resolvedVariants.value.variant === "subtle" ? "subtle" : "soft",
      }),
    ).map(([part, style]) => [
      part,
      cn(style(), props.ui?.navigation?.[part as keyof NonNullable<typeof props.ui.navigation>]),
    ]),
  ),
);
const attrs = useAttrs();
const styles = computed(() => sidebarVariants(resolvedVariants.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const {
    class: _class,
    ui: _ui,
    variant: _variant,
    items: _items,
    itemSize: _itemSize,
    design: _design,
    mode: _mode,
    modelValue: _modelValue,
    navigationLabel: _navigationLabel,
    ...native
  } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
const content = useTemplateRef<HTMLElement>("content");
let scrollTop = 0;
function scrollBody() {
  return content.value?.closest<HTMLElement>(".akaza-sidebar-body");
}
watch(
  content,
  (_, __, onCleanup) => {
    const body = scrollBody();
    if (!body) return;
    // The mobile drawer recreates its body; keep navigation at the user's last position.
    body.scrollTop = scrollTop;
    const rememberScroll = () => {
      scrollTop = body.scrollTop;
    };
    body.addEventListener("scroll", rememberScroll, { passive: true });
    onCleanup(() => body.removeEventListener("scroll", rememberScroll));
  },
  { flush: "post" },
);
watch(
  () => props.modelValue,
  async () => {
    const body = scrollBody();
    if (!body) return;
    const position = body.scrollTop;
    await nextTick();
    if (body.isConnected) body.scrollTop = position;
  },
);
watch(
  () => primitive.value?.isMobile,
  async (mobile, wasMobile) => {
    if (mobile !== false || wasMobile !== true) return;
    await nextTick();
    const body = scrollBody();
    const active = body?.querySelector<HTMLElement>(
      ".akaza-navigation-menu-link[data-akaza-active], .akaza-navigation-menu-trigger[data-akaza-active]",
    );
    if (!body || !active) return;
    const viewport = body.getBoundingClientRect();
    const row = active.getBoundingClientRect();
    const offset =
      row.top < viewport.top ? row.top - viewport.top : Math.max(0, row.bottom - viewport.bottom);
    if (offset)
      body.scrollTo({
        top: body.scrollTop + offset,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  },
  { flush: "post" },
);
defineExpose({
  get openValue() {
    return primitive.value!.openValue;
  },
  get collapsedValue() {
    return primitive.value!.collapsedValue;
  },
  get sizeValue() {
    return primitive.value!.sizeValue;
  },
  get open() {
    return primitive.value!.open;
  },
  get close() {
    return primitive.value!.close;
  },
  get openMobile() {
    return primitive.value!.openMobile;
  },
  get closeMobile() {
    return primitive.value!.closeMobile;
  },
  get toggleMobile() {
    return primitive.value!.toggleMobile;
  },
  get toggle() {
    return primitive.value!.toggle;
  },
  get expand() {
    return primitive.value!.expand;
  },
  get collapse() {
    return primitive.value!.collapse;
  },
  get toggleCollapsed() {
    return primitive.value!.toggleCollapsed;
  },
  get resetSize() {
    return primitive.value!.resetSize;
  },
  get isMobile() {
    return primitive.value!.isMobile;
  },
  get state() {
    return primitive.value!.state;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template #default="scope">
      <div
        ref="content"
        class="contents"
      >
        <slot v-bind="scope">
          <NavigationMenu
            v-if="items"
            v-model:expanded="expanded"
            :items="navigationItems"
            :size="resolvedVariants.itemSize"
            :highlight-mode="
              resolvedVariants.design === 'rail'
                ? 'selection-hover'
                : resolvedVariants.design === 'line'
                  ? 'selection'
                  : 'hover'
            "
            :model-value="modelValue"
            :collapsed="scope.collapsed"
            orientation="vertical"
            content-mode="inline"
            :aria-label="navigationLabel ?? ariaLabel ?? 'Navigation'"
            :ui="navigationUi"
            @update:model-value="emit('update:modelValue', $event)"
            @select="onSelect"
            @value-change="onValueChange"
          >
            <template
              v-if="resolvedVariants.mode === 'grouped'"
              #item-label="itemScope"
            >
              <span
                :data-sidebar-group="itemScope.item.sidebarGroup || undefined"
                :class="
                  itemScope.item.sidebarGroup ? cn(navigationUi.groupLabel, 'p-0') : undefined
                "
              >
                <slot
                  name="item-label"
                  v-bind="itemScope"
                >{{ itemScope.item.label }}</slot>
              </span>
            </template>
            <template
              v-for="name in navigationSlots"
              #[name]="itemScope"
            >
              <slot
                :name="name"
                v-bind="itemScope"
              />
            </template>
          </NavigationMenu>
        </slot>
      </div>
    </template>
    <template
      v-for="name in forwardedSlots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof SidebarSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
