<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { ListboxModelValue, ListboxOption, ListboxProps, ListboxValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { useVirtualList } from "@vueuse/core";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId } from "vue";
import { fieldContextKey } from "../field/context";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabledKey = "disabled",
  multiple = false,
  nullableValue = "",
  by,
  serializeValue,
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  autoFocus = false,
  loop = true,
  orientation = "vertical",
  dir = "ltr",
  selectionBehavior = "toggle",
  filterable = false,
  filter,
  filterPlaceholder = "Filter options",
  emptyLabel = "No options found.",
  highlightOnHover = true,
  virtualize = false,
  virtualItemHeight = 40,
  virtualHeight = 240,
  overscan = 5,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<ListboxProps>();

const emit = defineEmits<{
  "value-change": [value: ListboxModelValue, details: AkazaChangeEventDetails];
  "search-change": [value: string, details: AkazaChangeEventDetails];
  "highlight-change": [option: ListboxOption | undefined, details: AkazaChangeEventDetails];
  "entry-focus": [option: ListboxOption | undefined, details: AkazaChangeEventDetails];
  leave: [option: ListboxOption | undefined, details: AkazaChangeEventDetails];
}>();

const model = defineModel<ListboxModelValue>({ default: "" });
const searchModel = defineModel<string>("search", { default: "" });
const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const filterRef = ref<HTMLInputElement | null>(null);
const hiddenRef = ref<HTMLInputElement | null>(null);
const optionRefs = ref<Array<HTMLElement | null>>([]);
const activeIndex = ref(-1);
const selectionAnchor = ref(-1);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
let typeahead = "";
let typeaheadTimer: number | undefined;
let previousActiveIndex = -1;

