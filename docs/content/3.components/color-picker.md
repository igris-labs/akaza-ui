---
title: Color Picker
description: A color editor with an area, sliders, and text input.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#default`**: Replace the inner controls. The group and hidden form input remain.
- **`#area`**: Replace the two-axis area.
- **`#hue`**: Replace the hue slider.
- **`#alpha`**: Replace the opacity slider.
- **`#field`**: Replace the color text input.
- **`#preview`**: Replace the selected-color preview.
- **`#swatches`**: Replace the optional preset palette.

## Usage

::component-preview
  :::examples-color-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorPicker } from "akaza-ui";
import { ref } from "vue";
const color = ref("#3b82f6");
</script>

<template>
  <ColorPicker
    v-model="color"
    format="oklch"
    aria-label="Brand color"
    :ui="{
      root: 'grid max-w-sm gap-3',
      area: { root: 'h-44', thumb: 'size-4 rounded-full border-2 border-white' },
      hue: {
        root: 'h-6',
        track: 'h-3',
        thumb: 'size-4 rounded-full border-2 border-white',
      },
      alpha: {
        root: 'h-6',
        track: 'h-3',
        thumb: 'size-4 rounded-full border-2 border-white',
      },
      field: { input: 'h-9 w-full border px-3' },
      preview: { root: 'block size-9 border' },
      fields: 'flex items-center gap-2',
    }"
  />
</template>
```
::

## Examples

### Output format

Choose the format for `v-model`. You can still change hue when the selected color is gray or black.

```vue
<template>
  <label class="grid max-w-sm gap-1 text-xs text-muted-foreground">
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
    v-model="color"
    :format="format"
    :items="palette"
    :ui="pickerUi"
    aria-label="Brand color"
    @value-commit="committed = $event"
  />
  <output class="block break-all font-mono text-xs text-muted-foreground">
    {{ color }}
  </output>
  <p class="break-all text-xs text-muted-foreground">
    Committed: {{ committed || "No interaction yet" }}
  </p>
</template>
```

### Popover composition

Put the picker in Popover's `#content` slot and its button in `#trigger`. Use separate models for the popup's open state and the color.

```vue
<template>
  <Popover
    v-model="open"
    teleport="body"
    :ui="{
      content:
        'max-h-[calc(100dvh-1rem)] w-[min(90vw,22rem)] overflow-y-auto rounded-md border border-border bg-popover p-4 shadow-lg',
    }"
  >
    <template #trigger="{ toggle, triggerProps }">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
        v-bind="triggerProps"
        @click="toggle"
      >
        <ColorSwatch
          :color="color"
          decorative
          :ui="swatchUi"
        />
        Choose color
      </button>
    </template>
    <template #content>
      <ColorPicker
        v-model="color"
        :format="format"
        :ui="pickerUi"
        aria-label="Popup color"
      />
    </template>
  </Popover>
</template>
```

### Read-only and disabled

These states retain the chosen value and prevent edits.

```vue
<template>
  <ColorPicker
    :model-value="color"
    read-only
    :ui="pickerUi"
    aria-label="Read-only color"
  />
  <ColorPicker
    :model-value="color"
    disabled
    :show-alpha="false"
    :ui="pickerUi"
    aria-label="Disabled color"
  />
</template>
```

See the live demo's code for the state and style objects used in these examples.

## Formats

Set `format` to choose the returned color string. It does not change which colors you can enter or which channels you edit. See [supported formats](/composables/use-color#formats). Changing the format keeps opacity and emits `value-change` with reason `format`. HEX uses eight digits for transparent colors; `hexa` uses eight digits for all colors.

HEX and RGB can lose colors outside sRGB. The control keeps the original color until you replace the model or enter a new value. Area and slider previews use sRGB. See [precision and gamut](/composables/use-color#precision-and-gamut) for details.

Use a color value such as `#56d799` or `oklch(0.65 0.2 250)`. CSS variables, `currentColor`, and relative color expressions are not supported.

## Behavior

The picker renders inline. Use Popover to show it in a popup. Its controls share one color, including hue changes while the value is black or gray.

ColorArea, ColorSlider, and ColorField in a picker slot share its color and format when you omit their `v-model`. Adding a child model gives that control a separate color. Listen to the picker's `value-change` and `value-commit` events for shared changes. The picker submits one named form value; its default children do not submit extra values.

The default slot provides `value`, `cssColor`, `format`, `isOutOfGamut`, `setValue(value)`, `setChannels(space, changes)`, and `getChannel(space, channel)`. Pass arguments when calling actions, for example `@click="setValue('#ff0000')"`.

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
| `colorSpace` | `"hsb" \| "hsl" \| "lch" \| "oklch"` | `"hsb"` | Editing space; independent of output format. |
| `showAlpha`, `showField`, `showPreview` | `boolean` | `true` | Show or hide the default controls. Hiding alpha does not discard existing transparency. |
| `items` | `Array<string \| ColorSwatchOption>` | `[]` | Optional presets. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Horizontal direction. |

### Emits

| Event | Payload | Meaning |
| --- | --- | --- |
| `update:modelValue` | Selected color | Vue model update. |
| `value-change` | `(value, details)` | Runs before a change. Use `details.cancel()` to stop it. Includes `reason` and the native `event` when available. |
| `value-commit` | `(value, details)` | Runs when an interaction ends. Canceling it does not undo the value change. |

### Slots

- **`#default`**: Replace the inner controls. The group and hidden form input remain.
- **`#area`**: Replace the two-axis area.
- **`#hue`**: Replace the hue slider.
- **`#alpha`**: Replace the opacity slider.
- **`#field`**: Replace the color text input.
- **`#preview`**: Replace the selected-color preview.
- **`#swatches`**: Replace the optional preset palette.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Outer group |
| `controls` | Slider container |
| `fields` | Preview and field row |
| `input` | Visually hidden input for form submission and validation |
| `area` | Nested `ColorAreaUi` object |
| `hue` | Nested `ColorSliderUi` for hue |
| `alpha` | Nested `ColorSliderUi` for opacity |
| `field` | Nested `ColorFieldUi` object |
| `preview` | Nested `ColorSwatchUi` object |
| `swatches` | Nested palette UI object |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-picker` | Shared form flags; `data-akaza-format` |
| `controls` | `akaza-color-picker-controls` | - |
| `fields` | `akaza-color-picker-fields` | - |
| `input` | `akaza-color-picker-input` | Native input attributes |
| `area` | See Color Area | See Color Area |
| `hue` | See Color Slider | See Color Slider |
| `alpha` | See Color Slider | See Color Slider |
| `field` | See Color Field | See Color Field |
| `preview` | See Color Swatch | See Color Swatch |
| `swatches` | See Color Swatch Picker | See Color Swatch Picker |

Form state attributes: `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-touched`, `data-akaza-dirty`, `data-akaza-filled`, and `data-akaza-out-of-gamut`. Each appears only when true.

Use `class` or `ui.root` to style the root. Use the other `ui` keys for inner parts. Set sizes, borders, and colors in your own styles.

### Keyboard

| Key | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | Move between area axes, sliders, field, and optional palette. |
| Arrow, Page, Home/End keys | Follow the keyboard rules of the focused child control. |
| `Escape` in the text field | Restore a pending draft first. When no draft needs restoring, Escape can dismiss the surrounding Popover. |

## Parity Notes

ColorPicker combines the color controls in one component. Reka shows a picker built from separate color primitives. The supplied Base UI reference has no color picker component.
