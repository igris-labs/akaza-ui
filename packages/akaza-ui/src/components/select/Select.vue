<script setup lang="ts">
import type { SelectModelValue, SelectOption, SelectProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef, watch } from "vue";
import { useFloatingPosition } from "../../utils/floatingPosition";
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
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
let typeahead = "";
let typeaheadTimer: number | undefined;

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
const hasVisibleOption = computed(() => visibleOptions.value.some(isSelectableOption));

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

const { actualAlign, actualSide, style: contentStyle } = useFloatingPosition({
  reference: triggerRef,
  floating: contentRef,
  active: () => openModel.value,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  matchWidth: true,
  cssVarPrefix: "akaza-select",
});

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
  const index = visibleOptions.value.findIndex((option, i) => i >= start && !isItemDisabled(option));
  if (index >= 0) return index;
  return visibleOptions.value.findIndex((option) => !isItemDisabled(option));
}

function setOptionRef(el: HTMLElement | null, index: number) {
  optionRefs.value[index] = el;
}

function focusOption(index: number) {
  activeIndex.value = index;
  optionRefs.value[index]?.scrollIntoView?.({ block: "nearest" });
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if ((isDisabled.value && next) || openModel.value === next) return;
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
  if (resetSearchOnSelect) setSearch("", "select", event);
  if (!multiple) setOpen(false, "select", event);
  updateValidity();
  if (!multiple) triggerRef.value?.focus();
}

function move(delta: number) {
  if (!visibleOptions.value.length) return;
  const count = visibleOptions.value.length;
  let next = activeIndex.value < 0 ? findEnabledIndex() : activeIndex.value;
  for (let step = 0; step < count; step++) {
    next = next + delta;
    if (loop) next = (next + count) % count;
    if (next < 0 || next >= count) return;
    if (!isItemDisabled(visibleOptions.value[next]!)) {
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
    else if (activeIndex.value >= 0) selectOption(visibleOptions.value[activeIndex.value]!, event);
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
    for (let i = visibleOptions.value.length - 1; i >= 0; i--) {
      if (!isItemDisabled(visibleOptions.value[i]!)) {
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
    const index = visibleOptions.value.findIndex((option) =>
      !isItemDisabled(option) && getLabel(option).toLowerCase().startsWith(typeahead),
    );
    if (index >= 0) {
      if (!openModel.value) setOpen(true, "keyboard", event);
      focusOption(index);
    }
  }
}

function setSearch(value: string, reason: string, event?: Event) {
  let canceled = false;
  emit("search-change", value, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) {
    searchModel.value = value;
    activeIndex.value = findEnabledIndex();
  }
}

function onSearchInput(event: Event) {
  setSearch((event.target as HTMLInputElement).value, "input", event);
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    move(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter" && activeIndex.value >= 0) {
    event.preventDefault();
    selectOption(visibleOptions.value[activeIndex.value]!, event);
  } else if (event.key === "Escape") {
    event.preventDefault();
    setOpen(false, "escape", event);
    triggerRef.value?.focus();
  } else if (event.key === "Home") {
    event.preventDefault();
    focusOption(findEnabledIndex());
  } else if (event.key === "End") {
    event.preventDefault();
    for (let index = visibleOptions.value.length - 1; index >= 0; index--) {
      if (!isItemDisabled(visibleOptions.value[index]!)) {
        focusOption(index);
        break;
      }
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

function onFocusIn() {
  focused.value = true;
}

function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  setOpen(false, "blur", event);
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
watch(openModel, async (open) => {
  if (!open) {
    activeIndex.value = -1;
    return;
  }
  const selectedIndex = visibleOptions.value.findIndex((option) => isOptionSelected(option) && !isItemDisabled(option));
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : findEnabledIndex();
  if (autocomplete) {
    await nextTick();
    searchRef.value?.focus();
  }
}, { immediate: true });
watch(isDisabled, (value) => {
  if (value && openModel.value) setOpen(false, "disabled");
});
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
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <select
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

    <Transition name="akaza-select">
      <div
        v-if="openModel"
        :id="contentId"
        ref="contentRef"
        :data-akaza-state="openModel ? 'open' : 'closed'"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :class="ui?.content"
        :style="contentStyle"
        class="akaza-select-content"
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
          :aria-expanded="true"
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
    </Transition>
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

.akaza-select-search-input {
  box-sizing: border-box;
  width: 100%;
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
</style>
