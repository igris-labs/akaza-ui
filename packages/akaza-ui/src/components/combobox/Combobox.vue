<script setup lang="ts">
import type { Slot } from "vue";
import type { ComboboxModelValue, ComboboxOption, ComboboxProps, ComboboxValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { isComposing } from "@ui-sdk/core";
import { computed, inject, onMounted, onUpdated, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useCollectionSelection } from "../../composables/internal/sdk/useCollectionSelection";
import { useListNavigation } from "../../composables/internal/sdk/useListNavigation";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails } from "../../utils/changeEvent";
import { scrollWithin } from "../../utils/scrollWithin";
import { useFieldControl } from "../../utils/useFieldControl";
import { useFormReset } from "../../utils/useFormReset";
import { usePopupInteraction } from "../../utils/usePopupInteraction";
import { fieldContextKey } from "../field/context";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabledKey = "disabled",
  placeholder,
  multiple = false,
  nullableValue = "",
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  loop = true,
  filterable = true,
  filter,
  isEqual,
  serializeValue,
  loading = false,
  emptyLabel = "No results found.",
  resetSearchOnBlur = false,
  resetSearchOnSelect = true,
  openOnFocus = true,
  openOnClick = true,
  openOnInput = true,
  clearable = false,
  creatable = false,
  createLabel = (search: string) => `Create “${search}”`,
  highlightOnHover = true,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<ComboboxProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  "value-change": [value: ComboboxModelValue, details: AkazaChangeEventDetails];
  "search-change": [value: string, details: AkazaChangeEventDetails];
  create: [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<ComboboxModelValue>({ default: "" });
const openModel = defineModel<boolean>("open", { default: false });
const searchModel = defineModel<string>("search", { default: "" });

const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const hiddenRef = useTemplateRef<HTMLInputElement>("hiddenRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const optionRefs = ref<Array<HTMLElement | null>>([]);
const slots = useSlots() as Record<string, Slot | undefined>;
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const { nativeInvalid, syncValidity, registerControl } = useFieldControl(field);
const activeIndex = ref(-1);
const { isInternalFocusMove } = usePopupInteraction({
  root: rootRef,
  content: contentRef,
  open: openModel,
  focusTarget: inputRef,
});
const initialValue: ComboboxModelValue = Array.isArray(model.value) ? [...model.value] : model.value;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-combobox-${autoId}`);
const contentId = `akaza-combobox-content-${autoId}`;
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const selectedValues = computed(() => Array.isArray(model.value)
  ? model.value
  : isEmptyValue(model.value) ? [] : [model.value]);
const selectedOptions = computed(() =>
  options.filter((option) => isSelectableOption(option) && selectedValues.value.some((value) => valuesEqual(value, getValue(option)))),
);
const isFilled = computed(() => selectedValues.value.length > 0);
const isDirty = computed(() => !modelValuesEqual(model.value, initialValue));
const filteredOptions = computed(() => {
  const query = searchModel.value.trim().toLowerCase();
  if (!filterable || !query) return options;
  return options.filter((option) => {
    if (!isSelectableOption(option)) return true;
    if (filter) return filter(option, searchModel.value);
    return getLabel(option).toLowerCase().includes(query);
  });
});
const hasVisibleOption = computed(() => filteredOptions.value.some(isSelectableOption));
const navigationItems = computed(() => filteredOptions.value.map((option, index) => ({
  value: `${contentId}-option-${index}`,
  label: getLabel(option),
  disabled: isItemDisabled(option),
})));
const navigation = useListNavigation({
  items: () => navigationItems.value,
  active: () => navigationItems.value[activeIndex.value]?.value ?? null,
  loop: () => loop,
});
watch(filteredOptions, (current, previous) => {
  const active = previous[activeIndex.value];
  const preserved = active ? current.findIndex(option => !isItemDisabled(option) && valuesEqual(getValue(option), getValue(active))) : -1;
  activeIndex.value = preserved >= 0 ? preserved : current.findIndex(option => !isItemDisabled(option));
}, { flush: "sync" });
const activeOptionId = computed(() =>
  openModel.value && !loading && filteredOptions.value[activeIndex.value] && !isItemDisabled(filteredOptions.value[activeIndex.value]!) ? `${contentId}-option-${activeIndex.value}` : undefined,
);
const canCreate = computed(() => {
  const query = searchModel.value.trim();
  return !loading && creatable && Boolean(query) && !options.some((option) =>
    isSelectableOption(option) && getLabel(option).toLowerCase() === query.toLowerCase(),
  );
});
const inputValue = computed(() => {
  if (multiple) return openModel.value ? searchModel.value : "";
  if (openModel.value) return searchModel.value;
  return selectedOptions.value.map((option) => getLabel(option)).join(", ");
});
let closeReason: string | undefined;
const popup = usePopup({
  kind: "combobox",
  open: openModel,
  content: contentRef,
  contentId,
  trigger: () => inputRef.value,
  anchor: () => rootRef.value,
  initialFocus: "none",
  finalFocus: "none",
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: () => 8,
  matchWidth: () => true,
  cssVarPrefix: "akaza-combobox",
  transition: () => "akaza-combobox",
  request: commitOpen,
});
const { present, contentAttrs, triggerAttrs: popupTriggerAttrs, actualAlign, actualSide, style: contentStyle, layerOrder } = popup;
const layeredContentStyle = computed(() => ({
  ...contentStyle.value,
  "--akaza-layer-order": layerOrder.value,
}));
const stateAttrs = computed(() => ({
  "data-akaza-state": openModel.value ? "open" : "closed",
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
}));

registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
});

function getValue(option: ComboboxOption): ComboboxValue {
  if (valueKey) return (option[valueKey] ?? "") as ComboboxValue;
  return option.value ?? option.label ?? "";
}

function getLabel(option: ComboboxOption): string {
  if (labelKey && option[labelKey] !== undefined) return String(option[labelKey]);
  const value = getValue(option);
  return String(option.label ?? (typeof value === "object" ? "" : value));
}

function valuesEqual(a: ComboboxValue, b: ComboboxValue) {
  return isEqual ? isEqual(a, b) : Object.is(a, b);
}

function isEmptyValue(value: ComboboxModelValue) {
  return !Array.isArray(value) && (value === "" || value === nullableValue || value === null || value === undefined);
}

function modelValuesEqual(a: ComboboxModelValue, b: ComboboxModelValue) {
  const left = Array.isArray(a) ? a : isEmptyValue(a) ? [] : [a];
  const right = Array.isArray(b) ? b : isEmptyValue(b) ? [] : [b];
  return left.length === right.length && left.every((value, index) => valuesEqual(value, right[index]!));
}

function getFormValue(value: ComboboxValue) {
  if (serializeValue) return serializeValue(value);
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function getDescription(option: ComboboxOption): string | undefined {
  const description = option[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function isSelectableOption(option: ComboboxOption): boolean {
  return option.type !== "label" && option.type !== "separator";
}

function isItemDisabled(option: ComboboxOption): boolean {
  return isDisabled.value || !isSelectableOption(option) || Boolean(option[disabledKey]);
}

function isOptionSelected(option: ComboboxOption): boolean {
  return selectedValues.value.some((value) => valuesEqual(value, getValue(option)));
}

useFormReset(() => hiddenRef.value, () => {
  model.value = Array.isArray(initialValue) ? [...initialValue] : initialValue;
  touched.value = false;
  validationActive.value = false;
  nativeInvalid.value = false;
  openModel.value = false;
  searchModel.value = "";
  activeIndex.value = -1;
});

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isFilled.value ? "Please select an option." : "");
  syncValidity(input, reveal);
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if ((isDisabled.value || readOnly || hiddenRef.value?.matches(":disabled")) && next) return;
  if (openModel.value === next) return;
  popup.setOpen(next, reason, event);
}

function commitOpen(next: boolean, sdkReason: string, event?: Event) {
  if ((isDisabled.value || readOnly || hiddenRef.value?.matches(":disabled")) && next) return;
  if (openModel.value === next) return;
  const reason = ({
    "escape-key": "escape",
    "outside-press": "outside-click",
    "trigger-press": "trigger",
    "trigger-focus": "focus",
    "focus-out": "blur",
    "window-blur": "blur",
    imperative: "programmatic",
  } as Record<string, string>)[sdkReason] ?? sdkReason;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", next, changeEvent.details);
  if (changeEvent.canceled()) return;
  closeReason = next ? undefined : reason;
  openModel.value = next;
  if (openModel.value !== next) return;
  if (next) activeIndex.value = findEnabledIndex();
  else activeIndex.value = -1;
}

function setSearch(value: string, reason: string, event?: Event) {
  if (readOnly) return false;
  const changeEvent = createChangeDetails(reason, event);
  emit("search-change", value, changeEvent.details);
  if (changeEvent.canceled()) return false;
  searchModel.value = value;
  return true;
}

function findEnabledIndex(start = 0): number {
  if (loading) return -1;
  const index = filteredOptions.value.findIndex((option, i) => i >= start && !isItemDisabled(option));
  if (index >= 0) return index;
  return filteredOptions.value.findIndex((option) => !isItemDisabled(option));
}

function setOptionRef(el: HTMLElement | null, index: number) {
  optionRefs.value[index] = el;
}

function focusOption(index: number) {
  if (!openModel.value || loading || readOnly || hiddenRef.value?.matches(":disabled")) return;
  const option = filteredOptions.value[index];
  if (!option || isItemDisabled(option)) return;
  activeIndex.value = index;
  scrollWithin(optionRefs.value[index], contentRef.value?.querySelector<HTMLElement>(".akaza-combobox-viewport"));
}

function commitSelection(values: ComboboxValue[], reason: string, event?: Event): boolean {
  validationActive.value = true;
  const value = multiple ? values : values[0] ?? nullableValue;
  const changeEvent = createChangeDetails(reason, event);
  emit("value-change", value, changeEvent.details);
  if (changeEvent.canceled()) return false;
  model.value = value;
  if (resetSearchOnSelect) setSearch("", "select", event);
  if (!multiple) setOpen(false, "select", event);
  updateValidity();
  if (multiple) inputRef.value?.focus();
  return true;
}

const selection = useCollectionSelection<ComboboxValue>({
  value: () => selectedValues.value,
  equals: valuesEqual,
  change: commitSelection,
});

function selectOption(option: ComboboxOption, event?: Event) {
  if (loading || readOnly || hiddenRef.value?.matches(":disabled") || isItemDisabled(option)) return;
  selection.select(getValue(option), multiple, event ? "select" : "programmatic", event);
}

function removeValue(value: ComboboxValue, event?: Event) {
  if (readOnly || isDisabled.value) return;
  const next = selectedValues.value.filter((item) => !valuesEqual(item, value));
  commitValue(multiple ? next : nullableValue, "remove", event);
}

function clearValue(event?: Event) {
  if (readOnly || isDisabled.value) return;
  commitValue(multiple ? [] : nullableValue, "clear", event);
  setSearch("", "clear", event);
  inputRef.value?.focus();
}

function commitValue(value: ComboboxModelValue, reason: string, event?: Event) {
  validationActive.value = true;
  const changeEvent = createChangeDetails(reason, event);
  emit("value-change", value, changeEvent.details);
  if (!changeEvent.canceled()) {
    model.value = value;
    updateValidity();
  }
}

function createOption(event?: Event) {
  const value = searchModel.value.trim();
  if (!canCreate.value || !value) return;
  const changeEvent = createChangeDetails("create", event);
  emit("create", value, changeEvent.details);
  if (!changeEvent.canceled()) setOpen(false, "create", event);
}

function move(step: number | "first" | "last", event: KeyboardEvent) {
  if (!openModel.value || loading || readOnly || isDisabled.value || hiddenRef.value?.matches(":disabled")) return;
  const target = navigation.move(step, event);
  const index = navigationItems.value.findIndex(item => item.value === target);
  if (index >= 0) focusOption(index);
}

function onInput(event: Event) {
  validationActive.value = true;
  const target = event.target as HTMLInputElement;
  if (!setSearch(target.value, "input", event)) {
    target.value = inputValue.value;
    return;
  }
  if (openOnInput) setOpen(true, "input", event);
  if (searchModel.value === target.value) activeIndex.value = findEnabledIndex();
  else target.value = inputValue.value;
  updateValidity();
}

function onKeydown(event: KeyboardEvent) {
  if (isDisabled.value || readOnly || hiddenRef.value?.matches(":disabled") || event.defaultPrevented || isComposing(event) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else move(event.key === "ArrowDown" ? 1 : -1, event);
  } else if (event.key === "Enter") {
    if (openModel.value && activeIndex.value >= 0) {
      event.preventDefault();
      const option = filteredOptions.value[activeIndex.value];
      if (option && !loading) selectOption(option, event);
    } else if (openModel.value && canCreate.value) {
      event.preventDefault();
      createOption(event);
    }
  } else if (event.key === "Escape") {
    if (!openModel.value) return;
    event.preventDefault();
    setOpen(false, "escape", event);
  } else if (event.key === "Home") {
    if (openModel.value) {
      event.preventDefault();
      move("first", event);
    }
  } else if (event.key === "End" && openModel.value) {
    event.preventDefault();
    move("last", event);
  }
}

function onFocus(event: FocusEvent) {
  focused.value = true;
  if (openOnFocus) setOpen(true, "focus", event);
}

function onClick(event: MouseEvent) {
  if (openOnClick) setOpen(true, "trigger", event);
}

function onBlur(event: FocusEvent) {
  if (isInternalFocusMove(event)) return;
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  if (resetSearchOnBlur) setSearch("", "blur", event);
  setOpen(false, "blur", event);
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  inputRef.value?.focus();
}

onMounted(() => {
  updateValidity(false);
});
onUpdated(updateValidity);
watch(isDisabled, (value) => {
  if (value && openModel.value) setOpen(false, "disabled");
}, { immediate: true });
watch(openModel, (open) => {
  const reason = closeReason;
  closeReason = undefined;
  if (open) {
    activeIndex.value = findEnabledIndex();
  } else {
    if (reason === "escape" || reason === "select") inputRef.value?.focus({ preventScroll: true });
    activeIndex.value = -1;
  }
}, { immediate: true, flush: "post" });

function hasOptionSlot(option: ComboboxOption) {
  return Boolean(slots[option.slot ?? "option"]);
}
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-combobox"
    @focusout="onBlur"
  >
    <input
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="selectedValues.length ? getFormValue(selectedValues[0]!) : nullableValue"
      :required="isRequired"
      :disabled="isDisabled"
      :aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-combobox-hidden-input"
      @invalid="onInvalid"
    >
    <input
      v-for="value in selectedValues.slice(1)"
      :key="getFormValue(value)"
      type="hidden"
      :name="resolvedName"
      :value="getFormValue(value)"
      :disabled="isDisabled"
    >

    <div
      v-if="multiple && selectedOptions.length"
      :class="ui?.tags"
      class="akaza-combobox-tags"
    >
      <span
        v-for="option in selectedOptions"
        :key="getFormValue(getValue(option))"
        :class="ui?.tag"
        class="akaza-combobox-tag"
      >
        <slot name="tag" :option="option" :value="getValue(option)" :remove="(event?: Event) => removeValue(getValue(option), event)">
          <span :class="ui?.tagLabel" class="akaza-combobox-tag-label">{{ getLabel(option) }}</span>
          <button
            type="button"
            :disabled="isDisabled || readOnly"
            :aria-label="`Remove ${getLabel(option)}`"
            :class="ui?.remove"
            class="akaza-combobox-remove"
            @click="removeValue(getValue(option), $event)"
          >
            ×
          </button>
        </slot>
      </span>
    </div>

    <input
      v-bind="{ ...popupTriggerAttrs, ...stateAttrs }"
      :id="resolvedId"
      ref="inputRef"
      role="combobox"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="readOnly"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="describedBy"
      :aria-expanded="openModel"
      :aria-controls="openModel ? contentId : undefined"
      :aria-activedescendant="activeOptionId"
      :aria-autocomplete="filterable ? 'list' : 'none'"
      :aria-invalid="isInvalid || undefined"
      :aria-readonly="readOnly || undefined"
      :class="ui?.input"
      class="akaza-combobox-input"
      @focus="onFocus"
      @click="onClick"
      @input="onInput"
      @keydown="onKeydown"
    >

    <button
      v-if="clearable && isFilled"
      type="button"
      :disabled="isDisabled || readOnly"
      :class="ui?.clear"
      class="akaza-combobox-clear"
      aria-label="Clear selection"
      @click="clearValue($event)"
    >
      <slot name="clear">×</slot>
    </button>

    <div
      v-if="present"
      v-bind="contentAttrs"
      :id="contentId"
      ref="contentRef"
      role="listbox"
      :aria-labelledby="resolvedId"
      :aria-multiselectable="multiple || undefined"
      :aria-busy="loading || undefined"
      :data-akaza-side="actualSide"
      :data-akaza-align="actualAlign"
      :style="layeredContentStyle"
      :data-akaza-state="openModel ? 'open' : 'closed'"
      :inert="!openModel || undefined"
      :class="ui?.content"
      class="akaza-combobox-content"
    >
      <div :class="ui?.viewport" class="akaza-combobox-viewport">
        <div
          v-if="loading"
          :class="ui?.loading"
          class="akaza-combobox-loading"
        >
          <slot name="loading">Loading…</slot>
        </div>
        <div
          v-else-if="!hasVisibleOption && !canCreate"
          :class="ui?.empty"
          class="akaza-combobox-empty"
        >
          <slot name="empty">{{ emptyLabel }}</slot>
        </div>
        <template
          v-for="(option, index) in filteredOptions"
          v-else
          :key="`${option.type ?? 'item'}:${getFormValue(getValue(option)) || getLabel(option) || index}`"
        >
          <div
            v-if="option.type === 'label'"
            role="presentation"
            :class="ui?.groupLabel"
            class="akaza-combobox-group-label"
          >
            <slot name="group-label" :option="option" :label="getLabel(option)">
              {{ getLabel(option) }}
            </slot>
          </div>
          <div
            v-else-if="option.type === 'separator'"
            role="separator"
            :class="ui?.separator"
            class="akaza-combobox-separator"
          />
          <div
            v-else
            :id="`${contentId}-option-${index}`"
            :ref="(el) => setOptionRef(el as HTMLElement | null, index)"
            role="option"
            :aria-selected="isOptionSelected(option)"
            :aria-disabled="isItemDisabled(option) || undefined"
            :data-akaza-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
            :data-akaza-highlighted="activeIndex === index || undefined"
            :data-akaza-disabled="isItemDisabled(option) || undefined"
            :class="ui?.option"
            class="akaza-combobox-option"
            @mousedown.prevent
            @click="selectOption(option, $event)"
            @mouseenter="highlightOnHover && !isItemDisabled(option) && focusOption(index)"
          >
            <slot
              v-if="hasOptionSlot(option)"
              :name="option.slot ?? 'option'"
              :option="option"
              :value="getValue(option)"
              :label="getLabel(option)"
              :description="getDescription(option)"
              :is-selected="isOptionSelected(option)"
              :is-highlighted="activeIndex === index"
              :is-disabled="isItemDisabled(option)"
              :select="(event?: Event) => selectOption(option, event)"
            />
            <template v-else>
              <span :class="ui?.indicator" class="akaza-combobox-indicator" aria-hidden="true">
                {{ isOptionSelected(option) ? "✓" : "" }}
              </span>
              <span :class="ui?.optionText" class="akaza-combobox-option-text">
                <span :class="ui?.optionLabel" class="akaza-combobox-option-label">
                  {{ getLabel(option) }}
                </span>
                <span
                  v-if="getDescription(option)"
                  :class="ui?.optionDescription"
                  class="akaza-combobox-option-description"
                >
                  {{ getDescription(option) }}
                </span>
              </span>
            </template>
          </div>
        </template>
        <div
          v-if="!loading && canCreate"
          role="option"
          :class="ui?.create"
          class="akaza-combobox-create"
          @mousedown.prevent
          @click="createOption($event)"
        >
          <slot name="create" :search="searchModel" :create="(event?: Event) => createOption(event)">
            {{ createLabel(searchModel.trim()) }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-combobox {
    position: relative;
    display: inline-block;
  }

  .akaza-combobox-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    pointer-events: none;
  }

  .akaza-combobox-content {
    transform-origin: var(--akaza-combobox-transform-origin);
    z-index: var(--akaza-z-combobox, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
    min-width: 0;
  }

  .akaza-combobox-viewport {
    max-height: min(16rem, 60vh);
    overflow: auto;
  }

  .akaza-combobox-enter-active,
  .akaza-combobox-leave-active {
    transition:
      opacity var(--akaza-combobox-duration, 120ms) ease-out,
      scale var(--akaza-combobox-duration, 120ms) ease-out,
      translate var(--akaza-combobox-duration, 120ms) ease-out;
  }

  .akaza-combobox-enter-from,
  .akaza-combobox-leave-to {
    opacity: 0;
    scale: 0.98;
  }

  .akaza-combobox-enter-from[data-akaza-side="bottom"],
  .akaza-combobox-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
  .akaza-combobox-enter-from[data-akaza-side="top"],
  .akaza-combobox-leave-to[data-akaza-side="top"] { translate: 0 4px; }
  .akaza-combobox-enter-from[data-akaza-side="right"],
  .akaza-combobox-leave-to[data-akaza-side="right"] { translate: -4px 0; }
  .akaza-combobox-enter-from[data-akaza-side="left"],
  .akaza-combobox-leave-to[data-akaza-side="left"] { translate: 4px 0; }

  @media (prefers-reduced-motion: reduce) {
    .akaza-combobox-enter-active,
    .akaza-combobox-leave-active {
      transition-duration: 0.01ms;
    }
  }
}
</style>
