<script setup lang="ts" generic="T extends object">
import type * as Akaza from "akaza-ui";
import type { TreeProps, TreeSlots } from "./index";
import { Tree as Primitive } from "akaza-ui";

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useTemplateRef,
  watch,
} from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveTreeVariants, treeGeometry, treeVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<TreeProps<T>>(), {
  labelKey: undefined,
  childrenKey: undefined,
  disabledKey: undefined,
  selectableKey: undefined,
  defaultExpandedKey: undefined,
  slotKey: undefined,
  textValue: undefined,
  hasChildren: undefined,
  defaultValue: undefined,
  defaultExpanded: undefined,
  loadingKeys: undefined,
  selectionMode: undefined,
  selectionBehavior: undefined,
  selectionPropagation: undefined,
  selectionHighlight: "full",
  selectOnFocus: undefined,
  expandOnClick: undefined,
  disabled: undefined,
  readOnly: undefined,
  typeahead: undefined,
  transition: undefined,
  indent: undefined,
  orientation: undefined,
  dir: undefined,
  virtualize: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  labels: undefined,
  as: undefined,
  ui: undefined,
  modelValue: undefined,
  expanded: undefined,
});
defineSlots<TreeSlots<T>>();
const attrs = useAttrs();
const resolvedVariants = computed(() => resolveTreeVariants(props, uiConfig));
const styles = computed(() => treeVariants(resolvedVariants.value));
const geometry = computed(() => treeGeometry[resolvedVariants.value.size ?? "sm"]);
const coarsePointer = ref(false);
let pointerQuery: MediaQueryList | undefined;
function updatePointer() {
  coarsePointer.value = pointerQuery?.matches ?? false;
}
onMounted(() => {
  pointerQuery = window.matchMedia("(pointer: coarse)");
  updatePointer();
  pointerQuery.addEventListener("change", updatePointer);
});
onBeforeUnmount(() => pointerQuery?.removeEventListener("change", updatePointer));
const virtualOptions = computed(() => {
  if (!props.virtualize) return false;
  const options = typeof props.virtualize === "object" ? props.virtualize : {};
  return {
    ...options,
    itemHeight:
      options.itemHeight ?? Math.max(coarsePointer.value ? 44 : 0, geometry.value.rowHeight) + 2,
  };
});
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(
        style(),
        part === "toggleIcon" && props.transition === false ? "transition-none" : undefined,
        part === "viewport" && props.virtualize ? "max-h-none" : undefined,
        part === "viewport" && props.transition === false ? "before:transition-none" : undefined,
        overrides?.[part],
        part === "root" ? props.class : undefined,
      ),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return {
    ...native,
    indent: props.indent ?? geometry.value.indent,
    virtualize: virtualOptions.value,
  };
});
const primitive = useTemplateRef<
  { tree: Akaza.TreeController<T>; $el: HTMLElement } & Pick<
    Akaza.TreeController<T>,
    | "getNode"
    | "getItem"
    | "focus"
    | "select"
    | "toggleSelection"
    | "expand"
    | "collapse"
    | "toggleExpanded"
    | "expandAll"
    | "collapseAll"
    | "activate"
  >
