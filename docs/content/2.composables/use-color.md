---
title: useColor
description: Convert color strings and edit color channels.
navigation:
  icon: i-lucide-palette
---

Use `useColor` to convert color strings and edit their channels. It does not render controls. Akaza's color components use it to share color state.

## Getting Started

```vue
<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";
import { useColor } from "akaza-ui";
import { ref } from "vue";

const value = ref("oklch(0.65 0.2 250 / 0.8)");
const format = ref<ColorFormat>("oklch");
const color = useColor(value, { format });

function setBlue() {
  color.setChannels("hsb", { hue: 220, saturation: 80, brightness: 90 });
}
</script>

<template>
  <button
    type="button"
    @click="setBlue"
  >
    Set blue
  </button>
  <output>{{ value }}</output>
</template>
```

Pass the model ref, not `value.value`. You can pass a ref or getter for `format`. Each call has its own state.

## Formats

Set `format` to choose the returned color string. You can enter a color in any supported format. Color components use the chosen format for model updates, events, and form values.

| Format | Output |
| --- | --- |
| `hex` | `#rrggbb`, or `#rrggbbaa` when translucent |
| `hexa` | Always `#rrggbbaa` |
| `rgb`, `rgba` | Modern `rgb(r g b / alpha)` syntax; `rgba` always includes alpha |
| `hsl`, `hsla` | Modern `hsl(h s% l% / alpha)` syntax; `hsla` always includes alpha |
| `hwb` | `hwb(...)` |
| `lab`, `lch` | CSS D50 Lab/LCH |
| `oklab`, `oklch` | CSS OKLab/OKLCH |
| `display-p3` | `color(display-p3 ...)` |
| `a98-rgb`, `prophoto-rgb`, `rec2020` | Corresponding CSS `color(...)` spaces |
| `xyz-d50`, `xyz-d65` | Corresponding CSS XYZ spaces |

Use `COLOR_FORMATS` to build a format selector. You can also enter CSS color names, `transparent`, and short HEX values. HSB/HSV supports channel editing but is not a CSS output format.

CSS variables, `currentColor`, relative color expressions, gradients, and URLs are not supported. The same input rules apply during SSR.

## Precision and Gamut

`useColor` keeps more precision than the returned string. Editing does not round the color on each step. It remembers hue and saturation when you pass through black, and hue when you pass through gray. Replacing the model or entering a valid text value replaces the stored color.

RGB and HEX cannot represent all LCH, OKLCH, or Display P3 colors. These outputs clip colors to sRGB. Changing the format back restores the original color while you keep the same `useColor` instance. If you store only the HEX string and create a new instance, you lose that extra color information.

`isOutOfGamut` tells you whether the color falls outside sRGB. Areas and slider gradients show sRGB previews. Swatches use CSS OKLCH; their appearance depends on the browser and display.

## API Reference

### Arguments

| Argument | Type | Default |
| --- | --- | --- |
| `model` | Writable `Ref<string>` | A local red color ref |
| `options.format` | `MaybeRefOrGetter<ColorFormat>` | `"hex"` |
| `options.onChange` | `(value, details) => void` | None; call `details.cancel()` to reject a change |
| `options.onCommit` | `(value, details) => void` | None; runs when an interaction ends |

### Returned State

| Member | Meaning |
| --- | --- |
| `value` | Readonly computed, formatted CSS color; empty for an unparseable external value |
| `format` | Resolved output format |
| `cssColor` | CSS OKLCH representation for previews |
| `isEmpty` | Model is an empty string; transparent is not empty |
| `isValid` | Model is empty or parseable; required validation belongs to the component/form |
| `isOutOfGamut` | Working color is outside sRGB |

### Actions

| Method | Behavior |
| --- | --- |
| `setValue(cssColor, reason?, event?)` | Parse and request a change. Returns false for invalid input or cancellation. Empty string clears the value. |
| `getChannel(space, channel)` | Read a channel using the units below. |
| `getChannelInfo(space, channel)` | Get a copy of its label, minimum, maximum, default step, and channel key; null for an unsupported pair. |
| `setChannels(space, changes, reason?, event?)` | Change several channels at once, keep them within the editor ranges, and request one update. |
| `toString(format?)` | Return a color string without changing state. |
| `commit(reason?, event?)` | Notify completion; does not apply or undo a change. |
| `reset()` | Request the initial color in the current output format; clears hue memory after acceptance. |

Reasons default to `programmatic`; components also use `input`, `keyboard`, `pointer`, `blur`, `enter`, `format`, `select`, and `reset`. Methods requiring values must be called with explicit arguments, not bound directly as native event handlers.

### Channels

| Editing space | Channels and bounds |
| --- | --- |
| `rgb` | red/green/blue 0-255 |
| `hsl` | hue 0-360; saturation/lightness 0-100 |
| `hsb` | hue 0-360; saturation/brightness 0-100 |
| `hwb` | hue 0-360; whiteness/blackness 0-100 |
| `lab` | lightness 0-100; a/b -125 to 125 |
| `lch` | lightness 0-100; chroma 0-150; hue 0-360 |
| `oklab` | lightness 0-100; a/b -0.4 to 0.4 |
| `oklch` | lightness 0-100; chroma 0-0.4; hue 0-360 |
| All | alpha 0-100 |

Default steps are 1, except OKLab a/b and OKLCH chroma, which use 0.001. Editor bounds are interaction ranges, not limits on the CSS color literals accepted by `setValue`.

## Scope and Accessibility

Call `useColor` in component setup or an effect scope so Vue cleans it up. It supports SSR and does not access the DOM, storage, or network.

This composable does not provide keyboard behavior or ARIA by itself. Use [ColorPicker](/components/color-picker), [ColorField](/components/color-field), [ColorArea](/components/color-area), [ColorSlider](/components/color-slider), or [ColorSwatchPicker](/components/color-swatch-picker) for complete rendered controls.
