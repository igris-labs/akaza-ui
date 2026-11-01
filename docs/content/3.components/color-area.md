---
title: Color Area
description: A two-dimensional color selector.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#thumb`**: Custom visual thumb content. Receives `value`, `x`, and `y`. It is decorative; native range inputs retain keyboard semantics.

## Usage

::component-preview
  :::examples-color-area-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorArea, ColorPicker, ColorSlider } from "akaza-ui";
import { ref } from "vue";
const color = ref("#56d799");
const areaUi = {
  root: "aspect-square w-full rounded-lg data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-ring",
  area: "rounded-lg",
  thumb: "size-5 rounded-full border-2 border-neutral-400 bg-white shadow-sm",
};
const sliderUi = {
  root: "h-6 w-full rounded-md data-[akaza-disabled]:opacity-50",
  axis: "peer outline-none",
  track: "h-3 w-full rounded-full bg-muted",
  thumb:
    "size-6 rounded-full border-2 border-neutral-400 bg-white shadow-sm peer-data-[akaza-focus-visible]:ring-2 peer-data-[akaza-focus-visible]:ring-ring peer-data-[akaza-focus-visible]:ring-offset-2 peer-data-[akaza-focus-visible]:ring-offset-background",
};
</script>

<template>
  <div class="grid gap-4">
    <output class="text-sm text-muted-foreground">Current: {{ color }}</output>
    <ColorPicker
      v-model="color"
      :ui="{ root: 'grid w-full max-w-64 gap-3' }"
      aria-label="Brand color controls"
    >
      <ColorArea
        color-space="hsl"
        x-channel="hue"
        y-channel="saturation"
        :ui="areaUi"
        aria-label="Brand area"
      />
      <label class="grid gap-1 text-xs text-muted-foreground">
        Lightness
        <ColorSlider
          channel="lightness"
          color-space="hsl"
          :ui="sliderUi"
          aria-label="Lightness"
        />
      </label>
      <label class="grid gap-1 text-xs text-muted-foreground">
        Opacity
        <ColorSlider
          channel="alpha"
          color-space="hsl"
          :ui="sliderUi"
          aria-label="Opacity"
        />
      </label>
    </ColorPicker>
  </div>
</template>
```
::

## Examples

### Hue and saturation

Drag left or right to change hue, and up or down to change saturation. Use Lightness for black (0%) or white (100%), and Opacity for transparency. This example uses HSL; the default area uses HSB saturation and brightness.

```vue
<template>
  <output class="text-sm text-muted-foreground">Current: {{ color }}</output>
  <ColorPicker
    v-model="color"
    :ui="{ root: 'grid w-full max-w-64 gap-3' }"
    aria-label="Brand color controls"
  >
    <ColorArea
      color-space="hsl"
      x-channel="hue"
      y-channel="saturation"
      :ui="hueAreaUi"
      aria-label="Brand area"
    />
    <label>
      Lightness
      <ColorSlider
        channel="lightness"
        color-space="hsl"
        :ui="sliderUi"
        aria-label="Lightness"
      />
    </label>
    <label>
      Opacity
      <ColorSlider
        channel="alpha"
        color-space="hsl"
        :ui="sliderUi"
        aria-label="Opacity"
      />
    </label>
  </ColorPicker>
</template>
```

Put `v-model` and `format` on ColorPicker to share one color between the area and sliders. Leave the child controls without their own models. This keeps hue and saturation when you pass through black, white, or transparent. You can also use ColorArea on its own.

### Output format

Choose the format for the returned value. Selecting OKLCH returns an `oklch(...)` string. The area still edits HSL hue and saturation.

```vue
<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";
import { COLOR_FORMATS, ColorArea, ColorPicker, ColorSlider } from "akaza-ui";
import { ref } from "vue";

