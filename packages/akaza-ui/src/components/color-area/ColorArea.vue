<script setup lang="ts">
import type { ColorAreaProps } from ".";
import type { ColorChannel } from "../../composables/color";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useTemplateRef } from "vue";
import { channelInfo, clamp, round } from "../../composables/color/engine";
import { useColorCanvas } from "../../composables/color/useColorCanvas";
import { useColorControl } from "../../composables/color/useColorControl";
import { useColorInteraction } from "../../composables/color/useColorInteraction";

const props = defineProps<ColorAreaProps>();
const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  "value-commit": [value: string, details: AkazaChangeEventDetails];
}>();
const model = defineModel<string>({ default: "#ff0000" });
const root = useTemplateRef<HTMLElement>("root");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const input = useTemplateRef<HTMLInputElement>("input");
const xInput = useTemplateRef<HTMLInputElement>("xInput");
const control = useColorControl(model, props, emit, input, () =>
  xInput.value?.focus({ preventScroll: true }),
);
const space = computed(() => props.colorSpace ?? "hsb");
const x = computed(() => props.xChannel ?? "saturation");
const y = computed(() => props.yChannel ?? "brightness");
const xInfo = computed(() => channelInfo(space.value, x.value));
const yInfo = computed(() => channelInfo(space.value, y.value));
const compatible = computed(() => Boolean(xInfo.value && yInfo.value && x.value !== y.value));
const xValue = computed(() => control.color.getChannel(space.value, x.value));
const yValue = computed(() => control.color.getChannel(space.value, y.value));
const xRatio = computed(() =>
  xInfo.value ? clamp((xValue.value - xInfo.value.min) / (xInfo.value.max - xInfo.value.min)) : 0,
);
const yRatio = computed(() =>
  yInfo.value ? clamp((yValue.value - yInfo.value.min) / (yInfo.value.max - yInfo.value.min)) : 0,
);
useColorCanvas(canvas, control.color, () => ({
  space: space.value,
  x: x.value,
  y: y.value,
  rtl: props.dir === "rtl",
}));
function set(changes: Partial<Record<ColorChannel, number>>, reason: string, event: Event) {
  if (control.blocked() || !compatible.value) {
    if (event.target instanceof HTMLInputElement)
      event.target.value = String(
        control.color.getChannel(space.value, Object.keys(changes)[0] as ColorChannel),
      );
    return;
  }
  control.color.setChannels(space.value, changes, reason, event);
  control.changed();
}
const pointer = useColorInteraction(
  root,
  () => control.blocked() || !compatible.value,
  (event) => {
    const rect = canvas.value?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height || !xInfo.value || !yInfo.value) return;
    const fraction = clamp((event.clientX - rect.left) / rect.width);
    set(
      {
        [x.value]:
          xInfo.value.min +
          (props.dir === "rtl" ? 1 - fraction : fraction) * (xInfo.value.max - xInfo.value.min),
        [y.value]:
          yInfo.value.min +
          clamp(1 - (event.clientY - rect.top) / rect.height) * (yInfo.value.max - yInfo.value.min),
      },
      "pointer",
      event,
    );
  },
  (event) => control.color.commit("pointer", event),
  () => xInput.value?.focus({ preventScroll: true }),
);
function keydown(event: KeyboardEvent, channel: ColorChannel) {
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
  const info = channelInfo(space.value, channel);
  if (control.blocked() || !info) {
    event.preventDefault();
    return;
  }
  const step = props.step ?? info.step;
  let next: number;
  if (event.key === "Home") next = info.min;
  else if (event.key === "End") next = info.max;
  else if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.key)
  ) {
    let direction = ["ArrowUp", "ArrowRight", "PageUp"].includes(event.key) ? 1 : -1;
    if (
      channel === x.value &&
      props.dir === "rtl" &&
      ["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      direction *= -1;
    next =
      control.color.getChannel(space.value, channel) +
      direction * step * (event.shiftKey || event.key.startsWith("Page") ? 10 : 1);
  } else return;
  event.preventDefault();
  set({ [channel]: clamp(next, info.min, info.max) }, "keyboard", event);
  control.color.commit("keyboard", event);
}
</script>

<template>
  <span
    ref="root"
    role="group"
    :aria-label="ariaLabel ?? 'Color'"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :class="ui?.root"
    v-bind="control.attrs.value"
    :data-akaza-dragging="pointer.dragging.value || undefined"
    :data-akaza-color-space="space"
    class="akaza-color-area"
    @focusin="control.onFocus"
    @focusout="control.onBlur"
    @pointerdown="pointer.onPointerdown"
    @pointermove="pointer.onPointermove"
    @pointerup="pointer.onPointerup"
    @pointercancel="pointer.onPointercancel"
    @lostpointercapture="pointer.onLostpointercapture"
  >
    <canvas
      ref="canvas"
      :class="ui?.area"
      aria-hidden="true"
      class="akaza-color-area-area"
    />
    <input
      :id="control.id.value"
      ref="xInput"
      type="range"
      :name="xName"
      :min="xInfo?.min ?? 0"
      :max="xInfo?.max ?? 100"
      :step="step ?? xInfo?.step ?? 1"
      :value="round(xValue)"
      :disabled="control.disabled.value || !compatible"
      :tabindex="control.disabled.value || !compatible ? -1 : 0"
      :aria-label="xLabel ?? `${ariaLabel ?? 'Color'} ${xInfo?.label ?? x}`"
      :aria-describedby="control.describedBy.value"
      :aria-invalid="control.invalid.value || undefined"
      :aria-readonly="readOnly || undefined"
      :aria-valuetext="`${Number(xValue.toFixed(3))}, ${control.color.value.value}`"
      :class="ui?.xInput"
      class="akaza-color-axis akaza-color-area-x-input"
      @keydown="keydown($event, x)"
      @input="set({ [x]: Number(($event.target as HTMLInputElement).value) }, 'input', $event)"
      @change="control.color.commit('input', $event)"
    >
    <input
      :id="`${control.id.value}-y`"
      type="range"
      :name="yName"
      :min="yInfo?.min ?? 0"
      :max="yInfo?.max ?? 100"
      :step="step ?? yInfo?.step ?? 1"
      :value="round(yValue)"
      :disabled="control.disabled.value || !compatible"
      :tabindex="control.disabled.value || !compatible ? -1 : 0"
      :aria-label="yLabel ?? `${ariaLabel ?? 'Color'} ${yInfo?.label ?? y}`"
      :aria-describedby="control.describedBy.value"
      aria-orientation="vertical"
      :aria-invalid="control.invalid.value || undefined"
      :aria-readonly="readOnly || undefined"
      :aria-valuetext="`${Number(yValue.toFixed(3))}, ${control.color.value.value}`"
      :class="ui?.yInput"
      class="akaza-color-axis akaza-color-area-y-input"
      @keydown="keydown($event, y)"
      @input="set({ [y]: Number(($event.target as HTMLInputElement).value) }, 'input', $event)"
      @change="control.color.commit('input', $event)"
    >
    <span
      :style="{
        left: `${round((dir === 'rtl' ? 1 - xRatio : xRatio) * 100)}%`,
        bottom: `${round(yRatio * 100)}%`,
        '--akaza-color': control.color.cssColor.value,
      }"
      :class="ui?.thumb"
      aria-hidden="true"
      class="akaza-color-area-thumb"
    ><slot
      name="thumb"
      :value="control.color.value.value"
      :x="xValue"
      :y="yValue"
    /></span>
    <input
      ref="input"
      type="text"
      :value="control.color.value.value"
      :name="control.name.value"
      :disabled="control.disabled.value"
      :required="control.required.value"
      tabindex="-1"
      aria-hidden="true"
      :class="ui?.input"
      class="akaza-color-control-input akaza-color-area-input"
      @invalid="control.onInvalid"
    >
  </span>
</template>

<style>
@layer akaza-reset {
  .akaza-color-area {
    display: block;
    position: relative;
    touch-action: none;
    user-select: none;
  }
  .akaza-color-area-area {
    display: block;
    width: 100%;
    height: 100%;
  }
  .akaza-color-area-thumb {
    position: absolute;
    transform: translate(-50%, 50%);
    pointer-events: none;
  }
}
</style>
