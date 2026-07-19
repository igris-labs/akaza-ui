<script setup lang="ts">
import type { Slot } from "vue";
import type { ComboboxModelValue, ComboboxOption, ComboboxProps, ComboboxValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
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
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const activeIndex = ref(-1);
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
const activeOptionId = computed(() =>
  openModel.value && !loading && activeIndex.value >= 0 ? `${contentId}-option-${activeIndex.value}` : undefined,
);
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
const { actualAlign, actualSide, style: contentStyle } = useFloatingPosition({
  reference: inputRef,
  floating: contentRef,
  active: () => openModel.value,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  matchWidth: true,
  cssVarPrefix: "akaza-combobox",
});
const { register: registerDismissable, unregister: unregisterDismissable } = useDismissableLayer(
  (event?: KeyboardEvent) => {
    setOpen(false, "escape", event);
    inputRef.value?.focus();
  },
);
const stateAttrs = computed(() => ({
  "data-akaza-state": openModel.value ? "open" : "closed",
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
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

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isFilled.value ? "Please select an option." : "");
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if ((isDisabled.value || readOnly) && next) return;
  if (openModel.value === next) return;
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
  if (next) activeIndex.value = findEnabledIndex();
  else activeIndex.value = -1;
}

function setSearch(value: string, reason: string, event?: Event) {
  if (readOnly) return false;
  let canceled = false;
  emit("search-change", value, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return false;
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
  activeIndex.value = index;
  optionRefs.value[index]?.scrollIntoView?.({ block: "nearest" });
}

function getNextValue(option: ComboboxOption): ComboboxModelValue {
  const value = getValue(option);
  if (!multiple) return value;
  return isOptionSelected(option)
    ? selectedValues.value.filter((item) => !valuesEqual(item, value))
    : [...selectedValues.value, value];
}

function selectOption(option: ComboboxOption, event?: Event) {
  if (loading || readOnly || isItemDisabled(option)) return;
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
  if (resetSearchOnSelect) setSearch("", "select", event);
  if (!multiple) setOpen(false, "select", event);
  updateValidity();
  inputRef.value?.focus();
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
  let canceled = false;
  emit("value-change", value, {
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) {
    model.value = value;
    updateValidity();
  }
}

function createOption(event?: Event) {
  const value = searchModel.value.trim();
  if (!canCreate.value || !value) return;
  let canceled = false;
  emit("create", value, {
    reason: "create",
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) setOpen(false, "create", event);
}

function move(delta: number) {
  if (loading || !filteredOptions.value.length) return;
  const count = filteredOptions.value.length;
  let next = activeIndex.value < 0 ? findEnabledIndex() : activeIndex.value;
  for (let step = 0; step < count; step++) {
    next += delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return;
    if (!isItemDisabled(filteredOptions.value[next]!)) {
      focusOption(next);
      return;
    }
  }
}

function onInput(event: Event) {
  validationActive.value = true;
  const target = event.target as HTMLInputElement;
  if (!setSearch(target.value, "input", event)) {
    target.value = inputValue.value;
    return;
  }
  if (openOnInput) setOpen(true, "input", event);
  activeIndex.value = findEnabledIndex();
  updateValidity();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else move(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter") {
    if (openModel.value && activeIndex.value >= 0) {
      event.preventDefault();
      selectOption(filteredOptions.value[activeIndex.value]!, event);
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
      focusOption(findEnabledIndex());
    }
  } else if (event.key === "End" && openModel.value) {
    event.preventDefault();
    for (let i = filteredOptions.value.length - 1; i >= 0; i--) {
      if (!isItemDisabled(filteredOptions.value[i]!)) {
        focusOption(i);
        break;
      }
    }
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
  const nextTarget = event.relatedTarget as Node | null;
  if (rootRef.value?.contains(nextTarget)) return;
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

function onDocumentPointerDown(event: PointerEvent) {
  if (!openModel.value) return;
  if (rootRef.value?.contains(event.target as Node)) return;
  setOpen(false, "outside-click", event);
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  updateValidity(false);
});
onUpdated(updateValidity);
watch(isDisabled, (value) => {
  if (value && openModel.value) setOpen(false, "disabled");
}, { immediate: true });
watch(openModel, (open) => {
  if (open) {
    registerDismissable();
    activeIndex.value = findEnabledIndex();
  } else {
    unregisterDismissable();
    activeIndex.value = -1;
  }
}, { immediate: true });
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  unregisterDismissable();
  unregister?.();
});

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
      v-bind="stateAttrs"
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

    <Transition name="akaza-combobox">
      <div
        v-if="openModel"
        :id="contentId"
        ref="contentRef"
        role="listbox"
        :aria-labelledby="resolvedId"
        :aria-multiselectable="multiple || undefined"
        :aria-busy="loading || undefined"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :style="contentStyle"
        data-akaza-state="open"
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
              <component
                :is="() => slots[option.slot ?? 'option']!({
                  option,
                  value: getValue(option),
                  label: getLabel(option),
                  description: getDescription(option),
                  isSelected: isOptionSelected(option),
                  isHighlighted: activeIndex === index,
                  isDisabled: isItemDisabled(option),
                  select: (event?: Event) => selectOption(option, event),
                })"
                v-if="hasOptionSlot(option)"
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
    </Transition>
  </div>
</template>

<style>
.akaza-combobox {
  position: relative;
  display: inline-block;
}

.akaza-combobox-hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.akaza-combobox-content {
  position: absolute;
  z-index: var(--akaza-z-combobox, 1000);
  min-width: 100%;
}

.akaza-combobox-content[data-akaza-side="bottom"] {
  top: calc(100% + var(--akaza-combobox-side-offset, 6px));
}

.akaza-combobox-content[data-akaza-side="top"] {
  bottom: calc(100% + var(--akaza-combobox-side-offset, 6px));
}

.akaza-combobox-content[data-akaza-align="center"] {
  left: 50%;
  transform: translateX(-50%);
}

.akaza-combobox-content[data-akaza-align="end"] {
  right: 0;
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
</style>