const formattedColor = ref("#56d799");
const format = ref<ColorFormat>("hex");
const ui = {
  root: "aspect-square w-64 max-w-full rounded-lg data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-ring",
  area: "rounded-lg",
  thumb: "size-5 rounded-full border-2 border-neutral-400 bg-white shadow-sm",
};
const sliderUi = {
  root: "h-6 w-full rounded-md data-[akaza-disabled]:opacity-50",
  axis: "peer outline-none",
  track: "h-3 w-full rounded-full bg-muted",
  thumb:
    "size-6 rounded-full border-2 border-neutral-400 bg-white shadow-sm peer-data-[akaza-focus-visible]:ring-2 peer-data-[akaza-focus-visible]:ring-ring peer-data-[akaza-focus-visible]:ring-offset-2 peer-data-[akaza-focus-visible]:ring-offset-background",
};
</script>

<template>
  <div class="grid gap-3">
    <label class="grid w-full max-w-64 gap-1 text-xs text-muted-foreground">
      Output format
      <select
        v-model="format"
        class="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
      >
        <option
          v-for="item in COLOR_FORMATS"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>
    </label>
    <ColorPicker
      v-model="formattedColor"
      :format="format"
      :ui="{ root: 'grid w-full max-w-64 gap-3' }"
      aria-label="Formatted color controls"
    >
      <ColorArea
        color-space="hsl"
        x-channel="hue"
        y-channel="saturation"
        :ui="ui"
        aria-label="Formatted color area"
      />
      <label>
        Lightness
        <ColorSlider
          channel="lightness"
          color-space="hsl"
          :ui="sliderUi"
          aria-label="Lightness"
        />
      </label>
      <label>
        Opacity
        <ColorSlider
          channel="alpha"
          color-space="hsl"
          :ui="sliderUi"
          aria-label="Opacity"
        />
      </label>
    </ColorPicker>
    <output
      class="block break-all font-mono text-xs"
      aria-live="polite"
    >
      {{ formattedColor }}
    </output>
  </div>
</template>
```

### RTL and disabled

RTL reverses the horizontal hue axis. The disabled example shows the area and both sliders but prevents editing.

```vue
<template>
  <ColorPicker
    v-model="rtlColor"
    dir="rtl"
    :ui="{ root: 'grid w-full max-w-64 gap-3' }"
    aria-label="RTL color controls"
  >
    <ColorArea
      color-space="hsl"
      x-channel="hue"
      y-channel="saturation"
      dir="rtl"
      :ui="hueAreaUi"
      aria-label="RTL color area"
    />
    <label>
      Lightness
      <ColorSlider
        channel="lightness"
        color-space="hsl"
        dir="rtl"
        :ui="sliderUi"
        aria-label="Lightness"
      />
    </label>
    <label>
      Opacity
      <ColorSlider
        channel="alpha"
        color-space="hsl"
        dir="rtl"
        :ui="sliderUi"
        aria-label="Opacity"
      />
    </label>
  </ColorPicker>
  <ColorPicker
    model-value="#56d799"
    disabled
    :ui="{ root: 'grid w-full max-w-64 gap-3' }"
    aria-label="Disabled color controls"
  >
    <ColorArea
      color-space="hsl"
      x-channel="hue"
      y-channel="saturation"
      disabled
      :ui="hueAreaUi"
      aria-label="Disabled color area"
    />
    <label>
      Lightness
      <ColorSlider
        channel="lightness"
        color-space="hsl"
        disabled
        :ui="sliderUi"
        aria-label="Lightness"
      />
    </label>
    <label>
      Opacity
      <ColorSlider
        channel="alpha"
        color-space="hsl"
        disabled
        :ui="sliderUi"
        aria-label="Opacity"
      />
    </label>
  </ColorPicker>
</template>
```

See the live demo's code for the state and style objects used in these examples.

Pass `disabled` to custom slot controls as shown above. To show keyboard focus on slider handles, use `peer outline-none` on `ui.axis` and `peer-data-[akaza-focus-visible]` classes on `ui.thumb`.

## Formats

Set `format` to choose the returned color string. It does not change which colors you can enter or which channels you edit. See [supported formats](/composables/use-color#formats). Changing the format keeps opacity and emits `value-change` with reason `format`. HEX uses eight digits for transparent colors; `hexa` uses eight digits for all colors.

Use `colorSpace`, `xChannel`, and `yChannel` to change what the area edits. You do not need to change these props to choose a different output format.

HEX and RGB can lose colors outside sRGB. The control keeps the original color until you replace the model or enter a new value. Area and slider previews use sRGB. See [precision and gamut](/composables/use-color#precision-and-gamut) for details.

Use a color value such as `#56d799` or `oklch(0.65 0.2 250)`. CSS variables, `currentColor`, and relative color expressions are not supported.

