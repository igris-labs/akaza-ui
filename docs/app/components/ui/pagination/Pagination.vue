<script setup lang="ts">
import type { PaginationProps, PaginationSlots } from "./index";
import { Pagination as Primitive } from "akaza-ui";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
  useTemplateRef,
} from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { paginationVariants, resolvePaginationVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<PaginationProps>(), {
  total: undefined,
  itemsPerPage: undefined,
  siblingCount: undefined,
  showEdges: undefined,
  showFirstLast: undefined,
  showPreviousNext: undefined,
  disabled: undefined,
  ariaLabel: undefined,
  getPageHref: undefined,
  ui: undefined,
  modelValue: undefined,
});
const slots = defineSlots<PaginationSlots>();
const forwardedSlots = computed(
  () => Object.keys(slots).filter((name) => name !== "state") as (keyof PaginationSlots)[],
);
const marker = ref({ left: 0, top: 0, width: 0, height: 0, visible: false });
const pageDigits = computed(
  () =>
    String(
      Math.max(
        1,
        Math.ceil((props.total ?? 0) / Math.max(1, Math.floor(props.itemsPerPage ?? 10))),
      ),
    ).length,
);
const attrs = useAttrs();
const styles = computed(() => paginationVariants(resolvePaginationVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(
        style(),
        part === "page" && marker.value.visible
          ? "data-[akaza-state=active]:bg-transparent data-[akaza-state=active]:hover:bg-transparent"
          : undefined,
        overrides?.[part],
        part === "root" ? props.class : undefined,
      ),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
let measure = () => {};
let cleanup = () => {};
onUpdated(() => measure());
onBeforeUnmount(() => cleanup());
onMounted(() => {
  const root = primitive.value?.$el as HTMLElement | undefined;
  if (!root) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing =
    getComputedStyle(root).getPropertyValue("--ease-interaction").trim() ||
    "cubic-bezier(0.215, 0.61, 0.355, 1)";
  const positions = new Map<string, { left: number; top: number }>();
  const animations = new Map<HTMLElement, Animation>();
  let previousPage = root.dataset.akazaPage;
  measure = () => {
    const origin = root.getBoundingClientRect();
    const pageChanged = previousPage !== root.dataset.akazaPage;
    previousPage = root.dataset.akazaPage;
    const rows = Array.from(
      root.querySelectorAll<HTMLElement>(":scope > .akaza-pagination-list > li[data-akaza-type]"),
    ).map((element) => {
      const page = element.querySelector<HTMLElement>("[data-akaza-page]");
      const key =
        page?.dataset.akazaPage ??
        `ellipsis-${element.querySelector<HTMLElement>("[data-akaza-side]")?.dataset.akazaSide}`;
      const rect = element.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return {
        element,
        page,
        key,
        width: rect.width,
        height: rect.height,
        left: rect.left - origin.left + root.scrollLeft - root.clientLeft - matrix.m41,
        top: rect.top - origin.top + root.scrollTop - root.clientTop - matrix.m42,
        translateX: matrix.m41,
        translateY: matrix.m42,
      };
    });
    const selected = rows.find(({ page }) => page?.getAttribute("aria-current") === "page");
    if (
      selected &&
      [selected.left, selected.top, selected.width, selected.height, true].some(
        (value, index) =>
          value !==
          [
            marker.value.left,
            marker.value.top,
            marker.value.width,
            marker.value.height,
            marker.value.visible,
          ][index],
      )
    ) {
      marker.value = {
        left: selected.left,
        top: selected.top,
        width: selected.width,
        height: selected.height,
        visible: true,
      };
    }
    // Read layout before starting any animations, and preserve interrupted positions.
    for (const row of rows) {
      const previous = positions.get(row.key);
      if (pageChanged && !reducedMotion.matches) {
        animations.get(row.element)?.cancel();
        const keyframes = previous
          ? [
              {
                transform: `translate(${previous.left + row.translateX - row.left}px, ${previous.top + row.translateY - row.top}px)`,
              },
              { transform: "translate(0, 0)" },
            ]
          : [{ opacity: 0 }, { opacity: 1 }];
        const animation = row.element.animate(keyframes, {
          duration: 180,
          easing,
        });
        animations.set(row.element, animation);
        animation.onfinish = () => {
          if (animations.get(row.element) === animation) animations.delete(row.element);
        };
      }
      positions.set(row.key, { left: row.left, top: row.top });
    }
    const visibleKeys = new Set(rows.map(({ key }) => key));
    for (const key of positions.keys()) if (!visibleKeys.has(key)) positions.delete(key);
    for (const [element, animation] of animations)
      if (!root.contains(element)) {
        animation.cancel();
        animations.delete(element);
      }
  };
  const observer = new MutationObserver(() => measure());
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-akaza-page", "data-akaza-page-count"],
  });
  const resize = new ResizeObserver(() => measure());
  resize.observe(root);
  const stopMotion = () => {
    if (reducedMotion.matches) {
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
    }
  };
  reducedMotion.addEventListener("change", stopMotion);
  measure();
  cleanup = () => {
    observer.disconnect();
    resize.disconnect();
    reducedMotion.removeEventListener("change", stopMotion);
    for (const animation of animations.values()) animation.cancel();
  };
});
defineExpose({
  get firstPage() {
    return primitive.value!.firstPage;
  },
  get goToPage() {
    return primitive.value!.goToPage;
  },
  get lastPage() {
    return primitive.value!.lastPage;
  },
  get nextPage() {
    return primitive.value!.nextPage;
  },
  get pageCount() {
    return primitive.value!.pageCount;
  },
  get previousPage() {
    return primitive.value!.previousPage;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
    :style="{ '--pagination-digits': pageDigits }"
  >
    <template
      v-for="name in forwardedSlots"
      #[name]="scope"
    >
      <slot
        :name="name"
        v-bind="scope ?? {}"
      />
    </template>
    <template
      v-if="!$slots.first"
      #first
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m17 6-6 6 6 6M6 6v12" />
      </svg>
    </template>
    <template
      v-if="!$slots.previous"
      #previous
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m15 6-6 6 6 6" />
      </svg>
    </template>
    <template
      v-if="!$slots.next"
      #next
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </template>
    <template
      v-if="!$slots.last"
      #last
    >
      <svg
        class="rtl:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m7 6 6 6-6 6M18 6v12" />
      </svg>
    </template>
    <template #state="scope">
      <span
        v-if="marker.visible"
        data-pagination-indicator
        aria-hidden="true"
        :class="mergedUi.indicator"
        :style="{
          width: `${marker.width}px`,
          height: `${marker.height}px`,
          transform: `translate(${marker.left}px, ${marker.top}px)`,
        }"
      />
      <slot
        name="state"
        v-bind="scope"
      />
    </template>
  </component>
</template>
