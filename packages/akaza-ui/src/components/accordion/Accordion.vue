<script setup lang="ts">
import type { AccordionItem, AccordionProps } from ".";
import { onKeyStroke } from "@vueuse/core";
import { useTemplateRef } from "vue";

const {
  items,
  valueKey,
  labelKey,
  contentKey,
  disabledKey = "disabled",
  type = "single",
  collapsible = false,
  disabled = false,
  orientation = "vertical",
  unmountOnHide = false,
  as = "div",
  ui,
} = defineProps<AccordionProps>();

const model = defineModel<string | string[]>({ default: "" });

const rootRef = useTemplateRef<HTMLElement>("rootRef");

function getValue(item: AccordionItem): string {
  if (valueKey) return String(item[valueKey]);
  if (typeof item === "string" || typeof item === "number") return String(item);
  return String(item.value ?? item.label ?? item);
}

function getLabel(item: AccordionItem): string {
  if (labelKey) return String(item[labelKey] ?? "");
  return String(item.label ?? getValue(item));
}

function getContent(item: AccordionItem): string | undefined {
  if (contentKey) return item[contentKey];
  return item.content;
}

function isItemDisabled(item: AccordionItem): boolean {
  if (disabled) return true;
  return Boolean(item[disabledKey]);
}

function isOpen(item: AccordionItem): boolean {
  const v = getValue(item);
  if (type === "single") return (model.value as string) === v;
  return Array.isArray(model.value) && model.value.includes(v);
}

function toggle(item: AccordionItem) {
  if (isItemDisabled(item)) return;
  const v = getValue(item);
  if (type === "single") {
    const current = (model.value as string) ?? "";
    model.value = current === v && collapsible ? "" : v;
  } else {
    const current = Array.isArray(model.value) ? model.value : [];
    model.value = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
  }
}

function triggerId(item: AccordionItem): string {
  return `akaza-accordion-trigger-${getValue(item)}`;
}

function panelId(item: AccordionItem): string {
  return `akaza-accordion-panel-${getValue(item)}`;
}

onKeyStroke(["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"], (e) => {
  if (!rootRef.value) return;
  const triggers = Array.from(
    rootRef.value.querySelectorAll<HTMLElement>(".akaza-accordion-trigger:not([disabled])"),
  );
  if (!triggers.includes(document.activeElement as HTMLElement)) return;

  const isVertical = orientation === "vertical";
  const isPrev = (isVertical && e.key === "ArrowUp") || (!isVertical && e.key === "ArrowLeft");
  const isNext = (isVertical && e.key === "ArrowDown") || (!isVertical && e.key === "ArrowRight");
  if (!isPrev && !isNext && e.key !== "Home" && e.key !== "End") return;

  e.preventDefault();
  const currentIdx = triggers.indexOf(document.activeElement as HTMLElement);
  let next = currentIdx;
  if (isPrev) next = currentIdx > 0 ? currentIdx - 1 : triggers.length - 1;
  else if (isNext) next = currentIdx < triggers.length - 1 ? currentIdx + 1 : 0;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = triggers.length - 1;

  triggers[next]?.focus();
});
</script>

<template>
  <component
    :is="as"
    ref="rootRef"
    :data-akaza-orientation="orientation"
    class="akaza-accordion"
  >
    <div
      v-for="item in items"
      :key="getValue(item)"
      :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
      :data-akaza-disabled="isItemDisabled(item) ? '' : undefined"
      :class="ui?.item"
      class="akaza-accordion-item"
    >
      <button
        type="button"
        :id="triggerId(item)"
        :aria-expanded="isOpen(item)"
        :aria-controls="panelId(item)"
        :disabled="isItemDisabled(item)"
        :class="ui?.trigger"
        :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
        :data-akaza-disabled="isItemDisabled(item) ? '' : undefined"
        class="akaza-accordion-trigger"
        @click="toggle(item)"
      >
        <slot
          name="trigger"
          :item="item"
          :value="getValue(item)"
          :is-open="isOpen(item)"
          :toggle="() => toggle(item)"
        >
          {{ getLabel(item) }}
        </slot>

        <slot name="icon" :is-open="isOpen(item)" :item="item">
          <svg
            :class="ui?.icon"
            class="akaza-accordion-icon"
            :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </slot>
      </button>

      <div
        :id="panelId(item)"
        role="region"
        :aria-labelledby="triggerId(item)"
        class="akaza-accordion-content"
        :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
      >
        <div class="akaza-accordion-content-inner">
          <div :class="ui?.content" class="akaza-accordion-content-body">
            <template v-if="!unmountOnHide || isOpen(item)">
              <slot
                v-if="item.slot && $slots[item.slot]"
                :name="item.slot"
                :item="item"
                :value="getValue(item)"
                :is-open="isOpen(item)"
              />
              <slot
                v-else
                name="content"
                :item="item"
                :value="getValue(item)"
                :is-open="isOpen(item)"
              >
                {{ getContent(item) }}
              </slot>
            </template>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<style>
.akaza-accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.akaza-accordion-trigger:disabled,
.akaza-accordion-trigger[data-akaza-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.akaza-accordion-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.akaza-accordion-icon[data-akaza-state="open"] {
  transform: rotate(180deg);
}

.akaza-accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.15s ease-out;
}

.akaza-accordion-content[data-akaza-state="open"] {
  grid-template-rows: 1fr;
}

.akaza-accordion-content-inner {
  min-height: 0;
  overflow: hidden;
}
</style>
