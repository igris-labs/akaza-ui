<script setup lang="ts">
import type { PaginationItem, PaginationProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed } from "vue";

const {
  total = 0,
  itemsPerPage = 10,
  siblingCount = 2,
  showEdges = false,
  showFirstLast = false,
  showPreviousNext = true,
  disabled = false,
  ariaLabel = "Pagination",
  getPageHref,
  ui,
} = defineProps<PaginationProps>();

const emit = defineEmits<{
  "value-change": [page: number, details: AkazaChangeEventDetails];
}>();

const model = defineModel<number>({ default: 1 });
const safeItemsPerPage = computed(() => Math.max(1, Math.floor(itemsPerPage)));
const pageCount = computed(() => Math.max(1, Math.ceil(Math.max(0, total) / safeItemsPerPage.value)));
const currentPage = computed(() => clampPage(model.value));
const safeSiblingCount = computed(() => Math.max(0, Math.floor(siblingCount)));
const items = computed<PaginationItem[]>(() => {
  let ellipsisIndex = 0;
  return getRange(currentPage.value, pageCount.value, safeSiblingCount.value, showEdges).map((value, index, range) => {
    if (typeof value === "number") return { type: "page", value, key: `page-${value}` };
    ellipsisIndex++;
    const previous = range[index - 1];
    return {
      type: "ellipsis",
      side: typeof previous === "number" && previous === 1 ? "start" : "end",
      key: `ellipsis-${ellipsisIndex}`,
    };
  });
});
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= pageCount.value);
const state = computed(() => pageCount.value > 1 ? "multiple" : "single");

function clampPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(pageCount.value, Math.max(1, Math.floor(page)));
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getRange(page: number, count: number, siblings: number, edges: boolean): Array<number | "ellipsis"> {
  const leftSibling = Math.max(page - siblings, 1);
  const rightSibling = Math.min(page + siblings, count);
  if (!edges) {
    const itemCount = siblings * 2 + 1;
    if (count <= itemCount) return range(1, count);
    if (page <= siblings + 1) return range(1, itemCount);
    if (count - page <= siblings) return range(count - itemCount + 1, count);
    return range(leftSibling, rightSibling);
  }

  const totalPageNumbers = Math.min(siblings * 2 + 5, count);
  const middleCount = totalPageNumbers - 2;
  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < count - 2;
  if (!showLeftEllipsis && showRightEllipsis) return [...range(1, middleCount), "ellipsis", count];
  if (showLeftEllipsis && !showRightEllipsis) return [1, "ellipsis", ...range(count - middleCount + 1, count)];
  if (showLeftEllipsis && showRightEllipsis) return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", count];
  return range(1, count);
}

function createDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  };
  return { details, canceled: () => canceled };
}

function goToPage(page: number, reason = "programmatic", event?: Event): boolean {
  if (disabled) return false;
  const next = clampPage(page);
  if (next === currentPage.value) return true;
  const change = createDetails(reason, event);
  emit("value-change", next, change.details);
  if (change.canceled()) return false;
  model.value = next;
  return true;
}

function activate(page: number, reason: string, event: MouseEvent, controlDisabled = false) {
  if (controlDisabled || !goToPage(page, reason, event)) event.preventDefault();
}

function href(page: number): string | undefined {
  return getPageHref?.(clampPage(page));
}

function tag(page: number): "a" | "button" {
  return href(page) ? "a" : "button";
}

function isControlDisabled(value: boolean): boolean {
  return disabled || value;
}

defineExpose({
  firstPage: (event?: Event) => goToPage(1, "first", event),
  goToPage,
  lastPage: (event?: Event) => goToPage(pageCount.value, "last", event),
  nextPage: (event?: Event) => goToPage(currentPage.value + 1, "next", event),
  pageCount,
  previousPage: (event?: Event) => goToPage(currentPage.value - 1, "previous", event),
});
</script>

