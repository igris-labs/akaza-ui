<script setup lang="ts">
import type { ColorFieldProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { channelInfo, clamp, parseColor, round } from "../../composables/color/engine";
import { useColorControl } from "../../composables/color/useColorControl";

const props = withDefaults(defineProps<ColorFieldProps>(), { disableWheelChange: true });
const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  "value-commit": [value: string, details: AkazaChangeEventDetails];
}>();
const model = defineModel<string>({ default: "" });
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const badDraft = ref(false);
const control = useColorControl(
  model,
  props,
  emit,
  inputRef,
  () => inputRef.value?.focus(),
  badDraft,
);
const space = computed(() => props.colorSpace ?? "hsb");
const info = computed(() => (props.channel ? channelInfo(space.value, props.channel) : null));
const numberFormat = computed(
  () => new Intl.NumberFormat(props.locale, { maximumFractionDigits: 4, useGrouping: false }),
);
const displayValue = computed(() =>
  control.color.isEmpty.value ? "" : props.channel && info.value
    ? numberFormat.value.format(control.color.getChannel(space.value, props.channel))
    : control.color.value.value,
);
const draft = ref(displayValue.value);
// Preserve partial edits; only external color/channel/format updates replace the draft.
let editing = false;
let ownChange = false;
watch(
  displayValue,
  (value) => {
    if (!editing || !ownChange) {
      draft.value = value;
      badDraft.value = false;
    }
  },
  { flush: "sync" },
);
watch(control.resetVersion, () => {
  editing = false;
  draft.value = displayValue.value;
});
function numeric(value: string): number | null {
  const decimal =
    numberFormat.value.formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";
  const normalized = value.trim().replace(decimal, ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) || !Number.isFinite(Number(normalized)))
    return null;
  return Number(normalized);
}
function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (control.blocked()) {
    target.value = draft.value;
    return;
  }
  draft.value = target.value;
  editing = ownChange = true;
  let accepted = false;
  if (props.channel && info.value) {
    const value = numeric(draft.value);
    badDraft.value = Boolean(draft.value.trim()) && (value === null || value < info.value.min || value > info.value.max);
    if (!draft.value.trim()) accepted = control.change("", "input", event);
    else if (!badDraft.value)
      accepted = control.color.setChannels(
        space.value,
        { [props.channel]: value! },
        "input",
        event,
      );
  } else {
    badDraft.value = Boolean(draft.value.trim() && !parseColor(draft.value));
    if (!badDraft.value) accepted = control.change(draft.value, "input", event);
  }
  ownChange = false;
  if (!badDraft.value && !accepted) {
    draft.value = displayValue.value;
    target.value = draft.value;
  }
  control.changed();
  control.sync();
}
function onBlur(event: FocusEvent) {
  editing = false;
  if (!badDraft.value) {
    draft.value = displayValue.value;
    control.color.commit("blur", event);
  }
  control.onBlur(event);
}
function adjust(direction: number, event: Event, boundary?: "min" | "max") {
  if (control.blocked()) return;
  if (props.channel && info.value) {
    const value = boundary
      ? info.value[boundary]
      : control.color.getChannel(space.value, props.channel) +
        direction * (props.step ?? info.value.step);
    control.color.setChannels(
      space.value,
      { [props.channel]: clamp(value, info.value.min, info.value.max) },
      "keyboard",
      event,
    );
  } else {
    const hex = control.color.toString("hex").slice(1, 7);
    const value = boundary
      ? boundary === "min"
        ? 0
        : 0xFFFFFF
      : clamp(
          (Number.parseInt(hex || "000000", 16) || 0) + direction * (props.step ?? 1),
          0,
          0xFFFFFF,
        );
    const alpha = control.color.getChannel("hsb", "alpha") / 100;
    const next = `#${Math.round(value).toString(16).padStart(6, "0")}${
      alpha < 1
        ? Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")
        : ""
    }`;
    control.change(next, "keyboard", event);
  }
  draft.value = displayValue.value;
  badDraft.value = false;
  control.changed();
  control.color.commit("keyboard", event);
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    if (!badDraft.value && draft.value === displayValue.value) return;
    event.preventDefault();
    draft.value = displayValue.value;
    badDraft.value = false;
    control.sync();
  } else if (event.key === "Enter") {
    if (!badDraft.value) {
      draft.value = displayValue.value;
      control.color.commit("enter", event);
    }
  } else if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
    event.preventDefault();
    adjust((event.key.endsWith("Up") ? 1 : -1) * (event.key.startsWith("Page") ? 10 : 1), event);
  } else if (props.channel && ["Home", "End"].includes(event.key)) {
    event.preventDefault();
    adjust(0, event, event.key === "Home" ? "min" : "max");
  }
}
function onWheel(event: WheelEvent) {
  if (
    (props.disableWheelChange ?? true) ||
    control.blocked() ||
    document.activeElement !== inputRef.value ||
    !event.deltaY
  )
    return;
  event.preventDefault();
  adjust(event.deltaY < 0 ? 1 : -1, event);
}
watch(
  () => control.color.isEmpty.value,
  () => {
    if (!editing)
      nextTick(() => {
        draft.value = displayValue.value;
      });
  },
);
</script>

<template>
  <span
    :class="ui?.root"
    v-bind="control.attrs.value"
    class="akaza-color-field"
  >
    <input
      :id="control.id.value"
      ref="inputRef"
      type="text"
      :value="draft"
      :role="channel ? 'spinbutton' : undefined"
      :inputmode="channel ? 'decimal' : 'text'"
      :placeholder="placeholder"
      :disabled="control.disabled.value"
      :readonly="readOnly"
      :required="control.required.value"
      :aria-label="ariaLabel ?? info?.label"
      :aria-labelledby="control.labelledBy.value"
      :aria-describedby="control.describedBy.value"
      :aria-invalid="control.invalid.value || undefined"
      :aria-valuemin="info?.min"
      :aria-valuemax="info?.max"
      :aria-valuenow="channel ? round(control.color.getChannel(space, channel)) : undefined"
      :aria-valuetext="channel ? `${draft}, ${control.color.value.value}` : undefined"
      :class="ui?.input"
      v-bind="control.attrs.value"
      class="akaza-color-field-input"
      @input="onInput"
      @focus="control.onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @wheel="onWheel"
      @invalid="control.onInvalid"
    >
    <input
      type="hidden"
      :name="control.name.value"
      :value="control.color.value.value"
      :disabled="control.disabled.value"
      :class="ui?.hiddenInput"
      class="akaza-color-field-hidden-input"
    >
    <slot
      :value="control.color.value.value"
      :draft="draft"
      :is-invalid="control.invalid.value"
    />
  </span>
</template>
