---
title: Color Swatch Picker
description: Choose one or more colors from a list.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#item`**: Replace content inside each option. Receives `item`, `option`, `color`, `value`, `label`, `isSelected`, `isHighlighted`, `isDisabled`, and `select`.
- **`#indicator`**: Custom selection indicator. Receives the same props as `#item`.
- **`#empty`**: Content for an empty palette.

## Usage

::component-preview
  :::examples-color-swatch-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorSwatchPicker } from "akaza-ui";
import { ref } from "vue";
const color = ref("#2a9d6f");
const colors = [
  "#ef4444",
  "#f97316",
  "#fde047",
  "#2a9d6f",
  "#0090ff",
  "#4263eb",
  "#7950c7",
];
</script>

<template>
  <ColorSwatchPicker
    v-model="color"
    :items="colors"
    aria-label="Brand palette"
    :ui="{
      viewport: 'rounded-md outline-none',
      content: 'flex flex-wrap gap-2',
      item: 'relative rounded-md data-[akaza-state=checked]:ring-2 data-[akaza-state=checked]:ring-foreground/60 data-[akaza-highlighted]:ring-2 data-[akaza-highlighted]:ring-ring',
      swatch: 'block size-10 rounded-md border border-white/25',
      label: 'sr-only',
      indicator:
        'pointer-events-none absolute inset-0 flex items-center justify-center text-white',
    }"
  >
    <template #indicator="{ isSelected }">
      <svg
        v-if="isSelected"
        class="size-4 drop-shadow-sm"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m20 6-11 12-5-5" />
      </svg>
    </template>
  </ColorSwatchPicker>
</template>
```
::

## Examples

### Single selection

Use `#indicator` to add a checkmark to the selected color. The labels remain available to screen readers.

```vue
<template>
  <ColorSwatchPicker
    v-model="color"
    :items="palette.filter((item) => !item.disabled)"
    :ui="paletteUi"
    aria-label="Brand palette"
  >
    <template #indicator="{ isSelected }">
      <UIcon
        v-if="isSelected"
        name="i-lucide-check"
        class="size-4 drop-shadow-sm"
        aria-hidden="true"
      />
    </template>
  </ColorSwatchPicker>
  <output class="block break-all font-mono text-xs">{{ color }}</output>
</template>
```

### Multiple selection and RTL

Toggle several colors, use Shift with navigation to extend selection, and skip disabled options.

```vue
<template>
  <ColorSwatchPicker
    v-model="colors"
    :items="palette"
    multiple
    dir="rtl"
    format="lch"
    :ui="paletteUi"
    aria-label="Multiple colors"
  >
    <template #indicator="{ isSelected }">
      <UIcon
        v-if="isSelected"
        name="i-lucide-check"
        class="size-4 drop-shadow-sm"
        aria-hidden="true"
      />
    </template>
  </ColorSwatchPicker>
  <output class="block whitespace-pre-wrap break-all font-mono text-xs">{{
    JSON.stringify(colors, null, 2)
  }}</output>
</template>
```

### Custom item slot

Replace the swatch, label, and indicator. The option wrapper still handles selection and focus.

```vue
<template>
  <ColorSwatchPicker
    v-model="color"
    :items="customItems"
    :ui="{
      ...paletteUi,
      content: 'grid gap-2',
      item: 'flex items-center gap-3 rounded-md border border-border p-2 data-[akaza-state=checked]:bg-accent',
    }"
    aria-label="Environment colors"
  >
    <template #item="{ color: itemColor, label, isSelected }">
      <ColorSwatch
        :color="itemColor"
        decorative
        :ui="swatchUi"
      />
      <span class="text-sm">{{ label }}</span>
      <span
        v-if="isSelected"
        class="ml-auto text-xs text-muted-foreground"
      >
        Selected
      </span>
    </template>
  </ColorSwatchPicker>
</template>
```

See the live demo's code for the state and style objects used in these examples.

## Formats

