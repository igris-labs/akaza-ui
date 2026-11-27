<script setup lang="ts">
import type { AccordionItem, AccordionProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useId } from "vue";
import Panel from "../../composables/internal/sdk/Panel.vue";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { createChangeDetails } from "../../utils/changeEvent";

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
  headingLevel = 3,
  unmountOnHide = false,
  as = "div",
  ui,
} = defineProps<AccordionProps>();

const emit = defineEmits<{
  'value-change': [value: string | string[], details: AkazaChangeEventDetails];
}>();

const model = defineModel<string | string[]>({ default: "" });

const idBase = useId();
const itemByKey = computed(() => new Map(items.map(item => [getValue(item), item])));
const keys = computed(() => [...itemByKey.value.keys()]);
const roving = useRovingGroup({
  keys: () => keys.value,
  disabled: key => {
    const item = itemByKey.value.get(key);
    return !item || isItemDisabled(item);
  },
  preferred: () => undefined,
  orientation: () => orientation,
  loop: () => true,
});

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

function toggle(item: AccordionItem, event?: Event) {
  if (isItemDisabled(item)) return;
  const v = getValue(item);
  let nextValue: string | string[];
  if (type === "single") {
    const current = (model.value as string) ?? "";
    nextValue = current === v && collapsible ? "" : v;
  } else {
    const current = Array.isArray(model.value) ? model.value : [];
    nextValue = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
  }
  const changeEvent = createChangeDetails('trigger', event);
  emit('value-change', nextValue, changeEvent.details);
  if (!changeEvent.canceled()) model.value = nextValue;
}

function triggerId(item: AccordionItem): string {
  return `akaza-accordion-trigger-${idBase}-${getValue(item)}`;
}

function panelId(item: AccordionItem): string {
  return `akaza-accordion-panel-${idBase}-${getValue(item)}`;
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return;
  roving.keydown(event, event.currentTarget as HTMLElement);
}
</script>

<template>
  <component
    :is="as"
    :data-akaza-orientation="orientation"
    :class="ui?.root"
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
      <div role="heading" :aria-level="headingLevel" :class="ui?.header" class="akaza-accordion-header">
        <button
          :id="triggerId(item)"
          :ref="(element) => roving.bind(getValue(item), element as HTMLElement | null)"
          type="button"
          :aria-expanded="isOpen(item)"
          :aria-controls="panelId(item)"
          :disabled="isItemDisabled(item)"
          :class="ui?.trigger"
          :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
          :data-akaza-disabled="isItemDisabled(item) ? '' : undefined"
          class="akaza-accordion-trigger"
          @click="toggle(item, $event)"
          @keydown="onTriggerKeydown"
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
      </div>

      <Panel
        :id="panelId(item)"
        role="region"
        :aria-labelledby="triggerId(item)"
        :open="isOpen(item)"
        :unmount-on-hide="unmountOnHide"
        prefix="akaza-accordion"
        :trigger="element => element.previousElementSibling?.querySelector('button') ?? undefined"
        :ui="ui"
        :class="ui?.contentWrapper"
      >
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
      </Panel>
    </div>
  </component>
</template>

<style>
@layer akaza-reset {

    .akaza-accordion-trigger {
      background: none;
      border: none;
      padding: 0;
    }

  .akaza-accordion-icon {
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

  .akaza-accordion-icon[data-akaza-state="open"] {
      transform: rotate(180deg);
    }

  .akaza-accordion-content {
    display: block;
    height: var(--akaza-accordion-content-height, auto);
    overflow: hidden;
    transition: height 0.15s ease-out;
  }

  .akaza-accordion-content[data-starting-style],
  .akaza-accordion-content[data-ending-style] {
    height: 0;
  }

  .akaza-accordion-content[hidden] {
    display: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-accordion-content,
    .akaza-accordion-icon {
      transition: none;
    }
  }

  .akaza-accordion-content-inner {
    min-height: 0;
    overflow: hidden;
  }
}
</style>