const initialValue: ListboxModelValue = Array.isArray(model.value) ? [...model.value] : model.value;
const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-listbox-${autoId}`);
const listboxId = computed(() => `${resolvedId.value}-content`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const selectedValues = computed<ListboxValue[]>(() =>
  Array.isArray(model.value)
    ? model.value
    : isEmptyValue(model.value) ? [] : [model.value],
);
const isFilled = computed(() => selectedValues.value.length > 0);
const isDirty = computed(() => !modelValuesEqual(model.value, initialValue));
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const visibleOptions = computed(() => {
  const query = searchModel.value.trim().toLowerCase();
  if (!filterable || !query) return options;
  return options.filter((option) => {
    if (!isSelectableOption(option)) return true;
    if (filter) return filter(option, searchModel.value);
    return getLabel(option).toLowerCase().includes(query);
  });
});
const hasSelectableOption = computed(() => visibleOptions.value.some(isSelectableOption));
const activeOption = computed(() => activeIndex.value >= 0 ? visibleOptions.value[activeIndex.value] : undefined);
const activeOptionId = computed(() =>
  activeOption.value && isSelectableOption(activeOption.value)
    ? `${listboxId.value}-option-${activeIndex.value}`
    : undefined,
);
const state = computed(() => isFilled.value ? "selected" : "empty");

const {
  list: virtualRows,
  scrollTo: scrollToVirtualIndex,
  containerProps: virtualContainerProps,
  wrapperProps: virtualWrapperProps,
} = useVirtualList(visibleOptions, {
  itemHeight: () => virtualItemHeight,
  overscan,
});
const renderedRows = computed(() => virtualize
  ? virtualRows.value
  : visibleOptions.value.map((data, index) => ({ data, index })));
const virtualContainerStyle = computed(() => virtualize
  ? { height: `var(--akaza-listbox-virtual-height, ${virtualHeight}px)` }
  : undefined);

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function getValue(option: ListboxOption): ListboxValue {
  if (valueKey) return (option[valueKey] ?? "") as ListboxValue;
  return option.value ?? option.label ?? "";
}

function getLabel(option: ListboxOption): string {
  const label = option[labelKey];
  if (label !== undefined) return String(label);
  const value = getValue(option);
  return typeof value === "object" ? "" : String(value);
}

function getDescription(option: ListboxOption): string | undefined {
  const description = option[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function getFormValue(value: ListboxValue): string {
  if (serializeValue) return serializeValue(value);
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function valuesEqual(a: ListboxValue, b: ListboxValue): boolean {
  if (typeof by === "function") return by(a, b);
  if (typeof by === "string" && typeof a === "object" && typeof b === "object") {
    return Object.is(a[by], b[by]);
  }
  return Object.is(a, b);
}

function isEmptyValue(value: ListboxModelValue): boolean {
  return !Array.isArray(value) && (value === "" || value === nullableValue || value === null || value === undefined);
}

function modelValuesEqual(a: ListboxModelValue, b: ListboxModelValue): boolean {
  const left = Array.isArray(a) ? a : isEmptyValue(a) ? [] : [a];
  const right = Array.isArray(b) ? b : isEmptyValue(b) ? [] : [b];
  return left.length === right.length && left.every((value, index) => valuesEqual(value, right[index]!));
}

function isSelectableOption(option: ListboxOption): boolean {
  return option.type !== "label" && option.type !== "separator";
}

function isItemDisabled(option: ListboxOption): boolean {
  return isDisabled.value || !isSelectableOption(option) || Boolean(option[disabledKey]);
}

function isOptionSelected(option: ListboxOption): boolean {
  return selectedValues.value.some((value) => valuesEqual(value, getValue(option)));
}

function getOptionKey(option: ListboxOption, index: number): string {
  if (!isSelectableOption(option)) return `${option.type}:${getLabel(option)}:${index}`;
  return `${getFormValue(getValue(option))}:${index}`;
}

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isFilled.value ? "Please select an option." : "");
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function emitDetails(reason: string, event?: Event) {
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

function commitValue(value: ListboxModelValue, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const change = emitDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  validationActive.value = true;
  model.value = value;
  updateValidity();
  return true;
}

function setSearch(value: string, reason: string, event?: Event): boolean {
  const change = emitDetails(reason, event);
  emit("search-change", value, change.details);
  if (change.canceled()) return false;
  searchModel.value = value;
  activeIndex.value = findEnabledIndex();
  return true;
}

function rangeValues(from: number, to: number): ListboxValue[] {
  const [start, end] = from <= to ? [from, to] : [to, from];
  return visibleOptions.value
    .slice(start, end + 1)
    .filter((option) => !isItemDisabled(option))
    .map(getValue);
}

function nextValueFor(option: ListboxOption, index: number, event?: MouseEvent | KeyboardEvent): ListboxModelValue {
  const value = getValue(option);
  if (!multiple) return value;
  if (event?.shiftKey && selectionAnchor.value >= 0) return rangeValues(selectionAnchor.value, index);
  if (selectionBehavior === "replace" && !event?.ctrlKey && !event?.metaKey) return [value];
  return isOptionSelected(option)
    ? selectedValues.value.filter((item) => !valuesEqual(item, value))
    : [...selectedValues.value, value];
}

function selectOption(option: ListboxOption, index: number, event?: MouseEvent | KeyboardEvent) {
  if (readOnly || isItemDisabled(option)) return;
  const value = nextValueFor(option, index, event);
  if (commitValue(value, event ? "select" : "programmatic", event)) {
    if (!event?.shiftKey) selectionAnchor.value = index;
    setActive(index, "select", event);
  }
}

function clear(event?: Event) {
  commitValue(multiple ? [] : nullableValue, "clear", event);
}

function findEnabledIndex(start = 0, direction = 1): number {
  const count = visibleOptions.value.length;
  if (!count) return -1;
  let index = Math.min(Math.max(start, 0), count - 1);
  for (let step = 0; step < count; step++) {
    if (!isItemDisabled(visibleOptions.value[index]!)) return index;
    index += direction;
    if (loop) index = (index + count) % count;
    else if (index < 0 || index >= count) return -1;
  }
  return -1;
}

function findLastEnabledIndex(): number {
  return findEnabledIndex(visibleOptions.value.length - 1, -1);
}

function setOptionRef(element: Element | ComponentPublicInstance | null, index: number) {
  optionRefs.value[index] = element as HTMLElement | null;
}

function setListboxRef(element: Element | ComponentPublicInstance | null) {
  const target = element as HTMLElement | null;
  listboxRef.value = target;
  virtualContainerProps.ref.value = target;
}

function setActive(index: number, reason: string, event?: Event) {
  const option = visibleOptions.value[index];
  if (!option || isItemDisabled(option) || activeIndex.value === index) return;
  const change = emitDetails(reason, event);
  emit("highlight-change", option, change.details);
  if (change.canceled()) return;
  activeIndex.value = index;
  if (virtualize) {
    scrollToVirtualIndex(index);
    nextTick(() => optionRefs.value[index]?.scrollIntoView?.({ block: "nearest" }));
  } else {
    optionRefs.value[index]?.scrollIntoView?.({ block: "nearest" });
  }
}

function clearActive(reason: string, event?: Event) {
  if (activeIndex.value < 0) return;
  const option = activeOption.value;
  const change = emitDetails(reason, event);
  emit("highlight-change", undefined, change.details);
  if (!change.canceled()) activeIndex.value = -1;
  return option;
}

function onPointerEnter(event: PointerEvent) {
  const index = previousActiveIndex >= 0 ? previousActiveIndex : findEnabledIndex();
  const option = visibleOptions.value[index];
  if (option && !isItemDisabled(option)) setActive(index, "pointer", event);
}

function onPointerLeave(event: PointerEvent) {
  const option = activeOption.value;
  previousActiveIndex = activeIndex.value;
  const change = emitDetails("pointer", event);
  emit("leave", option, change.details);
  if (!change.canceled()) clearActive("leave", event);
}

function move(delta: number, event: KeyboardEvent) {
  const count = visibleOptions.value.length;
  if (!count) return;
  let next = activeIndex.value;
  for (let step = 0; step < count; step++) {
    next += delta;
    if (loop) next = (next + count) % count;
    else if (next < 0 || next >= count) return;
    if (!isItemDisabled(visibleOptions.value[next]!)) {
      setActive(next, "keyboard", event);
      if (multiple && event.shiftKey && selectionAnchor.value >= 0 && !readOnly) {
        commitValue(rangeValues(selectionAnchor.value, next), "range", event);
      }
      return;
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (isDisabled.value) return;
  const previousKey = orientation === "vertical" ? "ArrowUp" : dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const nextKey = orientation === "vertical" ? "ArrowDown" : dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  if (event.key === previousKey || event.key === nextKey) {
    event.preventDefault();
    move(event.key === nextKey ? 1 : -1, event);
  } else if (event.key === "Home") {
    event.preventDefault();
    setActive(findEnabledIndex(), "keyboard", event);
  } else if (event.key === "End") {
    event.preventDefault();
    setActive(findLastEnabledIndex(), "keyboard", event);
  } else if (event.key === "Enter" || event.key === " ") {
    if (activeOption.value && isSelectableOption(activeOption.value)) {
      event.preventDefault();
      selectOption(activeOption.value, activeIndex.value, event);
    }
  } else if (multiple && event.key.toLowerCase() === "a" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    commitValue(visibleOptions.value.filter((option) => !isItemDisabled(option)).map(getValue), "select-all", event);
  } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
    typeahead += event.key.toLowerCase();
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => {
      typeahead = "";
    }, 500);
    const match = visibleOptions.value.findIndex((option) =>
      !isItemDisabled(option) && getLabel(option).toLowerCase().startsWith(typeahead),
    );
    if (match >= 0) setActive(match, "typeahead", event);
  }
}

function onFilterInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!setSearch(target.value, "input", event)) target.value = searchModel.value;
}

function onFilterKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    listboxRef.value?.focus();
    const index = event.key === "ArrowDown" ? findEnabledIndex() : findLastEnabledIndex();
    if (index >= 0) setActive(index, "keyboard", event);
  } else if (event.key === "Escape" && searchModel.value) {
    event.preventDefault();
    setSearch("", "clear", event);
  }
}

function onFocusIn(event: FocusEvent) {
  focused.value = true;
  if (activeIndex.value < 0) {
    const selectedIndex = visibleOptions.value.findIndex((option) => isOptionSelected(option) && !isItemDisabled(option));
    const index = selectedIndex >= 0 ? selectedIndex : findEnabledIndex();
    const option = visibleOptions.value[index];
    const change = emitDetails("focus", event);
    emit("entry-focus", option, change.details);
    if (change.canceled()) return;
    activeIndex.value = index;
    selectionAnchor.value = activeIndex.value;
  }
}

function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  focused.value = false;
  touched.value = true;
  validationActive.value = true;
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  nextTick(() => listboxRef.value?.focus());
}

function normalizeActiveIndex() {
  if (activeIndex.value < 0) return;
  const option = visibleOptions.value[activeIndex.value];
  if (option && !isItemDisabled(option)) return;
  activeIndex.value = findEnabledIndex();
}

function focus() {
  listboxRef.value?.focus();
}

defineExpose({ clear, focus });

onMounted(() => {
  updateValidity(false);
  if (autoFocus) nextTick(() => (filterable ? filterRef.value : listboxRef.value)?.focus());
});
onUpdated(() => {
  normalizeActiveIndex();
  updateValidity();
});
onBeforeUnmount(() => {
  window.clearTimeout(typeaheadTimer);
  unregister?.();
});
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    class="akaza-listbox"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-focused="focused || undefined"
    :data-akaza-filled="isFilled || undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <input
      :id="resolvedId"
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="selectedValues.length ? getFormValue(selectedValues[0]!) : nullableValue"
      :required="isRequired"
      :disabled="isDisabled"
      :aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-listbox-hidden-input"
      @focus="focus"
      @invalid="onInvalid"
    >
    <input
      v-for="value in selectedValues.slice(1)"
      :key="getFormValue(value)"
      type="hidden"
      :name="resolvedName"
      :value="getFormValue(value)"
      :disabled="isDisabled"
      :class="ui?.hiddenInput"
      class="akaza-listbox-hidden-input"
    >

    <input
      v-if="filterable"
      ref="filterRef"
      :value="searchModel"
      type="search"
      :placeholder="filterPlaceholder"
      :disabled="isDisabled"
      :readonly="readOnly"
      :aria-controls="listboxId"
      :class="ui?.filter"
      class="akaza-listbox-filter"
      @input="onFilterInput"
      @keydown="onFilterKeydown"
    >

    <div
      :id="listboxId"
      :ref="setListboxRef"
      role="listbox"
      :tabindex="isDisabled ? -1 : 0"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="describedBy"
      :aria-activedescendant="activeOptionId"
      :aria-multiselectable="multiple || undefined"
      :aria-orientation="orientation"
      :aria-disabled="isDisabled || undefined"
      :aria-readonly="readOnly || undefined"
      :aria-required="isRequired || undefined"
      :aria-invalid="isInvalid || undefined"
      :class="ui?.content"
      :style="virtualize ? [virtualContainerProps.style, virtualContainerStyle] : undefined"
      class="akaza-listbox-content"
      @scroll="virtualize && virtualContainerProps.onScroll()"
      @keydown="onKeydown"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
    >
      <div
        v-if="!hasSelectableOption"
        :class="ui?.empty"
        class="akaza-listbox-empty"
      >
        <slot name="empty">{{ emptyLabel }}</slot>
      </div>
      <div
        v-else
        :class="ui?.virtualWrapper"
        :style="virtualize ? virtualWrapperProps.style : undefined"
        class="akaza-listbox-virtual-wrapper"
      >
        <template
          v-for="row in renderedRows"
          :key="getOptionKey(row.data, row.index)"
        >
          <div
            v-if="row.data.type === 'label'"
            role="presentation"
            :class="ui?.groupLabel"
            class="akaza-listbox-group-label"
          >
            <slot name="group-label" :option="row.data" :label="getLabel(row.data)">
              {{ getLabel(row.data) }}
            </slot>
          </div>
          <div
            v-else-if="row.data.type === 'separator'"
            role="separator"
            :class="ui?.separator"
            class="akaza-listbox-separator"
          />
          <div
            v-else
            :id="`${listboxId}-option-${row.index}`"
            :ref="(element) => setOptionRef(element, row.index)"
            role="option"
            :aria-selected="isOptionSelected(row.data)"
            :aria-disabled="isItemDisabled(row.data) || undefined"
            :data-akaza-state="isOptionSelected(row.data) ? 'checked' : 'unchecked'"
            :data-state="isOptionSelected(row.data) ? 'checked' : 'unchecked'"
            :data-akaza-highlighted="activeIndex === row.index || undefined"
            :data-akaza-disabled="isItemDisabled(row.data) || undefined"
            :class="ui?.option"
            class="akaza-listbox-option"
            @click="selectOption(row.data, row.index, $event)"
            @mouseenter="highlightOnHover && !isItemDisabled(row.data) && setActive(row.index, 'pointer', $event)"
          >
            <slot
              :name="row.data.slot ?? 'option'"
              :option="row.data"
              :value="getValue(row.data)"
              :label="getLabel(row.data)"
              :description="getDescription(row.data)"
              :is-selected="isOptionSelected(row.data)"
              :is-highlighted="activeIndex === row.index"
              :is-disabled="isItemDisabled(row.data)"
              :select="(event?: MouseEvent | KeyboardEvent) => selectOption(row.data, row.index, event)"
            >
              <span :class="ui?.indicator" class="akaza-listbox-indicator" aria-hidden="true">
                {{ isOptionSelected(row.data) ? "✓" : "" }}
              </span>
              <span :class="ui?.optionText" class="akaza-listbox-option-text">
                <span :class="ui?.optionLabel" class="akaza-listbox-option-label">
                  {{ getLabel(row.data) }}
                </span>
                <span
                  v-if="getDescription(row.data)"
                  :class="ui?.optionDescription"
                  class="akaza-listbox-option-description"
                >
                  {{ getDescription(row.data) }}
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
@layer akaza-reset {
  .akaza-listbox {
    position: relative;
    min-width: 0;
  }

  .akaza-listbox-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .akaza-listbox-content {
    min-width: 0;
    overflow: auto;
    outline: none;
  }

  .akaza-listbox-virtual-wrapper {
    min-width: 100%;
  }
}
</style>
