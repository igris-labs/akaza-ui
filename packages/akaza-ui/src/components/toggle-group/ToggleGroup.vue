<script setup lang="ts">
import type { ToggleGroupModel, ToggleGroupOption, ToggleGroupProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { isComposing } from "@ui-sdk/core";
import { computed, ref } from "vue";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { useSelectionGroup } from "../../composables/internal/sdk/useSelectionGroup";
import { createChangeDetails } from "../../utils/changeEvent";
import { useCheckableField } from "../../utils/useCheckableField";

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
const inputRef = ref<HTMLInputElement | null>(null);

const selectedValues = computed<string[]>(() => {
  if (Array.isArray(model.value)) return model.value;
  return model.value ? [model.value] : [];
});
const submittedValues = computed(() => type === "multiple" ? selectedValues.value : selectedValues.value.slice(0, 1));
const bridge = useCheckableField(model, inputRef, () => focusItem(getRovingIndex()), computed(() => selectedValues.value.length > 0));
const effectiveDisabled = computed(() => disabled || bridge.field?.disabled.value || false);
const effectiveRequired = computed(() => required || bridge.field?.required.value || false);
const effectiveName = computed(() => name ?? bridge.field?.name.value);

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
  return effectiveDisabled.value || Boolean(option[disabledKey]);
}

function isSelected(option: ToggleGroupOption): boolean {
  return selectedValues.value.includes(getValue(option));
}

const roving = useRovingGroup({
  keys: () => options.map(getValue),
  disabled: key => {
    const option = options.find(option => getValue(option) === key);
    return !option || isItemDisabled(option);
  },
  preferred: () => {
    const selected = options.find(option => isSelected(option) && !isItemDisabled(option));
    return selected ? getValue(selected) : undefined;
  },
  orientation: () => orientation,
  loop: () => loop,
  enabled: () => rovingFocus,
});

function getRovingIndex(): number {
  return options.findIndex(option => getValue(option) === roving.tabStop.value);
}

function getTabIndex(index: number): 0 | -1 {
  return roving.tabIndex(getValue(options[index]!)) === 0 ? 0 : -1;
}

function setItemRef(el: HTMLElement | null, option: ToggleGroupOption) {
  roving.bind(getValue(option), el);
}

function focusItem(index: number) {
  if (index >= 0) roving.focus(getValue(options[index]!));
}

function commit(values: string[], reason: string, event?: Event): boolean {
  const next: ToggleGroupModel = type === "multiple" ? values : values[0] ?? "";
  if (effectiveRequired.value && (Array.isArray(next) ? next.length === 0 : !next)) return false;
  const changeEvent = createChangeDetails(reason, event);
  emit("value-change", next, changeEvent.details);
  if (changeEvent.canceled()) return false;
  model.value = next;
  bridge.onChange();
  return true;
}

const selection = useSelectionGroup({
  value: () => selectedValues.value,
  order: () => options.map(getValue),
  multiple: () => type === "multiple",
  disabled: key => {
    const option = options.find(option => getValue(option) === key);
    return !option || isItemDisabled(option);
  },
  change: commit,
});

function select(option: ToggleGroupOption, event?: Event) {
  if (isItemDisabled(option) || inputRef.value?.matches(":disabled")) return;
  const reason = event ? "trigger" : "programmatic";
  if (type === "single" && isSelected(option) && !allowEmpty) {
    // Akaza emits an unchanged request when deselection is disallowed.
    commit([getValue(option)], reason, event);
  } else {
    selection.select(getValue(option), type === "multiple" || allowEmpty, reason, event);
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.defaultPrevented || isComposing(event) || isItemDisabled(options[index]!)) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select(options[index]!, event);
    return;
  }
  roving.keydown(event, event.currentTarget as HTMLElement);
}
</script>

<template>
  <div
    v-bind="bridge.attrs.value"
    role="group"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby ?? bridge.field?.labelledBy.value"
    :aria-describedby="bridge.field?.describedBy.value"
    :aria-invalid="bridge.invalid.value || undefined"
    :data-akaza-orientation="orientation"
    :data-akaza-type="type"
    :data-akaza-disabled="effectiveDisabled || undefined"
    :class="ui?.root"
    class="akaza-toggle-group"
  >
    <input
      ref="inputRef"
      type="text"
      tabindex="-1"
      aria-hidden="true"
      :value="selectedValues.length ? 'selected' : ''"
      :required="effectiveRequired"
      :disabled="effectiveDisabled"
      :class="ui?.input"
      class="akaza-toggle-group-input"
      style="position: absolute; width: 1px; height: 1px; padding: 0; border: 0; opacity: 0; pointer-events: none"
      @invalid="bridge.onInvalid"
    >
    <template v-if="effectiveName">
      <input
        v-for="value in submittedValues"
        :key="value"
        type="hidden"
        :name="effectiveName"
        :disabled="effectiveDisabled"
        :value="value"
        :class="ui?.input"
        class="akaza-toggle-group-input"
      >
    </template>

    <button
      v-for="(option, index) in options"
      :id="index === getRovingIndex() ? bridge.field?.inputId.value : undefined"
      :key="getValue(option)"
      :ref="(el) => setItemRef(el as HTMLElement | null, option)"
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
      @focus="bridge.onFocus"
      @blur="bridge.onBlur"
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
@layer akaza-reset {
  .akaza-toggle-group {
    display: inline-flex;
  }

  .akaza-toggle-group[data-akaza-orientation="vertical"] {
    flex-direction: column;
  }
}
</style>
