<script setup lang="ts">
import type { ColorSliderProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, ref, useTemplateRef } from "vue";
import { channelInfo, clamp, gradient, parseColor, round } from "../../composables/color/engine";
import { useColorControl } from "../../composables/color/useColorControl";
import { useColorInteraction } from "../../composables/color/useColorInteraction";

const props = defineProps<ColorSliderProps>();
const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  "value-commit": [value: string, details: AkazaChangeEventDetails];
}>();
const model = defineModel<string>({ default: "#ff0000" });
const root = useTemplateRef<HTMLElement>("root");
const track = useTemplateRef<HTMLElement>("track");
const axis = useTemplateRef<HTMLInputElement>("axis");
const input = useTemplateRef<HTMLInputElement>("input");
const focusVisible = ref(false);
let pointerFocus = false;
const control = useColorControl(model, props, emit, input, () =>
  axis.value?.focus({ preventScroll: true }),
);
const space = computed(() => props.colorSpace ?? "hsb");
const channel = computed(() => props.channel ?? "hue");
const info = computed(() => channelInfo(space.value, channel.value));
const value = computed(() => control.color.getChannel(space.value, channel.value));
const vertical = computed(() => props.orientation === "vertical");
const reverse = computed(
  () => Boolean(props.inverted) !== (!vertical.value && props.dir === "rtl"),
);
const ratio = computed(() =>
  info.value ? clamp((value.value - info.value.min) / (info.value.max - info.value.min)) : 0,
);
const visual = computed(() => (reverse.value ? 1 - ratio.value : ratio.value));
const background = computed(() =>
  gradient(
    // HSL literals retain hue/saturation at black and white for the lightness preview.
    parseColor((space.value === "hsl" ? control.color.toString("hsl") : control.color.cssColor.value) || "#ff0000")!,
    space.value,
    channel.value,
    vertical.value
      ? reverse.value
        ? "to bottom"
        : "to top"
      : reverse.value
        ? "to left"
        : "to right",
    control.color.getChannel(space.value, "hue"),
  ),
);
function change(next: number, reason: string, event: Event) {
  if (control.blocked() || !info.value) {
    if (event.target instanceof HTMLInputElement) event.target.value = String(value.value);
    return;
  }
  const step =
    props.step && props.step > 0 && Number.isFinite(props.step) ? props.step : info.value.step;
  const snapped = Number(
    (Math.round((next - info.value.min) / step) * step + info.value.min).toFixed(6),
  );
  control.color.setChannels(
    space.value,
    { [channel.value]: clamp(snapped, info.value.min, info.value.max) },
    reason,
    event,
  );
  control.changed();
}
const pointer = useColorInteraction(
  root,
  control.blocked,
  (event) => {
    const rect = track.value?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height || !info.value) return;
    const raw = vertical.value
      ? 1 - (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width;
    const fraction = reverse.value ? 1 - raw : raw;
    change(info.value.min + clamp(fraction) * (info.value.max - info.value.min), "pointer", event);
  },
  (event) => control.color.commit("pointer", event),
  () => axis.value?.focus({ preventScroll: true }),
);
function onPointerdown(event: PointerEvent) {
  // Programmatically focusing a range input may match :focus-visible after a pointer press.
  pointerFocus = true;
  focusVisible.value = false;
  pointer.onPointerdown(event);
}
function onFocusin(event: FocusEvent) {
  control.onFocus();
  focusVisible.value = Boolean(!pointerFocus && axis.value && event.target === axis.value && axis.value.matches(":focus-visible"));
}
function onFocusout(event: FocusEvent) {
  control.onBlur(event);
  if (!root.value?.contains(event.relatedTarget as Node | null)) {
    pointerFocus = false;
    focusVisible.value = false;
  }
}
function onKeyboard() {
  pointerFocus = false;
  if (axis.value && axis.value === document.activeElement) focusVisible.value = true;
}
function keydown(event: KeyboardEvent) {
  if (
    ![
      "Home",
      "End",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "PageUp",
      "PageDown",
    ].includes(event.key)
  )
    return;
  if (control.blocked()) {
    event.preventDefault();
    return;
  }
  const step = props.step ?? info.value?.step ?? 1;
  let next: number;
  if (event.key === "Home") next = info.value?.min ?? 0;
  else if (event.key === "End") next = info.value?.max ?? 100;
  else if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.key)
  ) {
    let sign = ["ArrowUp", "ArrowRight", "PageUp"].includes(event.key) ? 1 : -1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") sign *= reverse.value ? -1 : 1;
    next = value.value + sign * step * (event.key.startsWith("Page") || event.shiftKey ? 10 : 1);
  } else return;
  event.preventDefault();
  change(next, "keyboard", event);
  control.color.commit("keyboard", event);
}
</script>

