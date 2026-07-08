<script setup lang="ts">
import type { SelectModelValue, SelectOption, SelectProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef } from "vue";
import { fieldContextKey } from "../field/context";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabledKey = "disabled",
  placeholder = "Select option",
  multiple = false,
  nullableValue = "",
  id,
  name,
  required = false,
  disabled = false,
  invalid = false,
  loop = true,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<SelectProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  "value-change": [value: SelectModelValue, details: AkazaChangeEventDetails];
}>();

const model = defineModel<SelectModelValue>({ default: "" });
const openModel = defineModel<boolean>("open", { default: false });

const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const nativeRef = useTemplateRef<HTMLSelectElement>("nativeRef");
const triggerRef = useTemplateRef<HTMLButtonElement>("triggerRef");
const optionRefs = ref<Array<HTMLElement | null>>([]);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
let typeahead = "";
let typeaheadTimer: number | undefined;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-select-${autoId}`);
const contentId = `akaza-select-content-${autoId}`;
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const selectedValues = computed(() => {
  if (Array.isArray(model.value)) return model.value;
  return model.value === "" ? [] : [model.value];
});
const selectedOptions = computed(() =>
  options.filter((option) => isSelectableOption(option) && selectedValues.value.includes(getValue(option))),
);
const selectedOption = computed(() => selectedOptions.value[0]);
const selectedLabel = computed(() =>
  selectedOptions.value.map((option) => getLabel(option)).join(", "),
);
const isFilled = computed(() => selectedValues.value.length > 0);
const isDirty = computed(() => selectedValues.value.length > 0);
const activeIndex = ref(-1);
const activeOptionId = computed(() =>
  openModel.value && activeIndex.value >= 0 ? `${contentId}-option-${activeIndex.value}` : undefined,
);

const triggerProps = computed(() => ({
  id: resolvedId.value,
  "aria-haspopup": "listbox" as const,
  "aria-expanded": openModel.value,
  "aria-controls": openModel.value ? contentId : undefined,
  "aria-activedescendant": activeOptionId.value,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": describedBy.value,
  "aria-invalid": isInvalid.value || undefined,
}));

const stateAttrs = computed(() => ({
  "data-akaza-state": openModel.value ? "open" : "closed",
  "data-akaza-side": side,
  "data-akaza-align": align,
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
}));
const triggerAttrs = computed(() => ({
  ...stateAttrs.value,
  ...triggerProps.value,
}));

const contentStyle = computed(() => ({
  "--akaza-select-side-offset": `${sideOffset}px`,
}));

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function getValue(option: SelectOption): string {
  if (valueKey) return String(option[valueKey] ?? "");
  return String(option.value ?? option.label ?? "");
}

function getOptionKey(option: SelectOption, index: number): string {
  return `${option.type ?? "item"}:${getValue(option) || getLabel(option) || index}`;
}

function getLabel(option: SelectOption): string {
  if (labelKey && option[labelKey] !== undefined) return String(option[labelKey]);
  return String(option.label ?? getValue(option));
}

function getDescription(option: SelectOption): string | undefined {
  const description = option[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function isItemDisabled(option: SelectOption): boolean {
  return isDisabled.value || !isSelectableOption(option) || Boolean(option[disabledKey]);
}

function isSelectableOption(option: SelectOption): boolean {
  return option.type !== "label" && option.type !== "separator";
}

function isOptionSelected(option: SelectOption): boolean {
  return selectedValues.value.includes(getValue(option));
}

function updateValidity(reveal = validationActive.value) {
  const select = nativeRef.value;
  if (!select) return;
  validity.value = select.validity;
  nativeInvalid.value = reveal && !select.validity.valid;
  validationMessage.value = select.validationMessage;
}

function findEnabledIndex(start = 0): number {
  const index = options.findIndex((option, i) => i >= start && !isItemDisabled(option));
  if (index >= 0) return index;
  return options.findIndex((option) => !isItemDisabled(option));
}

function setOptionRef(el: HTMLElement | null, index: number) {
  optionRefs.value[index] = el;
}

function focusOption(index: number) {
  activeIndex.value = index;
  optionRefs.value[index]?.scrollIntoView({ block: "nearest" });
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if (isDisabled.value || openModel.value === next) return;
  let canceled = false;
  emit("open-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  openModel.value = next;
  if (next) {
    const selectedIndex = options.findIndex((option) => isOptionSelected(option) && !isItemDisabled(option));
    activeIndex.value = selectedIndex >= 0 ? selectedIndex : findEnabledIndex();
  } else {
    activeIndex.value = -1;
  }
}

function getNextValue(option: SelectOption): SelectModelValue {
  const value = getValue(option);
  if (!multiple) return value;
  return isOptionSelected(option)
    ? selectedValues.value.filter((item) => item !== value)
    : [...selectedValues.value, value];
}

function selectOption(option: SelectOption, event?: Event) {
  if (isItemDisabled(option)) return;
  validationActive.value = true;
  const value = getNextValue(option);
  let canceled = false;
  emit("value-change", value, {
    reason: event ? "select" : "programmatic",
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  model.value = value;
  if (!multiple) setOpen(false, "select", event);
  updateValidity();
  if (!multiple) triggerRef.value?.focus();
}

function move(delta: number) {
  if (!options.length) return;
  const count = options.length;
  let next = activeIndex.value < 0 ? findEnabledIndex() : activeIndex.value;
  for (let step = 0; step < count; step++) {
    next = next + delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return;
    if (!isItemDisabled(options[next]!)) {
      focusOption(next);
      return;
    }
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else move(event.key === "ArrowDown" ? 1 : -1);
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else if (activeIndex.value >= 0) selectOption(options[activeIndex.value]!, event);
    return;
  }
  if (event.key === "Escape") {
    setOpen(false, "escape", event);
    return;
  }
  if (event.key === "Home") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    focusOption(findEnabledIndex());
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    for (let i = options.length - 1; i >= 0; i--) {
      if (!isItemDisabled(options[i]!)) {
        focusOption(i);
        break;
      }
    }
    return;
  }
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead += event.key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => {
      typeahead = "";
    }, 500);
    const index = options.findIndex((option) =>
      !isItemDisabled(option) && getLabel(option).toLowerCase().startsWith(typeahead),
    );
    if (index >= 0) {
      if (!openModel.value) setOpen(true, "keyboard", event);
      focusOption(index);
    }
  }
}

function onNativeChange(event: Event) {
  validationActive.value = true;
  const select = event.target as HTMLSelectElement;
  if (multiple) {
    const next = Array.from(select.selectedOptions).map((option) => option.value);
    let canceled = false;
    emit("value-change", next, {
      reason: "native",
      event,
      cancel: () => {
        canceled = true;
      },
    });
    if (!canceled) model.value = next;
    updateValidity();
    return;
  }

  const option = options.find((item) => isSelectableOption(item) && getValue(item) === select.value);
  if (option) selectOption(option, event);
  else {
    let canceled = false;
    emit("value-change", nullableValue, {
      reason: "native",
      event,
      cancel: () => {
        canceled = true;
      },
    });
    if (!canceled) model.value = nullableValue;
    updateValidity();
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!openModel.value) return;
  const target = event.target as Node;
  if (rootRef.value?.contains(target)) return;
  setOpen(false, "outside-click", event);
}

function onBlur() {
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  updateValidity();
}

function onInvalid() {
  validationActive.value = true;
  updateValidity();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  updateValidity(false);
});
onUpdated(updateValidity);
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  window.clearTimeout(typeaheadTimer);
  unregister?.();
});
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-select"
  >
    <select
      v-if="resolvedName"
      :id="`${resolvedId}-native`"
      ref="nativeRef"
      :name="resolvedName"
      :value="multiple ? undefined : model"
      :multiple="multiple"
      :required="isRequired"
      :disabled="isDisabled"
      :aria-hidden="true"
      tabindex="-1"
      :class="ui?.nativeSelect"
      class="akaza-select-native"
      @change="onNativeChange"
      @invalid="onInvalid"
    >
      <option v-if="!multiple" :value="nullableValue" />
      <option
        v-for="(option, index) in options.filter(isSelectableOption)"
        :key="getOptionKey(option, index)"
        :value="getValue(option)"
        :selected="selectedValues.includes(getValue(option))"
        :disabled="isItemDisabled(option)"
      >
        {{ getLabel(option) }}
      </option>
    </select>

    <button
      ref="triggerRef"
      type="button"
      role="combobox"
      :disabled="isDisabled"
      :class="ui?.trigger"
      class="akaza-select-trigger"
      v-bind="triggerAttrs"
      @blur="onBlur"
      @click="setOpen(!openModel, 'trigger', $event)"
      @focus="focused = true"
      @keydown="onTriggerKeydown"
    >
      <slot
        name="trigger"
        :is-open="openModel"
        :selected-option="selectedOption"
        :selected-options="selectedOptions"
        :selected-value="model"
        :selected-values="selectedValues"
        :selected-label="selectedLabel"
        :placeholder="placeholder"
        :trigger-props="triggerProps"
        :open="() => setOpen(true, 'programmatic')"
        :close="() => setOpen(false, 'programmatic')"
        :toggle="() => setOpen(!openModel, 'programmatic')"
      >
        <span
          v-if="selectedLabel"
          :class="ui?.value"
          class="akaza-select-value"
        >
          <slot name="value" :option="selectedOption" :options="selectedOptions" :value="model" :values="selectedValues" :label="selectedLabel">
            {{ selectedLabel }}
          </slot>
        </span>
        <span
          v-else
          :class="ui?.placeholder"
          class="akaza-select-placeholder"
        >
          {{ placeholder }}
        </span>
        <span :class="ui?.icon" class="akaza-select-icon" aria-hidden="true">⌄</span>
      </slot>
    </button>

    <div
      v-if="openModel"
      :id="contentId"
      role="listbox"
      :aria-labelledby="resolvedId"
      :aria-multiselectable="multiple || undefined"
      :data-akaza-state="openModel ? 'open' : 'closed'"
      :data-akaza-side="side"
      :data-akaza-align="align"
      :class="ui?.content"
      :style="contentStyle"
      class="akaza-select-content"
    >
      <div :class="ui?.viewport" class="akaza-select-viewport">
        <template
          v-for="(option, index) in options"
          :key="getOptionKey(option, index)"
        >
          <div
            v-if="option.type === 'label'"
            role="presentation"
            :class="ui?.groupLabel"
            class="akaza-select-group-label"
          >
            <slot name="group-label" :option="option" :label="getLabel(option)">
              {{ getLabel(option) }}
            </slot>
          </div>

          <div
            v-else-if="option.type === 'separator'"
            role="separator"
            :class="ui?.separator"
            class="akaza-select-separator"
          />

          <div
            v-else
            :id="`${contentId}-option-${index}`"
            :ref="(el) => setOptionRef(el as HTMLElement | null, index)"
            role="option"
            :aria-selected="isOptionSelected(option)"
            :data-akaza-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
            :data-akaza-highlighted="activeIndex === index || undefined"
            :data-akaza-disabled="isItemDisabled(option) || undefined"
            :class="ui?.option"
            class="akaza-select-option"
            @click="selectOption(option, $event)"
            @mouseenter="!isItemDisabled(option) && focusOption(index)"
          >
            <slot
              name="option"
              :option="option"
              :value="getValue(option)"
              :label="getLabel(option)"
              :description="getDescription(option)"
              :is-selected="isOptionSelected(option)"
              :is-highlighted="activeIndex === index"
              :is-disabled="isItemDisabled(option)"
              :select="() => selectOption(option)"
            >
              <span :class="ui?.indicator" class="akaza-select-indicator" aria-hidden="true">
                {{ isOptionSelected(option) ? "✓" : "" }}
              </span>
              <span :class="ui?.optionText" class="akaza-select-option-text">
                <span :class="ui?.optionLabel" class="akaza-select-option-label">
                  {{ getLabel(option) }}
                </span>
                <span
                  v-if="getDescription(option)"
                  :class="ui?.optionDescription"
                  class="akaza-select-option-description"
                >
                  {{ getDescription(option) }}
                </span>
              </span>
            </slot>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.akaza-select {
  position: relative;
  display: inline-block;
}

.akaza-select-native {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.akaza-select-content {
  position: absolute;
  z-index: 1000;
  min-width: 100%;
}

.akaza-select-viewport {
  max-height: min(16rem, 60vh);
  overflow: auto;
}

.akaza-select-content[data-akaza-side="bottom"] {
  top: calc(100% + var(--akaza-select-side-offset, 6px));
}

.akaza-select-content[data-akaza-side="top"] {
  bottom: calc(100% + var(--akaza-select-side-offset, 6px));
}

.akaza-select-content[data-akaza-side="right"] {
  left: calc(100% + var(--akaza-select-side-offset, 6px));
  top: 0;
}

.akaza-select-content[data-akaza-side="left"] {
  right: calc(100% + var(--akaza-select-side-offset, 6px));
  top: 0;
}

.akaza-select-content[data-akaza-align="center"] {
  left: 50%;
  transform: translateX(-50%);
}

.akaza-select-content[data-akaza-align="end"] {
  right: 0;
}

.akaza-select-content[data-akaza-side="left"][data-akaza-align="end"],
.akaza-select-content[data-akaza-side="right"][data-akaza-align="end"] {
  top: auto;
  bottom: 0;
}
</style>
