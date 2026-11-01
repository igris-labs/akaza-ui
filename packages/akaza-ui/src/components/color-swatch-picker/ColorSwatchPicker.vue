<script setup lang="ts">
import type { ColorSwatchPickerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { ListboxModelValue, ListboxProps } from "../listbox";
import { computed, watch } from "vue";
import { colorEquals, parseColor, serializeColor } from "../../composables/color/engine";
import { createChangeDetails } from "../../utils/changeEvent";
import { ColorSwatch } from "../color-swatch";
import { Listbox } from "../listbox";

const props = withDefaults(defineProps<ColorSwatchPickerProps>(), {
  loop: true,
  highlightOnHover: true,
  multiple: false,
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  selectionBehavior: "toggle",
  orientation: "horizontal",
  dir: "ltr",
});
const emit = defineEmits<{
  "value-change": [value: string | string[], details: AkazaChangeEventDetails];
  "value-commit": [value: string | string[], details: AkazaChangeEventDetails];
}>();
const model = defineModel<string | string[]>({ default: "" });
const forwarded = computed(() => {
  const { items: _items, format: _format, ui: _ui, ...rest } = props;
  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined),
  ) as Omit<ListboxProps, "options">;
});
function normalize(value: string) {
  return serializeColor(parseColor(value), props.format ?? "hex");
}
const options = computed(() =>
  props.items.map((item) => {
    const data = typeof item === "string" ? { value: item, label: item } : item;
    return {
      ...data,
      value: normalize(data.value),
      color: data.value,
      label: data.label ?? data.value,
      disabled: data.disabled || !parseColor(data.value),
    };
  }),
);
const ui = computed(() => ({
  root: props.ui?.root ?? "",
  content: ["akaza-color-swatch-picker-viewport", props.ui?.viewport].filter(Boolean).join(" "),
  virtualWrapper: ["akaza-color-swatch-picker-content", props.ui?.content].filter(Boolean).join(" "),
  option: ["akaza-color-swatch-picker-item", props.ui?.item].filter(Boolean).join(" "),
  hiddenInput: ["akaza-color-swatch-picker-input", props.ui?.input].filter(Boolean).join(" "),
  empty: ["akaza-color-swatch-picker-empty", props.ui?.empty].filter(Boolean).join(" "),
}));
function onChange(value: ListboxModelValue, details: AkazaChangeEventDetails) {
  const next = Array.isArray(value)
    ? value.map((item) => normalize(String(item)))
    : normalize(String(value));
  const change = createChangeDetails(details.reason, details.event);
  emit("value-change", next, change.details);
  if (change.canceled()) {
    details.cancel();
    return;
  }
  model.value = next;
  emit("value-commit", next, change.details);
}
watch(
  () => props.format,
  (_next, previous) => {
    function reformat(value: string) {
      const original = props.items.find((item) =>
        colorEquals(
          serializeColor(
            parseColor(typeof item === "string" ? item : item.value),
            previous ?? "hex",
          ),
          value,
        ),
      );
      return normalize(
        original ? (typeof original === "string" ? original : original.value) : value,
      );
    }
    const next = Array.isArray(model.value) ? model.value.map(reformat) : reformat(model.value);
    const change = createChangeDetails("format");
    emit("value-change", next, change.details);
    if (!change.canceled()) model.value = next;
  },
);
</script>

<template>
  <Listbox
    v-bind="forwarded"
    :model-value="model"
    :options="options"
    :by="(a, b) => colorEquals(String(a), String(b))"
    :serialize-value="(value) => normalize(String(value))"
    :ui="ui"
    class="akaza-color-swatch-picker"
    @value-change="onChange"
  >
    <template #option="scope">
      <slot
        name="item"
        v-bind="scope"
        :item="scope.option"
        :color="String(scope.option.color)"
      >
        <ColorSwatch
          :color="String(scope.option.color)"
          decorative
          :class="props.ui?.swatch"
          class="akaza-color-swatch-picker-swatch"
        />
        <span
          :class="props.ui?.label"
          class="akaza-color-swatch-picker-label"
        >{{ scope.label }}</span>
        <span
          :class="props.ui?.indicator"
          :data-akaza-state="scope.isSelected ? 'checked' : 'unchecked'"
          class="akaza-color-swatch-picker-indicator"
          aria-hidden="true"
        ><slot
          name="indicator"
          v-bind="scope"
        /></span>
      </slot>
    </template>
    <template #empty><slot name="empty">No colors available.</slot></template>
  </Listbox>
</template>
