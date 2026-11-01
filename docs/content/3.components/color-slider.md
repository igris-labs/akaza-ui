---
title: Color Slider
description: A slider for hue, opacity, or another color channel.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#track`**: Content inside the generated gradient track. Receives `value` and `channel`.
- **`#thumb`**: Decorative thumb content. Receives `value`, `channelValue`, and `percentage`.

## Usage

::component-preview
  :::examples-color-slider-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorSlider, ColorSwatch } from "akaza-ui";
import { ref } from "vue";
const color = ref("#56d799");
</script>

<template>
  <div class="grid gap-4">
    <ColorSlider
      v-model="color"
      channel="hue"
      aria-label="Hue"
      :ui="{
        root: 'h-6 w-64 max-w-full rounded-md data-[akaza-disabled]:opacity-50',
        axis: 'peer outline-none',
        track: 'h-3 w-full rounded-full',
        thumb:
          'size-6 rounded-full border-2 border-neutral-400 bg-white shadow-sm peer-data-[akaza-focus-visible]:ring-2 peer-data-[akaza-focus-visible]:ring-ring peer-data-[akaza-focus-visible]:ring-offset-2 peer-data-[akaza-focus-visible]:ring-offset-background',
      }"
    />
    <div class="flex items-center gap-3">
      <ColorSwatch
        :color="color"
        :ui="{ root: 'block size-9 rounded-md border border-border' }"
      />
      <output class="font-mono text-xs text-muted-foreground">{{ color }}</output>
    </div>
  </div>
</template>
```
::

## Examples

### Hue and opacity

Change hue and opacity with separate sliders. Both update the same color value.

```vue
<template>
  <ColorSlider
    v-model="color"
    channel="hue"
    :ui="sliderUi"
    aria-label="Hue"
  />
  <div class="flex items-center gap-3">
    <ColorSwatch
      :color="color"
      :ui="swatchUi"
    />
    <output class="font-mono text-xs text-muted-foreground">{{ color }}</output>
  </div>
  <label class="grid max-w-sm gap-2 text-xs">
    Opacity
    <ColorSlider
      v-model="color"
      format="oklch"
      channel="alpha"
      :ui="sliderUi"
    />
  </label>
</template>
```

### Vertical and RTL

Vertical tracks increase upward. RTL reverses horizontal pointer and arrow direction.

```vue
<template>
  <div class="flex items-start gap-6">
    <ColorSlider
      v-model="color"
      orientation="vertical"
      aria-label="Vertical hue"
      :ui="{ ...sliderUi, root: 'h-40 w-6', track: 'h-full w-3 rounded-md' }"
    />
    <ColorSlider
      v-model="color"
      dir="rtl"
      aria-label="RTL hue"
      :ui="sliderUi"
    />
  </div>
</template>
```

### OKLCH and read-only

Use a smaller step for OKLCH chroma. Read-only sliders accept keyboard focus but prevent changes.

```vue
<template>
  <ColorSlider
    v-model="color"
    channel="chroma"
    color-space="oklch"
    format="oklch"
    :step="0.001"
    :ui="sliderUi"
    aria-label="OKLCH chroma"
  />
  <ColorSlider
    :model-value="color"
    read-only
    :ui="sliderUi"
    aria-label="Read-only hue"
  />
</template>
```

See the live demo's code for the state and style objects used in these examples.

## Formats

Set `format` to choose the returned color string. It does not change which colors you can enter or which channels you edit. See [supported formats](/composables/use-color#formats). Changing the format keeps opacity and emits `value-change` with reason `format`. HEX uses eight digits for transparent colors; `hexa` uses eight digits for all colors.

HEX and RGB can lose colors outside sRGB. The control keeps the original color until you replace the model or enter a new value. Area and slider previews use sRGB. See [precision and gamut](/composables/use-color#precision-and-gamut) for details.

Use a color value such as `#56d799` or `oklch(0.65 0.2 250)`. CSS variables, `currentColor`, and relative color expressions are not supported.

## Behavior

The slider uses a visually hidden native range input for keyboard and screen reader support. Style the visible track and thumb through `ui`.

For a keyboard focus ring on the thumb, set `ui.axis` to `peer outline-none` and use `peer-data-[akaza-focus-visible]` classes on `ui.thumb`. The root and axis expose `data-akaza-focus-visible` for keyboard focus. `data-akaza-focused` also includes focus from a pointer.

For a vertical slider, give the root a height and the track a width and full height.

Hue tracks stay visible for gray and transparent colors. Other channel tracks show opaque colors. The alpha track shows transparency against your background. The component positions the thumb; do not add transforms to position it.

The thumb exposes `--akaza-color` but does not force a background. Use `ui.thumb: 'bg-white'` for a white handle, or `bg-[var(--akaza-color)]` for a color-filled handle.

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
| `channel` | `ColorChannel` | `"hue"` | Channel to edit. |
| `colorSpace` | `ColorSpace` | `"hsb"` | Space used for channel interpretation. |
| `step` | `number` | Channel default | Increment; OKLCH chroma defaults to 0.001. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout and pointer axis. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Horizontal reading direction. |
| `inverted` | `boolean` | `false` | Reverse the visual scale. |

### Emits

| Event | Payload | Meaning |
| --- | --- | --- |
| `update:modelValue` | Selected color | Vue model update. |
| `value-change` | `(value, details)` | Runs before a change. Use `details.cancel()` to stop it. Includes `reason` and the native `event` when available. |
| `value-commit` | `(value, details)` | Runs when an interaction ends. Canceling it does not undo the value change. |

### Slots

- **`#track`**: Content inside the generated gradient track. Receives `value` and `channel`.
- **`#thumb`**: Decorative thumb content. Receives `value`, `channelValue`, and `percentage`.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Pointer surface |
| `track` | Computed channel gradient |
| `thumb` | Visual position and selected color |
| `axis` | Keyboard and assistive-technology control |
| `input` | Form input for the full color value |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-slider` | Shared form flags; `data-akaza-channel`, `data-akaza-orientation`, `data-akaza-dragging`, `data-akaza-focus-visible` |
| `track` | `akaza-color-slider-track` | - |
| `thumb` | `akaza-color-slider-thumb` | `aria-hidden` |
| `axis` | `akaza-color-slider-axis` | Native range/slider attributes; `data-akaza-focus-visible` |
| `input` | `akaza-color-slider-input` | Native validation attributes |

Form state attributes: `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-touched`, `data-akaza-dirty`, `data-akaza-filled`, and `data-akaza-out-of-gamut`. Each appears only when true.

Use `class` or `ui.root` to style the root. Use the other `ui` keys for inner parts. Set sizes, borders, and colors in your own styles.

### Keyboard

| Key | Behavior |
| --- | --- |
| Arrow keys | Adjust by one step; horizontal arrows follow RTL/inversion. |
| `PageUp` / `PageDown`, Shift+Arrow | Adjust by ten steps. |
| `Home` / `End` | Set the channel minimum/maximum. |
| `Tab` | Enter/leave the slider, including readonly sliders. Disabled sliders are skipped. |

## Parity Notes

ColorSlider combines Reka's root, track, and thumb parts in one component. Use `ui`, `#track`, and `#thumb` to customize them. The supplied Base UI reference has no color slider component.
