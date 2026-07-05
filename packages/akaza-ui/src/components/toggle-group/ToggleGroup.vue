<script setup lang="ts">
import type { ToggleGroupModel, ToggleGroupOption, ToggleGroupProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, ref } from "vue";

const {
  options,
  type = "single",
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabledKey = "disabled",
  disabled = false,
  required = false,
  name,
  orientation = "horizontal",
  loop = true,
  rovingFocus = true,
  allowEmpty = true,
  ariaLabel,
  ariaLabelledby,
  ui,
} = defineProps<ToggleGroupProps>();

const emit = defineEmits<{
  "value-change": [value: ToggleGroupModel, details: AkazaChangeEventDetails];
}>();

const model = defineModel<ToggleGroupModel>({ default: "" });
const itemEls = ref<Array<HTMLElement | null>>([]);

const selectedValues = computed<string[]>(() => {
  if (Array.isArray(model.value)) return model.value;
  return model.value ? [model.value] : [];
});
const submittedValues = computed(() => type === "multiple" ? selectedValues.value : selectedValues.value.slice(0, 1));

function getValue(option: ToggleGroupOption): string {
  if (valueKey) return String(option[valueKey] ?? "");
  return String(option.value ?? option.label ?? "");
}

function getLabel(option: ToggleGroupOption): string {
  if (labelKey && option[labelKey] !== undefined) return String(option[labelKey]);
  return String(option.label ?? getValue(option));
}

function getDescription(option: ToggleGroupOption): string | undefined {
  const description = option[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function isItemDisabled(option: ToggleGroupOption): boolean {
  return disabled || Boolean(option[disabledKey]);
}

function isSelected(option: ToggleGroupOption): boolean {
  return selectedValues.value.includes(getValue(option));
}

function getRovingIndex(): number {
  const selectedIndex = options.findIndex((option) => isSelected(option) && !isItemDisabled(option));
  if (selectedIndex >= 0) return selectedIndex;
  return options.findIndex((option) => !isItemDisabled(option));
}

function getTabIndex(index: number): 0 | -1 {
  if (disabled || isItemDisabled(options[index]!)) return -1;
  if (!rovingFocus) return 0;
  return index === getRovingIndex() ? 0 : -1;
}

function setItemRef(el: HTMLElement | null, index: number) {
  itemEls.value[index] = el;
}

function focusItem(index: number) {
  itemEls.value[index]?.focus();
}

function nextValue(option: ToggleGroupOption): ToggleGroupModel {
  const value = getValue(option);
  if (type === "multiple") {
    return isSelected(option)
      ? selectedValues.value.filter((item) => item !== value)
      : [...selectedValues.value, value];
  }
  if (isSelected(option)) return allowEmpty ? "" : value;
  return value;
}

function select(option: ToggleGroupOption, event?: Event) {
  if (isItemDisabled(option)) return;
  const next = nextValue(option);
  if (required && (Array.isArray(next) ? next.length === 0 : !next)) return;
  let canceled = false;
  emit("value-change", next, {
    reason: event ? "trigger" : "programmatic",
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) model.value = next;
}

function move(index: number, delta: number) {
  const count = options.length;
  let next = index;
  for (let step = 0; step < count; step++) {
    next += delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return;
    if (!isItemDisabled(options[next]!)) {
      focusItem(next);
      return;
    }
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  const isVertical = orientation === "vertical";
  const isPrev = event.key === (isVertical ? "ArrowUp" : "ArrowLeft");
  const isNext = event.key === (isVertical ? "ArrowDown" : "ArrowRight");

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select(options[index]!, event);
    return;
  }
  if (!rovingFocus) return;
  if (isPrev || isNext) {
    event.preventDefault();
    move(index, isNext ? 1 : -1);
  } else if (event.key === "Home") {
    event.preventDefault();
    const first = options.findIndex((option) => !isItemDisabled(option));
    if (first >= 0) focusItem(first);
  } else if (event.key === "End") {
    event.preventDefault();
    for (let i = options.length - 1; i >= 0; i--) {
      if (!isItemDisabled(options[i]!)) {
        focusItem(i);
        return;
      }
    }
  }
}
</script>

<template>
  <div
    role="group"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-required="required || undefined"
    :data-akaza-orientation="orientation"
    :data-akaza-type="type"
    :data-akaza-disabled="disabled || undefined"
    :class="ui?.root"
    class="akaza-toggle-group"
  >
    <template v-if="name">
      <input
        v-for="value in submittedValues"
        :key="value"
        type="hidden"
        :name="name"
        :value="value"
        :class="ui?.input"
        class="akaza-toggle-group-input"
      >
    </template>

    <button
      v-for="(option, index) in options"
      :key="getValue(option)"
      :ref="(el) => setItemRef(el as HTMLElement | null, index)"
      type="button"
      :aria-pressed="isSelected(option)"
      :disabled="isItemDisabled(option)"
      :tabindex="getTabIndex(index)"
      :data-akaza-state="isSelected(option) ? 'on' : 'off'"
      :data-akaza-disabled="isItemDisabled(option) || undefined"
      :class="ui?.item"
      class="akaza-toggle-group-item"
      @click="select(option, $event)"
      @keydown="handleKeydown($event, index)"
    >
      <slot
        name="item"
        :option="option"
        :value="getValue(option)"
        :label="getLabel(option)"
        :description="getDescription(option)"
        :is-pressed="isSelected(option)"
        :is-disabled="isItemDisabled(option)"
        :select="() => select(option)"
      >
        <span :class="ui?.label" class="akaza-toggle-group-label">
          {{ getLabel(option) }}
        </span>
        <span
          v-if="getDescription(option)"
          :class="ui?.description"
          class="akaza-toggle-group-description"
        >
          {{ getDescription(option) }}
        </span>
      </slot>
    </button>
  </div>
</template>

<style>
.akaza-toggle-group {
  display: inline-flex;
}

.akaza-toggle-group[data-akaza-orientation="vertical"] {
  flex-direction: column;
}
</style>
