<script setup lang="ts">
import type { ColorPickerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, provide, useTemplateRef } from "vue";
import { colorContextKey, useColorControl } from "../../composables/color/useColorControl";
import { ColorArea } from "../color-area";
import { ColorField } from "../color-field";
import { ColorSlider } from "../color-slider";
import { ColorSwatch } from "../color-swatch";
import { ColorSwatchPicker } from "../color-swatch-picker";

const props = withDefaults(defineProps<ColorPickerProps>(), {
  showAlpha: true,
  showField: true,
  showPreview: true,
});
const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  "value-commit": [value: string, details: AkazaChangeEventDetails];
}>();
const model = defineModel<string>({ default: "#ff0000" });
const root = useTemplateRef<HTMLElement>("root");
const input = useTemplateRef<HTMLInputElement>("input");
const control = useColorControl(model, props, emit, input, () =>
  root.value
    ?.querySelector<HTMLInputElement>(".akaza-color-field-input, .akaza-color-area-x-input")
    ?.focus({ preventScroll: true }),
);
provide(colorContextKey, control.color);
const space = computed(() => props.colorSpace ?? "hsb");
const x = computed(() =>
  ["lch", "oklch"].includes(space.value) ? ("chroma" as const) : ("saturation" as const),
);
const y = computed(() =>
  space.value === "hsb" ? ("brightness" as const) : ("lightness" as const),
);
const childProps = computed(() => ({
  name: "",
  disabled: control.disabled.value,
  readOnly: props.readOnly,
  invalid: props.invalid,
  dir: props.dir ?? "ltr",
}));
const scope = computed(() => ({
  value: control.color.value.value,
  cssColor: control.color.cssColor.value,
  format: control.color.format.value,
  isOutOfGamut: control.color.isOutOfGamut.value,
  setValue: control.color.setValue,
  setChannels: control.color.setChannels,
  getChannel: control.color.getChannel,
}));
function onSwatch(value: string | string[], details: AkazaChangeEventDetails) {
  if (!control.change(String(value), details.reason, details.event)) details.cancel();
  else control.color.commit(details.reason, details.event);
}
</script>

<template>
  <div
    ref="root"
    role="group"
    :aria-label="ariaLabel ?? 'Color picker'"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :class="ui?.root"
    v-bind="control.attrs.value"
    :data-akaza-format="control.color.format.value"
    class="akaza-color-picker"
    @focusin="control.onFocus"
    @focusout="control.onBlur"
  >
    <slot v-bind="scope">
      <slot
        name="area"
        v-bind="scope"
      >
        <ColorArea
          :id="showField ? `${control.id.value}-area` : control.id.value"
          v-bind="childProps"
          :color-space="space"
          :x-channel="x"
          :y-channel="y"
          :aria-label="ariaLabel ?? 'Color'"
          :ui="ui?.area ?? {}"
        />
      </slot>
      <div
        :class="ui?.controls"
        class="akaza-color-picker-controls"
      >
        <slot
          name="hue"
          v-bind="scope"
        >
          <ColorSlider
            :id="`${control.id.value}-hue`"
            v-bind="childProps"
            :color-space="space"
            channel="hue"
            aria-label="Hue"
            :ui="ui?.hue ?? {}"
          />
        </slot>
        <slot
          v-if="showAlpha"
          name="alpha"
          v-bind="scope"
        >
          <ColorSlider
            :id="`${control.id.value}-alpha`"
            v-bind="childProps"
            channel="alpha"
            aria-label="Opacity"
            :ui="ui?.alpha ?? {}"
          />
        </slot>
      </div>
      <div
        v-if="showField || showPreview"
        :class="ui?.fields"
        class="akaza-color-picker-fields"
      >
        <slot
          v-if="showPreview"
          name="preview"
          v-bind="scope"
        >
          <ColorSwatch
            :color="control.color.cssColor.value"
            :ui="ui?.preview ?? {}"
            aria-label="Selected color"
          />
        </slot>
        <slot
          v-if="showField"
          name="field"
          v-bind="scope"
        >
          <ColorField
            :id="control.id.value"
            v-bind="childProps"
            :aria-label="ariaLabel ?? 'Color value'"
            :ui="ui?.field ?? {}"
          />
        </slot>
      </div>
      <slot
        v-if="items?.length"
        name="swatches"
        v-bind="scope"
      >
        <ColorSwatchPicker
          :id="`${control.id.value}-swatches`"
          :model-value="control.color.value.value"
          v-bind="childProps"
          :items="items"
          :format="control.color.format.value"
          aria-label="Color presets"
          :ui="ui?.swatches ?? {}"
          @value-change="onSwatch"
        />
      </slot>
    </slot>
    <input
      ref="input"
      type="text"
      :name="control.name.value"
      :value="control.color.value.value"
      :required="control.required.value"
      :disabled="control.disabled.value"
      tabindex="-1"
      aria-hidden="true"
      :class="ui?.input"
      class="akaza-color-control-input akaza-color-picker-input"
      @invalid="control.onInvalid"
    >
  </div>
</template>