## Behavior

The area has two native range inputs, one per axis, and one visible thumb. Drag to change both channels. Press Tab to focus each channel and use the keyboard to edit it. Disabled and read-only controls prevent changes.

Choose two different channels from the same color space, such as RGB red/green or OKLCH chroma/lightness. Unsupported or repeated channels disable the area. The preview uses sRGB, but the value can contain colors outside sRGB. Opacity stays unchanged unless you choose alpha as an axis.

## API Reference

### Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `modelValue` | `string` | `"#ff0000"` | Selected CSS color. Bind with `v-model`. |
| `format` | `ColorFormat` | `"hex"` | Format for the returned and submitted color string. |
| `id`, `name` | `string` | From Field | Input ID and form field name. |
| `required`, `disabled`, `readOnly`, `invalid` | `boolean` | `false` | Native validation and interaction states; disabled/required also inherit from Field. |
| `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` | `string` | From Field where applicable | Accessible naming and description. |
| `ui` | Component UI object | - | Classes for the named parts below. |
| `colorSpace` | `ColorSpace` | `"hsb"` | Editing space. |
| `xChannel`, `yChannel` | `ColorChannel` | `"saturation"`, `"brightness"` | Distinct channels supported by the editing space. |
| `xLabel`, `yLabel` | `string` | Generated from channel names | Names for the two accessible sliders. |
| `xName`, `yName` | `string` | - | Optional separate numeric channel form values. |
| `step` | `number` | Channel default | Keyboard increment. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reverse horizontal geometry and arrow direction. |

### Emits

| Event | Payload | Meaning |
| --- | --- | --- |
| `update:modelValue` | Selected color | Vue model update. |
| `value-change` | `(value, details)` | Runs before a change. Use `details.cancel()` to stop it. Includes `reason` and the native `event` when available. |
| `value-commit` | `(value, details)` | Runs when an interaction ends. Canceling it does not undo the value change. |

### Slots

- **`#thumb`**: Custom visual thumb content. Receives `value`, `x`, and `y`. It is decorative; native range inputs retain keyboard semantics.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Group and pointer surface |
| `area` | Canvas plane |
| `thumb` | Visual thumb |
| `xInput` | Horizontal keyboard control |
| `yInput` | Vertical keyboard control |
| `input` | Form input for the full color value |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-area` | Shared form flags; `data-akaza-dragging`, `data-akaza-color-space` |
| `area` | `akaza-color-area-area` | `aria-hidden` |
| `thumb` | `akaza-color-area-thumb` | `aria-hidden` |
| `xInput` | `akaza-color-area-x-input` | Native slider ARIA |
| `yInput` | `akaza-color-area-y-input` | Native slider ARIA; vertical orientation |
| `input` | `akaza-color-area-input` | Native validation attributes |

Form state attributes: `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-touched`, `data-akaza-dirty`, `data-akaza-filled`, and `data-akaza-out-of-gamut`. Each appears only when true.

Use `class` or `ui.root` to style the root. Use the other `ui` keys for inner parts. Set sizes, borders, and colors in your own styles.

The thumb exposes `--akaza-color` but does not force a background. Use `ui.thumb: 'bg-white'` for a white handle, or `bg-[var(--akaza-color)]` for a color-filled handle.

### Keyboard

| Key | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | Focus each of the area's two named sliders. The composed examples then continue to Lightness and Opacity. |
| Arrow keys | Adjust the focused channel; horizontal arrows reverse for the horizontal axis in RTL. |
| `PageUp` / `PageDown`, Shift+Arrow | Adjust by ten steps. |
| `Home` / `End` | Set the focused channel to its editor minimum/maximum. |

## Parity Notes

ColorArea combines Reka's root, area, and thumb parts in one component. Use `ui` and `#thumb` to customize them. The supplied Base UI reference has no color area component.