>("primitive");
let hoveredItem: HTMLElement | null = null;
let hoverObserver: ResizeObserver | undefined;
let itemObserver: MutationObserver | undefined;
function hoverViewport() {
  return primitive.value?.$el?.querySelector<HTMLElement>(".akaza-tree-viewport");
}
function updateHover() {
  const viewport = hoverViewport();
  if (!viewport) return;
  const target =
    hoveredItem?.isConnected && !hoveredItem.hasAttribute("aria-disabled")
      ? hoveredItem.querySelector<HTMLElement>(".akaza-tree-selection")
      : null;
  if (!target) {
    viewport.style.setProperty("--tree-hover-opacity", "0");
    return;
  }
  const origin = viewport.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  viewport.style.setProperty(
    "--tree-hover-x",
    `${rect.left - origin.left + viewport.scrollLeft}px`,
  );
  viewport.style.setProperty("--tree-hover-y", `${rect.top - origin.top + viewport.scrollTop}px`);
  viewport.style.setProperty("--tree-hover-width", `${rect.width}px`);
  viewport.style.setProperty("--tree-hover-height", `${rect.height}px`);
  viewport.style.setProperty("--tree-hover-radius", getComputedStyle(target).borderRadius);
  viewport.style.setProperty(
    "--tree-hover-opacity",
    hoveredItem?.getAttribute("aria-selected") === "true" ? "0" : "1",
  );
}
function onItemHover(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  hoveredItem =
    event.target instanceof Element ? event.target.closest<HTMLElement>(".akaza-tree-item") : null;
  updateHover();
}
function clearHover() {
  hoveredItem = null;
  updateHover();
}
onMounted(() => {
  const viewport = hoverViewport();
  if (!viewport) return;
  hoverObserver = new ResizeObserver(updateHover);
  hoverObserver.observe(viewport);
  const wrapper = viewport.querySelector(".akaza-tree-virtual-wrapper");
  if (wrapper) hoverObserver.observe(wrapper);
  itemObserver = new MutationObserver(updateHover);
  itemObserver.observe(viewport, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "aria-disabled"],
  });
  viewport.addEventListener("scroll", clearHover, { passive: true });
});
onBeforeUnmount(() => {
  hoverObserver?.disconnect();
  itemObserver?.disconnect();
  hoverViewport()?.removeEventListener("scroll", clearHover);
});
watch(
  () => [props.selectionHighlight, props.size, props.modelValue, props.indent, props.dir],
  () => {
    void nextTick(updateHover);
  },
  { flush: "post" },
);
watch(
  () => virtualOptions.value && virtualOptions.value.itemHeight,
  (height, previous) => {
    if (!height) return;
    const viewport = primitive.value?.$el?.querySelector<HTMLElement>(".akaza-tree-viewport");
    const anchor = viewport && previous ? Math.floor(viewport.scrollTop / previous) : 0;
    void nextTick(() => {
      if (!viewport) return;
      viewport.scrollTop = anchor * height;
      viewport.dispatchEvent(new Event("scroll"));
    });
  },
);
defineExpose({
  get tree() {
    return primitive.value!.tree;
  },
  get getNode() {
    return primitive.value!.getNode;
  },
  get getItem() {
    return primitive.value!.getItem;
  },
  get focus() {
    return primitive.value!.focus;
  },
  get select() {
    return primitive.value!.select;
  },
  get toggleSelection() {
    return primitive.value!.toggleSelection;
  },
  get expand() {
    return primitive.value!.expand;
  },
  get collapse() {
    return primitive.value!.collapse;
  },
  get toggleExpanded() {
    return primitive.value!.toggleExpanded;
  },
  get expandAll() {
    return primitive.value!.expandAll;
  },
  get collapseAll() {
    return primitive.value!.collapseAll;
  },
  get activate() {
    return primitive.value!.activate;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
    @pointerover="onItemHover"
    @pointerleave="clearHover"
    @transitionend="updateHover"
  >
    <template
      v-if="!$slots.empty"
      #empty
    >
      <svg
        class="size-7 text-dimmed"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"
        />
      </svg>
      <span>{{ labels?.empty ?? "No items to display." }}</span>
    </template>
    <template
      v-if="selectionMode === 'multiple' && !$slots.trailing"
      #trailing="{ node }"
    >
      <span
        :class="mergedUi.selectionIndicator"
        :data-state="node.isIndeterminate ? 'mixed' : node.isSelected ? 'checked' : 'unchecked'"
        aria-hidden="true"
      >
        <svg
          v-if="node.isSelected || node.isIndeterminate"
          class="size-full"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path :d="node.isIndeterminate ? 'M4 8h8' : 'm4 8 3 3 5-6'" />
        </svg>
      </span>
      <span
        v-if="node.isIndeterminate"
        class="sr-only"
      >Partially selected</span>
    </template>
    <template
      v-if="!$slots.toggle"
      #toggle="{ node }"
    >
      <svg
        :class="[mergedUi.toggleIcon, node.isLoading && 'motion-safe:animate-spin']"
        :data-akaza-state="node.isExpanded ? 'expanded' : 'collapsed'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path :d="node.isLoading ? 'M12 3a9 9 0 1 0 9 9' : 'm9 5 7 7-7 7'" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof TreeSlots<T>"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
