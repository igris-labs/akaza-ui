<script setup lang="ts">
import type { SelectModelValue, SelectOption, SelectProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { isComposing } from "@ui-sdk/core";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef, watch } from "vue";
import { useCollectionSelection } from "../../composables/internal/sdk/useCollectionSelection";
import { useListNavigation } from "../../composables/internal/sdk/useListNavigation";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { useTypeaheadSearch } from "../../composables/internal/sdk/useTypeaheadSearch";
import { createChangeDetails } from "../../utils/changeEvent";
import { getFocusableElements } from "../../utils/focusable";
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
  placeholder = "Select option",
  multiple = false,
  nullableValue = "",
  id,
  name,
  required = false,
  disabled = false,
  invalid = false,
  loop = true,
  autocomplete = false,
  filter,
  loading = false,
  emptyLabel = "No options found.",
  searchPlaceholder = "Search options...",
  resetSearchOnSelect = false,
  highlightOnHover = true,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  teleport = false,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<SelectProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  "value-change": [value: SelectModelValue, details: AkazaChangeEventDetails];
  "search-change": [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<SelectModelValue>({ default: "" });
const openModel = defineModel<boolean>("open", { default: false });
const searchModel = defineModel<string>("search", { default: "" });
const initialValue: SelectModelValue = Array.isArray(model.value) ? [...model.value] : model.value;

const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const nativeRef = useTemplateRef<HTMLSelectElement>("nativeRef");
const triggerRef = useTemplateRef<HTMLButtonElement>("triggerRef");
const searchRef = useTemplateRef<HTMLInputElement>("searchRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const optionRefs = ref<Array<HTMLElement | null>>([]);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const { nativeInvalid, syncValidity, registerControl } = useFieldControl(field);
let typeaheadFocusRequest = 0;
const { isInternalFocusMove } = usePopupInteraction({
  root: rootRef,
  content: contentRef,
  open: openModel,
  focusTarget: () => searchRef.value ?? triggerRef.value,
});

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-select-${autoId}`);
const contentId = `akaza-select-content-${autoId}`;
const listboxId = `${contentId}-listbox`;
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const selectedValues = computed(() => {
  if (Array.isArray(model.value)) return model.value;
  return model.value === nullableValue ? [] : [model.value];
});
const selectedOptions = computed(() =>
  options.filter((option) => isSelectableOption(option) && selectedValues.value.includes(getValue(option))),
);
const selectedOption = computed(() => selectedOptions.value[0]);
const selectedLabel = computed(() =>
  selectedOptions.value.map((option) => getLabel(option)).join(", "),
);
const isFilled = computed(() => selectedValues.value.length > 0);
const isDirty = computed(() => !modelValuesEqual(model.value, initialValue));
const activeIndex = ref(-1);
const visibleOptions = computed(() => {
  const query = searchModel.value.trim().toLowerCase();
  if (!autocomplete || !query) return options;
  return options.filter((option) => {
    if (!isSelectableOption(option)) return true;
    if (filter) return filter(option, searchModel.value);
    return getLabel(option).toLowerCase().includes(query)
      || getDescription(option)?.toLowerCase().includes(query);
  });
});
const typeahead = useTypeaheadSearch({ items: () => visibleOptions.value, label: getLabel, disabled: isItemDisabled });
const navigationItems = computed(() => visibleOptions.value.map((option, index) => ({
  value: `${contentId}-option-${index}`,
  label: getLabel(option),
  disabled: isItemDisabled(option),
})));
const navigation = useListNavigation({
  items: () => navigationItems.value,
  active: () => navigationItems.value[activeIndex.value]?.value ?? null,
  loop: () => loop,
});
const hasVisibleOption = computed(() => visibleOptions.value.some(isSelectableOption));
const activeOptionId = computed(() =>
  openModel.value && !loading && visibleOptions.value[activeIndex.value] && !isItemDisabled(visibleOptions.value[activeIndex.value]!) ? `${contentId}-option-${activeIndex.value}` : undefined,
);
watch(visibleOptions, (current, previous) => {
  const active = previous[activeIndex.value];
  const preserved = active ? current.findIndex(option => !isItemDisabled(option) && getValue(option) === getValue(active)) : -1;
  activeIndex.value = preserved >= 0 ? preserved : current.findIndex(option => !isItemDisabled(option));
}, { flush: "sync" });

const triggerProps = computed(() => ({
  id: resolvedId.value,
  "aria-haspopup": "listbox" as const,
  "aria-expanded": openModel.value,
  "aria-controls": openModel.value ? listboxId : undefined,
  "aria-activedescendant": autocomplete ? undefined : activeOptionId.value,
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

let closeReason: string | undefined;
let portalTabTarget: HTMLElement | undefined;
const popup = usePopup({
  kind: "select",
  open: openModel,
  content: contentRef,
  contentId,
  trigger: () => triggerRef.value,
  anchor: () => rootRef.value,
  initialFocus: "none",
  finalFocus: "none",
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: () => 8,
  matchWidth: () => true,
  constrainSize: true,
  cssVarPrefix: "akaza-select",
  transition: () => "akaza-select",
  request: commitOpen,
});
const { present, contentAttrs, triggerAttrs: popupTriggerAttrs, actualAlign, actualSide, style: contentStyle, layerOrder } = popup;
const layeredContentStyle = computed(() => ({
  ...contentStyle.value,
  "--akaza-layer-order": layerOrder.value,
}));

registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
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

function modelValuesEqual(left: SelectModelValue, right: SelectModelValue) {
  const leftValues = Array.isArray(left) ? left : left === nullableValue ? [] : [left];
  const rightValues = Array.isArray(right) ? right : right === nullableValue ? [] : [right];
  return leftValues.length === rightValues.length
    && leftValues.every((value, index) => value === rightValues[index]);
}

useFormReset(() => nativeRef.value, () => {
  model.value = Array.isArray(initialValue) ? [...initialValue] : initialValue;
  touched.value = false;
  validationActive.value = false;
  nativeInvalid.value = false;
  openModel.value = false;
  searchModel.value = "";
  activeIndex.value = -1;
});

function updateValidity(reveal = validationActive.value) {
  const select = nativeRef.value;
  if (!select) return;
  select.setCustomValidity(isRequired.value && !isFilled.value ? "Please select an option." : "");
  syncValidity(select, reveal);
}

function findEnabledIndex(start = 0): number {
  if (loading) return -1;
  const index = visibleOptions.value.findIndex((option, i) => i >= start && !isItemDisabled(option));
  if (index >= 0) return index;
  return visibleOptions.value.findIndex((option) => !isItemDisabled(option));
}

function setOptionRef(el: HTMLElement | null, index: number) {
  optionRefs.value[index] = el;
}

function focusOption(index: number) {
  if (!openModel.value || loading || nativeRef.value?.matches(":disabled")) return;
  const option = visibleOptions.value[index];
  if (!option || isItemDisabled(option)) return;
  activeIndex.value = index;
  scrollWithin(optionRefs.value[index], contentRef.value?.querySelector<HTMLElement>(".akaza-select-viewport"));
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if (((isDisabled.value || nativeRef.value?.matches(":disabled")) && next) || openModel.value === next) return;
  popup.setOpen(next, reason, event);
}

function commitOpen(next: boolean, sdkReason: string, event?: Event) {
  if (((isDisabled.value || nativeRef.value?.matches(":disabled")) && next) || openModel.value === next) return;
  const reason = ({
    "escape-key": "escape",
    "outside-press": "outside-click",
    "trigger-press": "trigger",
    "focus-out": "blur",
    "window-blur": "blur",
    imperative: "programmatic",
  } as Record<string, string>)[sdkReason] ?? sdkReason;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", next, changeEvent.details);
  if (changeEvent.canceled()) {
    if (reason === "tab") portalTabTarget = undefined;
    return;
  }
  closeReason = next ? undefined : reason;
  openModel.value = next;
  if (openModel.value !== next) return;
  if (!next) {
    typeahead.reset();
    typeaheadFocusRequest++;
  }
  // Exclude leaving content before native Tab and modal focus handlers run.
  if (!next) contentRef.value?.setAttribute("inert", "");
  else contentRef.value?.removeAttribute("inert");
}

function commitSelection(values: string[], reason: string, event?: Event): boolean {
  validationActive.value = true;
  const value = multiple ? values : values[0] ?? nullableValue;
  const changeEvent = createChangeDetails(reason, event);
  emit("value-change", value, changeEvent.details);
  if (changeEvent.canceled()) return false;
  model.value = value;
  if (resetSearchOnSelect) setSearch("", "select", event);
  if (!multiple) setOpen(false, "select", event);
  updateValidity();
  return true;
}

const selection = useCollectionSelection<string>({
  value: () => selectedValues.value,
  equals: (left, right) => left === right,
  change: commitSelection,
});

function selectOption(option: SelectOption, event?: Event) {
  if (loading || nativeRef.value?.matches(":disabled") || isItemDisabled(option)) return;
  selection.select(getValue(option), multiple, event ? "select" : "programmatic", event);
}

function move(step: number | "first" | "last", event: KeyboardEvent) {
  if (!openModel.value || loading || isDisabled.value || nativeRef.value?.matches(":disabled")) return;
  const target = navigation.move(step, event);
  const index = navigationItems.value.findIndex(item => item.value === target);
  if (index >= 0) focusOption(index);
}

async function moveToEdge(step: "first" | "last", event: KeyboardEvent) {
  const request = ++typeaheadFocusRequest;
  if (!openModel.value) {
    setOpen(true, "keyboard", event);
    await nextTick();
  }
  if (request === typeaheadFocusRequest) move(step, event);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (isDisabled.value || nativeRef.value?.matches(":disabled") || event.defaultPrevented || isComposing(event) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === " " && typeahead.active()) {
    onTypeahead(event);
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else move(event.key === "ArrowDown" ? 1 : -1, event);
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!openModel.value) setOpen(true, "keyboard", event);
    else if (visibleOptions.value[activeIndex.value]) selectOption(visibleOptions.value[activeIndex.value]!, event);
    return;
  }
  if (event.key === "Escape") {
    if (!openModel.value) return;
    event.preventDefault();
    setOpen(false, "escape", event);
    return;
  }
  if (event.key === "Home") {
    event.preventDefault();
    void moveToEdge("first", event);
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    void moveToEdge("last", event);
    return;
  }
  onTypeahead(event);
}

async function onTypeahead(event: KeyboardEvent) {
  const index = typeahead.search(event, activeIndex.value);
  if (index < 0) return;
  const option = visibleOptions.value[index]!;
  const request = ++typeaheadFocusRequest;
  const opening = !openModel.value;
  if (opening) setOpen(true, "keyboard", event);
  if (!openModel.value) return;
  focusOption(index);
  if (!opening) return;
  // Opening reconciles selection after render; retain the typed target instead.
  await nextTick();
  if (request !== typeaheadFocusRequest || !openModel.value || isDisabled.value) return;
  const current = visibleOptions.value.findIndex(item => getValue(item) === getValue(option) && !isItemDisabled(item));
  if (current >= 0) focusOption(current);
}

function setSearch(value: string, reason: string, event?: Event) {
  const changeEvent = createChangeDetails(reason, event);
  emit("search-change", value, changeEvent.details);
  if (changeEvent.canceled()) return false;
  searchModel.value = value;
  if (searchModel.value === value) activeIndex.value = findEnabledIndex();
  return true;
}

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!setSearch(target.value, "input", event) || target.value !== searchModel.value) target.value = searchModel.value;
}

function onSearchKeydown(event: KeyboardEvent) {
  if (isDisabled.value || nativeRef.value?.matches(":disabled") || event.defaultPrevented || isComposing(event) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Tab" && teleport !== false) {
    const trigger = triggerRef.value;
    if (trigger) {
      // Follow the trigger's logical tab order, not the portal's DOM position.
      const modal = trigger.closest<HTMLElement>('[aria-modal="true"]');
      const controls = getFocusableElements(modal ?? trigger.ownerDocument.body)
        .filter(element => !contentRef.value?.contains(element));
      const index = controls.indexOf(trigger);
      if (index >= 0) {
        portalTabTarget = controls[index + (event.shiftKey ? -1 : 1)]
          ?? (modal ? controls[event.shiftKey ? controls.length - 1 : 0] : undefined);
      }
      if (portalTabTarget) event.preventDefault();
    }
    setOpen(false, "tab", event);
    if (!event.defaultPrevented && !openModel.value) trigger?.focus({ preventScroll: true });
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    move(event.key === "ArrowDown" ? 1 : -1, event);
  } else if (event.key === "Enter" && activeIndex.value >= 0) {
    event.preventDefault();
    const option = visibleOptions.value[activeIndex.value];
    if (option) selectOption(option, event);
  } else if (event.key === "Escape") {
    event.preventDefault();
    setOpen(false, "escape", event);
  } else if (event.key === "Home") {
    event.preventDefault();
    move("first", event);
  } else if (event.key === "End") {
    event.preventDefault();
    move("last", event);
  }
}

function onNativeChange(event: Event) {
  validationActive.value = true;
  const select = event.target as HTMLSelectElement;
  const restoreAcceptedSelection = () => nextTick(() => {
    for (const option of Array.from(select.options)) option.selected = selectedValues.value.includes(option.value);
    updateValidity();
  });
  if (multiple) {
    const next = Array.from(select.selectedOptions).map((option) => option.value);
    const changeEvent = createChangeDetails("native", event);
    emit("value-change", next, changeEvent.details);
    if (!changeEvent.canceled()) model.value = next;
    restoreAcceptedSelection();
    updateValidity();
    return;
  }

  const option = options.find((item) => isSelectableOption(item) && getValue(item) === select.value);
  if (option) selectOption(option, event);
  else {
    const changeEvent = createChangeDetails("native", event);
    emit("value-change", nullableValue, changeEvent.details);
    if (!changeEvent.canceled()) model.value = nullableValue;
    updateValidity();
  }
  restoreAcceptedSelection();
}

function onFocusIn() {
  focused.value = true;
}

function onFocusOut(event: FocusEvent) {
  if (isInternalFocusMove(event)) return;
  typeahead.reset();
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  setOpen(false, "blur", event);
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  nextTick(() => triggerRef.value?.focus());
}

onMounted(() => {
  updateValidity(false);
});
onUpdated(updateValidity);
watch(openModel, async (open, _previous, cleanup) => {
  const reason = closeReason;
  closeReason = undefined;
  const tabTarget = portalTabTarget;
  portalTabTarget = undefined;
  let stale = false;
  cleanup(() => { stale = true; });
  if (!open) {
    if (reason === "escape" || reason === "select") triggerRef.value?.focus({ preventScroll: true });
    typeahead.reset();
    typeaheadFocusRequest++;
    activeIndex.value = -1;
    if (reason === "tab" && tabTarget) {
      await nextTick();
      if (!stale && !openModel.value && tabTarget.isConnected) tabTarget.focus({ preventScroll: true });
    }
    return;
  }
  const selectedIndex = visibleOptions.value.findIndex((option) => isOptionSelected(option) && !isItemDisabled(option));
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : findEnabledIndex();
  await nextTick();
  if (stale || !openModel.value || typeof document === "undefined") return;
  if (autocomplete) searchRef.value?.focus({ preventScroll: true });
}, { immediate: true });
watch(isDisabled, (value) => {
  if (value && openModel.value) setOpen(false, "disabled");
}, { immediate: true });
onBeforeUnmount(() => {
  typeaheadFocusRequest++;
});
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-select"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <select
      :id="`${resolvedId}-native`"
      ref="nativeRef"
      :name="resolvedName"
      v-bind="multiple ? {} : { value: model }"
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
      v-bind="{ ...popupTriggerAttrs, ...triggerAttrs }"
      type="button"
      role="combobox"
      :disabled="isDisabled"
      :class="ui?.trigger"
      class="akaza-select-trigger"
      @blur="onFocusOut"
      @click="setOpen(!openModel, 'trigger', $event)"
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

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <div
        v-if="present"
        v-bind="contentAttrs"
        :id="contentId"
        ref="contentRef"
        :role="undefined"
        :data-akaza-state="openModel ? 'open' : 'closed'"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :inert="!openModel || undefined"
        :class="ui?.content"
        :style="layeredContentStyle"
        class="akaza-select-content"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
      >
        <input
          v-if="autocomplete"
          ref="searchRef"
          role="searchbox"
          :value="searchModel"
          :placeholder="searchPlaceholder"
          :disabled="isDisabled"
          :aria-controls="listboxId"
          :aria-activedescendant="activeOptionId"
          :aria-label="searchPlaceholder"
          :class="ui?.searchInput"
          class="akaza-select-search-input"
          @input="onSearchInput"
          @keydown="onSearchKeydown"
        >
        <div
          :id="listboxId"
          role="listbox"
          :aria-labelledby="resolvedId"
          :aria-multiselectable="multiple || undefined"
          :aria-busy="loading || undefined"
          :class="ui?.viewport"
          class="akaza-select-viewport"
        >
          <div
            v-if="loading"
            :class="ui?.loading"
            class="akaza-select-loading"
          >
            <slot name="loading">Loading…</slot>
          </div>
          <div
            v-else-if="autocomplete && !hasVisibleOption"
            :class="ui?.empty"
            class="akaza-select-empty"
          >
            <slot name="empty">{{ emptyLabel }}</slot>
          </div>
          <template
            v-for="(option, index) in visibleOptions"
            v-else
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
              :aria-disabled="isItemDisabled(option) || undefined"
              :data-akaza-state="isOptionSelected(option) ? 'checked' : 'unchecked'"
              :data-akaza-highlighted="activeIndex === index || undefined"
              :data-akaza-disabled="isItemDisabled(option) || undefined"
              :class="ui?.option"
              class="akaza-select-option"
              @mousedown.prevent
              @click="selectOption(option, $event)"
              @mouseenter="highlightOnHover && !isItemDisabled(option) && focusOption(index)"
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
                :select="(event?: Event) => selectOption(option, event)"
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
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-select {
    position: relative;
    display: inline-block;
  }

  .akaza-select-native {
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

  .akaza-select-content {
    transform-origin: var(--akaza-select-transform-origin);
    z-index: var(--akaza-z-select, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
    min-width: 0;
  }

  .akaza-select-search-input {
    box-sizing: border-box;
    width: 100%;
  }

  .akaza-select-viewport {
    max-height: min(16rem, 60vh);
    overflow: auto;
  }

  .akaza-select-enter-active,
  .akaza-select-leave-active {
    transition:
      opacity var(--akaza-select-duration, 120ms) ease-out,
      scale var(--akaza-select-duration, 120ms) ease-out,
      translate var(--akaza-select-duration, 120ms) ease-out;
  }

  .akaza-select-enter-from,
  .akaza-select-leave-to {
    opacity: 0;
    scale: 0.98;
  }

  .akaza-select-enter-from[data-akaza-side="bottom"],
  .akaza-select-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
  .akaza-select-enter-from[data-akaza-side="top"],
  .akaza-select-leave-to[data-akaza-side="top"] { translate: 0 4px; }
  .akaza-select-enter-from[data-akaza-side="right"],
  .akaza-select-leave-to[data-akaza-side="right"] { translate: -4px 0; }
  .akaza-select-enter-from[data-akaza-side="left"],
  .akaza-select-leave-to[data-akaza-side="left"] { translate: 4px 0; }

  @media (prefers-reduced-motion: reduce) {
    .akaza-select-enter-active,
    .akaza-select-leave-active {
      transition-duration: 0.01ms;
    }
  }
}
</style>