<template>
  <span
    ref="root"
    :class="ui?.root"
    v-bind="control.attrs.value"
    :data-akaza-focus-visible="focusVisible || undefined"
    :data-akaza-channel="channel"
    :data-akaza-orientation="orientation ?? 'horizontal'"
    :data-akaza-dragging="pointer.dragging.value || undefined"
    class="akaza-color-slider"
    @focusin="onFocusin"
    @focusout="onFocusout"
    @keydown="onKeyboard"
    @pointerdown="onPointerdown"
    @pointermove="pointer.onPointermove"
    @pointerup="pointer.onPointerup"
    @pointercancel="pointer.onPointercancel"
    @lostpointercapture="pointer.onLostpointercapture"
  >
    <span
      ref="track"
      :style="{ backgroundImage: background }"
      :class="ui?.track"
      class="akaza-color-slider-track"
    ><slot
      name="track"
      :value="control.color.value.value"
      :channel="channel"
    /></span>
    <input
      :id="control.id.value"
      ref="axis"
      type="range"
      :min="info?.min ?? 0"
      :max="info?.max ?? 100"
      :step="step ?? info?.step ?? 1"
      :value="round(value)"
      :disabled="control.disabled.value || !info"
      :tabindex="control.disabled.value || !info ? -1 : 0"
      :aria-label="ariaLabel ?? info?.label"
      :aria-labelledby="ariaLabelledby ?? (ariaLabel ? undefined : control.labelledBy.value)"
      :aria-describedby="control.describedBy.value"
      :aria-orientation="orientation ?? 'horizontal'"
      :aria-readonly="readOnly || undefined"
      :aria-invalid="control.invalid.value || undefined"
      :aria-valuetext="`${Number(value.toFixed(3))}, ${control.color.value.value}`"
      :data-akaza-focus-visible="focusVisible || undefined"
      :class="ui?.axis"
      class="akaza-color-axis akaza-color-slider-axis"
      @keydown="keydown"
      @input="change(Number(($event.target as HTMLInputElement).value), 'input', $event)"
      @change="control.color.commit('input', $event)"
    >
    <span
      :style="{
        ...(vertical ? { bottom: `${round(visual * 100)}%` } : { left: `${round(visual * 100)}%` }),
        '--akaza-color': control.color.cssColor.value,
      }"
      :class="ui?.thumb"
      aria-hidden="true"
      class="akaza-color-slider-thumb"
    ><slot
      name="thumb"
      :value="control.color.value.value"
      :channel-value="value"
      :percentage="visual * 100"
    /></span>
    <input
      ref="input"
      type="text"
      :value="control.color.value.value"
      :name="control.name.value"
      :required="control.required.value"
      :disabled="control.disabled.value"
      tabindex="-1"
      aria-hidden="true"
      :class="ui?.input"
      class="akaza-color-control-input akaza-color-slider-input"
      @invalid="control.onInvalid"
    >
  </span>
</template>

<style>
@layer akaza-reset {
  .akaza-color-slider {
    position: relative;
    display: flex;
    align-items: center;
    touch-action: none;
    user-select: none;
  }
  .akaza-color-slider-track {
    display: block;
    flex: 1;
    position: relative;
  }
  .akaza-color-slider-thumb {
    position: absolute;
    pointer-events: none;
    transform: translateX(-50%);
  }
  .akaza-color-slider[data-akaza-orientation="vertical"] {
    flex-direction: column;
  }
  .akaza-color-slider[data-akaza-orientation="vertical"] .akaza-color-slider-thumb {
    transform: translateY(50%);
  }
}
</style>