Set `format` to choose the returned color string. It does not change the palette. See [supported formats](/composables/use-color#formats). Changing the format keeps opacity and emits `value-change` with reason `format`.

HEX and RGB can lose colors outside sRGB. The picker keeps the original preset colors when you change format. CSS variables, `currentColor`, and relative color expressions are not supported. See [precision and gamut](/composables/use-color#precision-and-gamut) for details.

## Behavior

The picker uses Listbox for selection, keyboard navigation, and form submission. It compares colors by value, so `red` and `#ff0000` match. Invalid colors are disabled. Duplicate colors can both appear selected; use unique colors if you need separate options.

Pass color strings or objects with `{ value: string; label?: string; disabled?: boolean }`. Multiple selections submit one value per color under the same form name. The `#item` slot replaces the option content, not its wrapper.

## API Reference

### Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `modelValue` | `string \| string[]` | `""` | Use an array with multiple selection. |
| `items` | `Array<string \| ColorSwatchOption>` | Required | Preset colors and optional labels/disabled state. |
| `format` | `ColorFormat` | `"hex"` | Format for selected color strings. |
| `multiple` | `boolean` | `false` | Allow multiple colors. |
| `selectionBehavior` | `"toggle" \| "replace"` | `"toggle"` | How multiple selections accumulate. |
| `orientation`, `dir` | `"horizontal" \| "vertical"`, `"ltr" \| "rtl"` | `"horizontal"`, `"ltr"` | Keyboard direction. |
| `loop`, `highlightOnHover` | `boolean` | `true` | Focus wrapping and pointer highlighting. |
| `id`, `name`, `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` | `string` | From Field where applicable | Association, form name, and accessible naming. |
| `required`, `disabled`, `readOnly`, `invalid` | `boolean` | `false` | Form and interaction state. |
| `ui` | `ColorSwatchPickerUi` | - | Classes for named parts. |

### Emits

| Event | Payload | Meaning |
| --- | --- | --- |
| `update:modelValue` | Selected color or color array | Vue model update. |
| `value-change` | `(value, details)` | Runs before a change. Use `details.cancel()` to stop it. Includes `reason` and the native `event` when available. |
| `value-commit` | `(value, details)` | Runs when an interaction ends. Canceling it does not undo the value change. |

### Slots

- **`#item`**: Replace content inside each option. Receives `item`, `option`, `color`, `value`, `label`, `isSelected`, `isHighlighted`, `isDisabled`, and `select`.
- **`#indicator`**: Custom selection indicator. Receives the same props as `#item`.
- **`#empty`**: Content for an empty palette.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Outer Listbox root |
| `viewport` | Focusable Listbox viewport |
| `content` | Options container |
| `item` | Generated option |
| `swatch` | Decorative color preview |
| `label` | Accessible color name |
| `indicator` | Selection indicator |
| `input` | Form input |
| `empty` | Empty palette content |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-swatch-picker` | Listbox form state; `data-akaza-orientation` |
| `viewport` | `akaza-color-swatch-picker-viewport` | `role="listbox"` |
| `content` | `akaza-color-swatch-picker-content` | Options wrapper |
| `item` | `akaza-color-swatch-picker-item` | `data-akaza-state="checked|unchecked"`, `data-akaza-highlighted`, `data-akaza-disabled` |
| `swatch` | `akaza-color-swatch-picker-swatch` | Color Swatch empty state |
| `label` | `akaza-color-swatch-picker-label` | - |
| `indicator` | `akaza-color-swatch-picker-indicator` | `data-akaza-state="checked|unchecked"` |
| `input` | `akaza-color-swatch-picker-input` | Native form attributes |
| `empty` | `akaza-color-swatch-picker-empty` | - |

The root exposes `data-akaza-state="selected|empty"`. It also sets `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, and `data-akaza-filled` when true. Each item has its own selection and highlight attributes. The picker does not expose `data-akaza-out-of-gamut`.

Use `class` or `ui.root` to style the root. Use the other `ui` keys for inner parts. Set sizes, borders, and colors in your own styles.

### Keyboard

| Key | Behavior |
| --- | --- |
| Orientation arrow keys | Move the highlighted option, respecting RTL, wrapping, and disabled entries. |
| `Home` / `End` | Highlight first/last enabled option. |
| `Enter` / `Space` | Select/toggle the highlighted color. |
| Shift+navigation | Extend selection in multiple mode. |
| Ctrl/Cmd+A | Select all enabled colors in multiple mode. |
| Character keys | Typeahead by option label. |

## Parity Notes

Like Reka's color swatch picker, this component supports single and multiple selection, keyboard navigation, RTL, and disabled options. Customize its items through slots. The supplied Base UI reference has no color swatch picker component.
