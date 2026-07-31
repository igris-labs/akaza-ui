<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { StepperItem, StepperItemState, StepperProps, StepperValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, nextTick, ref, useId } from "vue";

const {
  items,
  valueKey,
  titleKey = "title",
  descriptionKey = "description",
  disabledKey = "disabled",
  completedKey = "completed",
  linear = true,
  disabled = false,
  loop = false,
  orientation = "horizontal",
  activationMode = "manual",
  showControls = false,
  unmountOnHide = false,
  dir = "ltr",
  ariaLabel = "Progress steps",
  ui,
} = defineProps<StepperProps>();

const emit = defineEmits<{
  "value-change": [value: StepperValue, details: AkazaChangeEventDetails];
  complete: [value: StepperValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<StepperValue>();
const idBase = useId();
const triggerRefs = ref<Array<HTMLButtonElement | null>>([]);
const focusedIndex = ref(-1);

const currentIndex = computed(() => {
  const selected = items.findIndex((item, index) => getValue(item, index) === model.value);
  if (selected >= 0) return selected;
  return items.findIndex((item) => !isItemDisabled(item));
});
const currentValue = computed(() => {
  const item = items[currentIndex.value];
  return item ? getValue(item, currentIndex.value) : undefined;
});
const state = computed(() => {
  if (currentIndex.value < 0) return "empty";
  return currentIndex.value === items.length - 1 ? "complete" : "active";
});
const isFirstStep = computed(() => currentIndex.value <= firstEnabledIndex());
const isLastStep = computed(() => currentIndex.value >= lastEnabledIndex());
const isPrevDisabled = computed(() => !hasPrev());
const isNextDisabled = computed(() => !hasNext());

function getValue(item: StepperItem, index: number): StepperValue {
  if (valueKey && item[valueKey] !== undefined) return item[valueKey] as StepperValue;
  return item.value ?? index + 1;
}

function getTitle(item: StepperItem, index: number): string {
  const title = item[titleKey];
  return title === undefined ? `Step ${index + 1}` : String(title);
}

function getDescription(item: StepperItem): string | undefined {
  const description = item[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function isItemDisabled(item: StepperItem): boolean {
  return disabled || Boolean(item[disabledKey]);
}

function isCompleted(item: StepperItem, index: number): boolean {
  const explicit = item[completedKey];
  return explicit === undefined ? index < currentIndex.value : Boolean(explicit);
}

function itemState(item: StepperItem, index: number): StepperItemState {
  if (index === currentIndex.value) return "active";
  return isCompleted(item, index) ? "completed" : "inactive";
}

function canActivate(item: StepperItem, index: number): boolean {
  if (isItemDisabled(item)) return false;
  if (!linear || currentIndex.value < 0) return true;
  return index <= currentIndex.value + 1 || isCompleted(item, index);
}

function firstEnabledIndex(): number {
  return items.findIndex((item, index) => canActivate(item, index));
}

function lastEnabledIndex(): number {
  for (let index = items.length - 1; index >= 0; index--) {
    if (canActivate(items[index]!, index)) return index;
  }
  return -1;
}

function nextEnabledIndex(from: number, direction: 1 | -1): number {
  if (!items.length) return -1;
  let index = from;
  for (let count = 0; count < items.length; count++) {
    index += direction;
    if (loop) index = (index + items.length) % items.length;
    else if (index < 0 || index >= items.length) return -1;
    if (index !== from && canActivate(items[index]!, index)) return index;
  }
  return -1;
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

function goToIndex(index: number, reason = "programmatic", event?: Event): boolean {
  const item = items[index];
  if (!item || !canActivate(item, index)) return false;
  const value = getValue(item, index);
  if (value === currentValue.value) return true;
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  model.value = value;
  focusedIndex.value = index;
  if (index === items.length - 1) emit("complete", value, createDetails("complete", event).details);
  return true;
}

function goToStep(value: StepperValue, event?: Event): boolean {
  const index = items.findIndex((item, itemIndex) => getValue(item, itemIndex) === value);
  return goToIndex(index, event ? "trigger" : "programmatic", event);
}

function hasNext(): boolean {
  return nextEnabledIndex(currentIndex.value, 1) >= 0;
}

function hasPrev(): boolean {
  return nextEnabledIndex(currentIndex.value, -1) >= 0;
}

function nextStep(event?: Event): boolean {
  return goToIndex(nextEnabledIndex(currentIndex.value, 1), "next", event);
}

function prevStep(event?: Event): boolean {
  return goToIndex(nextEnabledIndex(currentIndex.value, -1), "previous", event);
}

function setTriggerRef(element: Element | ComponentPublicInstance | null, index: number) {
  triggerRefs.value[index] = element as HTMLButtonElement | null;
}

function focusIndex(index: number) {
  if (index < 0) return;
  focusedIndex.value = index;
  nextTick(() => triggerRefs.value[index]?.focus());
}

function tabIndex(item: StepperItem, index: number): 0 | -1 {
  if (!canActivate(item, index)) return -1;
  const target = focusedIndex.value >= 0 ? focusedIndex.value : currentIndex.value;
  return index === target || (target < 0 && index === firstEnabledIndex()) ? 0 : -1;
}

function onKeydown(index: number, event: KeyboardEvent) {
  const previousKey = orientation === "vertical" ? "ArrowUp" : dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const nextKey = orientation === "vertical" ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  let next = -1;
  if (event.key === previousKey || event.key === nextKey) {
    next = nextEnabledIndex(index, event.key === nextKey ? 1 : -1);
  } else if (event.key === "Home") {
    next = firstEnabledIndex();
  } else if (event.key === "End") {
    next = lastEnabledIndex();
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    goToIndex(index, "trigger", event);
    return;
  }
  if (next < 0) return;
  event.preventDefault();
  focusIndex(next);
  if (activationMode === "automatic") goToIndex(next, "keyboard", event);
}

function triggerId(index: number): string {
  return `${idBase}-step-${index + 1}`;
}

function titleId(index: number): string {
  return `${triggerId(index)}-title`;
}

function descriptionId(index: number): string {
  return `${triggerId(index)}-description`;
}

function panelId(index: number): string {
  return `${triggerId(index)}-panel`;
}

defineExpose({ goToStep, hasNext, hasPrev, nextStep, prevStep });
</script>

<template>
  <div
    :class="ui?.root"
    class="akaza-stepper"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-orientation="orientation"
    :data-akaza-linear="linear || undefined"
    :data-akaza-disabled="disabled || undefined"
    :dir="dir"
  >
    <ol
      :aria-label="ariaLabel"
      :aria-orientation="orientation"
      :class="ui?.list"
      class="akaza-stepper-list"
      :data-akaza-orientation="orientation"
    >
      <li
        v-for="(item, index) in items"
        :key="getValue(item, index)"
        :class="ui?.item"
        class="akaza-stepper-item"
        :data-akaza-state="itemState(item, index)"
        :data-state="itemState(item, index)"
        :data-akaza-disabled="!canActivate(item, index) || undefined"
        :data-akaza-optional="item.optional || undefined"
      >
        <button
          :id="triggerId(index)"
          :ref="(element) => setTriggerRef(element, index)"
          type="button"
          :disabled="!canActivate(item, index)"
          :tabindex="tabIndex(item, index)"
          :aria-current="index === currentIndex ? 'step' : undefined"
          :aria-labelledby="titleId(index)"
          :aria-describedby="getDescription(item) ? descriptionId(index) : undefined"
          :aria-controls="panelId(index)"
          :class="ui?.trigger"
          class="akaza-stepper-trigger"
          :data-akaza-state="itemState(item, index)"
          :data-state="itemState(item, index)"
          :data-akaza-disabled="!canActivate(item, index) || undefined"
          @click="goToIndex(index, 'trigger', $event)"
          @focus="focusedIndex = index"
          @keydown="onKeydown(index, $event)"
        >
          <slot
            :name="item.slot ?? 'item'"
            :item="item"
            :index="index"
            :value="getValue(item, index)"
            :state="itemState(item, index)"
            :is-active="index === currentIndex"
            :is-completed="isCompleted(item, index)"
            :is-disabled="!canActivate(item, index)"
            :select="(event?: Event) => goToIndex(index, event ? 'trigger' : 'programmatic', event)"
          >
            <span :class="ui?.indicator" class="akaza-stepper-indicator" aria-hidden="true">
              <slot name="indicator" :item="item" :index="index" :state="itemState(item, index)">
                {{ index + 1 }}
              </slot>
            </span>
            <span :class="ui?.text" class="akaza-stepper-text">
              <span :id="titleId(index)" :class="ui?.title" class="akaza-stepper-title">
                <slot name="title" :item="item" :index="index">{{ getTitle(item, index) }}</slot>
              </span>
              <span
                v-if="getDescription(item)"
                :id="descriptionId(index)"
                :class="ui?.description"
                class="akaza-stepper-description"
              >
                <slot name="description" :item="item" :index="index">{{ getDescription(item) }}</slot>
              </span>
              <span v-if="item.optional" :class="ui?.optional" class="akaza-stepper-optional">
                <slot name="optional" :item="item" :index="index">Optional</slot>
              </span>
            </span>
          </slot>
        </button>
        <span
          v-if="index < items.length - 1"
          :class="ui?.separator"
          class="akaza-stepper-separator"
          aria-hidden="true"
          :data-akaza-state="isCompleted(item, index) ? 'completed' : 'inactive'"
        >
          <slot name="separator" :item="item" :index="index" :is-completed="isCompleted(item, index)" />
        </span>
      </li>
    </ol>

    <div :class="ui?.panels" class="akaza-stepper-panels">
      <template v-for="(item, index) in items" :key="getValue(item, index)">
        <section
          v-if="!unmountOnHide || index === currentIndex"
          v-show="index === currentIndex"
          :id="panelId(index)"
          role="region"
          :aria-labelledby="triggerId(index)"
          :class="ui?.panel"
          class="akaza-stepper-panel"
          :data-akaza-state="index === currentIndex ? 'active' : 'inactive'"
          :data-state="index === currentIndex ? 'active' : 'inactive'"
        >
          <slot
            :name="`panel-${getValue(item, index)}`"
            :item="item"
            :index="index"
            :value="getValue(item, index)"
            :is-active="index === currentIndex"
          >
            <slot name="panel" :item="item" :index="index" :value="getValue(item, index)">
              {{ item.content }}
            </slot>
          </slot>
        </section>
      </template>
    </div>

    <div v-if="showControls" :class="ui?.controls" class="akaza-stepper-controls">
      <button
        type="button"
        :disabled="isPrevDisabled"
        :class="ui?.previous"
        class="akaza-stepper-previous"
        @click="prevStep($event)"
      >
        <slot name="previous" :disabled="isPrevDisabled" :previous="prevStep">Previous</slot>
      </button>
      <button
        type="button"
        :disabled="isNextDisabled"
        :class="ui?.next"
        class="akaza-stepper-next"
        @click="nextStep($event)"
      >
        <slot name="next" :disabled="isNextDisabled" :next="nextStep">Next</slot>
      </button>
    </div>

    <slot
      name="state"
      :value="currentValue"
      :current-index="currentIndex"
      :total-steps="items.length"
      :is-first-step="isFirstStep"
      :is-last-step="isLastStep"
      :is-prev-disabled="isPrevDisabled"
      :is-next-disabled="isNextDisabled"
      :go-to-step="goToStep"
      :next-step="nextStep"
      :prev-step="prevStep"
      :has-next="hasNext"
      :has-prev="hasPrev"
    />
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-stepper,
  .akaza-stepper-list,
  .akaza-stepper-item,
  .akaza-stepper-trigger,
  .akaza-stepper-text {
    min-width: 0;
  }

  .akaza-stepper-list {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .akaza-stepper-list[data-akaza-orientation="vertical"] {
    flex-direction: column;
  }
}
</style>