<template>
  <nav
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :class="ui?.root"
    class="akaza-pagination"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-page="currentPage"
    :data-akaza-page-count="pageCount"
  >
    <ul :class="ui?.list" class="akaza-pagination-list">
      <li v-if="showFirstLast" :class="ui?.item" class="akaza-pagination-item">
        <component
          :is="tag(1)"
          :href="href(1)"
          :type="tag(1) === 'button' ? 'button' : undefined"
          :disabled="tag(1) === 'button' ? isControlDisabled(isFirstPage) : undefined"
          :aria-disabled="isControlDisabled(isFirstPage) || undefined"
          :tabindex="isControlDisabled(isFirstPage) ? -1 : undefined"
          aria-label="First page"
          :class="ui?.first"
          class="akaza-pagination-first"
          :data-akaza-disabled="isControlDisabled(isFirstPage) || undefined"
          @click="activate(1, 'first', $event, isControlDisabled(isFirstPage))"
        >
          <slot name="first" :disabled="isControlDisabled(isFirstPage)">First</slot>
        </component>
      </li>

      <li v-if="showPreviousNext" :class="ui?.item" class="akaza-pagination-item">
        <component
          :is="tag(currentPage - 1)"
          :href="href(currentPage - 1)"
          :type="tag(currentPage - 1) === 'button' ? 'button' : undefined"
          :disabled="tag(currentPage - 1) === 'button' ? isControlDisabled(isFirstPage) : undefined"
          :aria-disabled="isControlDisabled(isFirstPage) || undefined"
          :tabindex="isControlDisabled(isFirstPage) ? -1 : undefined"
          aria-label="Previous page"
          :class="ui?.previous"
          class="akaza-pagination-previous"
          :data-akaza-disabled="isControlDisabled(isFirstPage) || undefined"
          @click="activate(currentPage - 1, 'previous', $event, isControlDisabled(isFirstPage))"
        >
          <slot name="previous" :disabled="isControlDisabled(isFirstPage)">Previous</slot>
        </component>
      </li>

      <li
        v-for="item in items"
        :key="item.key"
        :class="ui?.item"
        class="akaza-pagination-item"
        :data-akaza-type="item.type"
      >
        <component
          :is="tag(item.value)"
          v-if="item.type === 'page'"
          :href="href(item.value)"
          :type="tag(item.value) === 'button' ? 'button' : undefined"
          :disabled="tag(item.value) === 'button' ? disabled : undefined"
          :aria-current="item.value === currentPage ? 'page' : undefined"
          :aria-label="item.value === currentPage ? `Page ${item.value}, current page` : `Go to page ${item.value}`"
          :aria-disabled="disabled || undefined"
          :tabindex="disabled ? -1 : undefined"
          :class="ui?.page"
          class="akaza-pagination-page"
          :data-akaza-state="item.value === currentPage ? 'active' : 'inactive'"
          :data-state="item.value === currentPage ? 'active' : 'inactive'"
          :data-akaza-page="item.value"
          :data-akaza-disabled="disabled || undefined"
          @click="activate(item.value, 'page', $event, disabled)"
        >
          <slot name="page" :page="item.value" :is-active="item.value === currentPage">
            {{ item.value }}
          </slot>
        </component>
        <span
          v-else
          aria-hidden="true"
          :class="ui?.ellipsis"
          class="akaza-pagination-ellipsis"
          data-akaza-state="ellipsis"
          :data-akaza-side="item.side"
        >
          <slot name="ellipsis" :side="item.side">…</slot>
        </span>
      </li>

      <li v-if="showPreviousNext" :class="ui?.item" class="akaza-pagination-item">
        <component
          :is="tag(currentPage + 1)"
          :href="href(currentPage + 1)"
          :type="tag(currentPage + 1) === 'button' ? 'button' : undefined"
          :disabled="tag(currentPage + 1) === 'button' ? isControlDisabled(isLastPage) : undefined"
          :aria-disabled="isControlDisabled(isLastPage) || undefined"
          :tabindex="isControlDisabled(isLastPage) ? -1 : undefined"
          aria-label="Next page"
          :class="ui?.next"
          class="akaza-pagination-next"
          :data-akaza-disabled="isControlDisabled(isLastPage) || undefined"
          @click="activate(currentPage + 1, 'next', $event, isControlDisabled(isLastPage))"
        >
          <slot name="next" :disabled="isControlDisabled(isLastPage)">Next</slot>
        </component>
      </li>

      <li v-if="showFirstLast" :class="ui?.item" class="akaza-pagination-item">
        <component
          :is="tag(pageCount)"
          :href="href(pageCount)"
          :type="tag(pageCount) === 'button' ? 'button' : undefined"
          :disabled="tag(pageCount) === 'button' ? isControlDisabled(isLastPage) : undefined"
          :aria-disabled="isControlDisabled(isLastPage) || undefined"
          :tabindex="isControlDisabled(isLastPage) ? -1 : undefined"
          aria-label="Last page"
          :class="ui?.last"
          class="akaza-pagination-last"
          :data-akaza-disabled="isControlDisabled(isLastPage) || undefined"
          @click="activate(pageCount, 'last', $event, isControlDisabled(isLastPage))"
        >
          <slot name="last" :disabled="isControlDisabled(isLastPage)">Last</slot>
        </component>
      </li>
    </ul>

    <slot name="state" :page="currentPage" :page-count="pageCount" :items="items" :go-to-page="goToPage" />
  </nav>
</template>

<style>
@layer akaza-reset {
  .akaza-pagination,
  .akaza-pagination-list,
  .akaza-pagination-item {
    min-width: 0;
  }

  .akaza-pagination-list {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
