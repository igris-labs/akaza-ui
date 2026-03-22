<script setup lang="ts">
import type { RadioGroupProps } from ".";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabled = false,
  orientation = "vertical",
  as = "div",
  legend,
  name,
  required,
  loop = true,
  ariaLabel,
  ariaLabelledby,
  getItemDisabled,
  ui,
} = defineProps<RadioGroupProps>();

const model = defineModel<string>({ default: "" });

function getValue(option: any): string {
  if (valueKey) return String(option[valueKey]);
  if (typeof option === "string" || typeof option === "number") return String(option);
  return String(option?.value ?? option?.id ?? option);
}

function getLabel(option: any): string | undefined {
  if (typeof option === "string" || typeof option === "number") return String(option);
  if (labelKey && option?.[labelKey] !== undefined) return String(option[labelKey]);
  return option?.label !== undefined ? String(option.label) : undefined;
}

function getDescription(option: any): string | undefined {
  if (descriptionKey && option?.[descriptionKey] !== undefined) return String(option[descriptionKey]);
  return option?.description !== undefined ? String(option.description) : undefined;
}

function isItemDisabled(option: any): boolean {
  if (disabled) return true;
  if (getItemDisabled) return getItemDisabled(option);
  return option?.disabled === true;
}

// Roving tabindex: only the selected (or first enabled) item has tabindex=0
const itemEls: (HTMLElement | null)[] = [];
function setItemRef(el: HTMLElement | null, index: number) {
  itemEls[index] = el;
}
function focusItem(index: number) {
  itemEls[index]?.focus();
}

function getRovingIndex(): number {
  const selectedIdx = options.findIndex((o) => getValue(o) === model.value && !isItemDisabled(o));
  if (selectedIdx >= 0) return selectedIdx;
  return options.findIndex((o) => !isItemDisabled(o));
}

function getTabIndex(index: number): 0 | -1 {
  if (disabled) return -1;
  return index === getRovingIndex() ? 0 : -1;
}

function select(option: any) {
  if (!isItemDisabled(option)) model.value = getValue(option);
}

function handleKeyDown(event: KeyboardEvent, index: number) {
  const isVertical = orientation === "vertical";
  const isPrev = event.key === (isVertical ? "ArrowUp" : "ArrowLeft");
  const isNext = event.key === (isVertical ? "ArrowDown" : "ArrowRight");
  const isHome = event.key === "Home";
  const isEnd = event.key === "End";
  const isSpace = event.key === " ";

  if (isSpace) {
    event.preventDefault();
    select(options[index]);
    return;
  }

  if (!isPrev && !isNext && !isHome && !isEnd) return;
  event.preventDefault();

  const count = options.length;
  let target = index;

  if (isPrev) {
    let candidate = loop ? (index - 1 + count) % count : index - 1;
    let steps = 0;
    while (candidate >= 0 && candidate < count && isItemDisabled(options[candidate]) && steps < count) {
      candidate = loop ? (candidate - 1 + count) % count : candidate - 1;
      steps++;
    }
    if (candidate >= 0 && candidate < count && !isItemDisabled(options[candidate])) target = candidate;
  } else if (isNext) {
    let candidate = loop ? (index + 1) % count : index + 1;
    let steps = 0;
    while (candidate >= 0 && candidate < count && isItemDisabled(options[candidate]) && steps < count) {
      candidate = loop ? (candidate + 1) % count : candidate + 1;
      steps++;
    }
    if (candidate >= 0 && candidate < count && !isItemDisabled(options[candidate])) target = candidate;
  } else if (isHome) {
    let candidate = 0;
    while (candidate < count - 1 && isItemDisabled(options[candidate])) candidate++;
    if (!isItemDisabled(options[candidate])) target = candidate;
  } else if (isEnd) {
    let candidate = count - 1;
    while (candidate > 0 && isItemDisabled(options[candidate])) candidate--;
    if (!isItemDisabled(options[candidate])) target = candidate;
  }

  if (target !== index) {
    model.value = getValue(options[target]);
    focusItem(target);
  }
}
</script>

<template>
  <component
    :is="as"
    role="radiogroup"
    :aria-label="ariaLabel ?? legend"
    :aria-labelledby="ariaLabelledby"
    :aria-orientation="orientation"
    :aria-required="required || undefined"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-radio-group"
  >
    <input v-if="name" type="hidden" :name="name" :value="model" :required="required" />

    <slot name="legend" :legend="legend">
      <span v-if="legend" :class="ui?.legend" class="akaza-radio-group-legend">{{ legend }}</span>
    </slot>

    <button
      v-for="(option, index) in options"
      :key="getValue(option)"
      :ref="(el) => setItemRef(el as HTMLElement | null, index)"
      type="button"
      role="radio"
      :aria-checked="model === getValue(option)"
      :tabindex="getTabIndex(index)"
      :class="ui?.item"
      :data-akaza-state="model === getValue(option) ? 'checked' : 'unchecked'"
      :data-akaza-disabled="isItemDisabled(option) || undefined"
      :disabled="isItemDisabled(option)"
      class="akaza-radio-group-item"
      @click="select(option)"
      @keydown="handleKeyDown($event, index)"
    >
      <slot
        name="item"
        :option="option"
        :value="getValue(option)"
        :label="getLabel(option)"
        :description="getDescription(option)"
        :is-checked="model === getValue(option)"
        :is-disabled="isItemDisabled(option)"
        :select="() => select(option)"
      />
    </button>
  </component>
</template>
