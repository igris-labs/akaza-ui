---
title: Color Swatch
description: A read-only color preview.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#default`**: Optional overlay or empty-state content. Receives `color`, `cssColor`, and `isEmpty`.

## Usage

::component-preview
  :::examples-color-swatch-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorSwatch } from "akaza-ui";
const color = "oklch(0.65 0.2 250)";
</script>

<template>
  <ColorSwatch
    :color="color"
    aria-label="Brand color"
    :ui="{ root: 'block size-9 rounded-md border' }"
  />
</template>
```
::

## Examples

### Formats and transparency

Show colors in different CSS formats. Transparent is a valid color, not an empty selection.

```vue
<template>
  <div class="grid gap-3">
    <div
      v-for="color in colors"
      :key="color"
      class="flex min-w-0 items-center gap-3"
    >
      <ColorSwatch
        :color="color"
        :ui="swatchUi"
      />
      <code class="min-w-0 break-all text-xs text-muted-foreground">{{ color }}</code>
    </div>
  </div>
</template>
```

### Decorative and custom content

Use `decorative` when nearby text names the color. Add an indicator through the default slot.

```vue
<template>
  <span class="inline-flex items-center gap-2 text-sm">
    <ColorSwatch
      color="#22c55e"
      decorative
      :ui="swatchUi"
    />
    Available
  </span>
  <ColorSwatch
    color="#171717"
    aria-label="Black, selected"
    :ui="{
      root: 'flex size-10 items-center justify-center rounded-md border border-border text-white',
    }"
  >
    <span aria-hidden="true">✓</span>
  </ColorSwatch>
</template>
```

### Empty state

An empty or invalid color shows an empty swatch. CSS variables are not supported.

```vue
<template>
  <ColorSwatch
    color=""
    aria-label="No brand color selected"
    :ui="{ root: 'block size-9 rounded-md border border-dashed border-input' }"
  />
</template>
```

See the live demo's code for the state and style objects used in these examples.

## Formats

ColorSwatch accepts the [supported color formats](/composables/use-color#formats). It shows the color without changing or returning a value.

## Behavior

ColorSwatch is read-only and does not emit selection events. Set its size, border, and background pattern in your own styles. The component sets the color fill and `--akaza-color` CSS variable.

Use `decorative` beside text that names the color. Empty or unsupported values set `data-akaza-empty`. Transparent remains a valid color.

## API Reference

### Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `color` | `string` | `""` | Any supported CSS color literal. |
| `ariaLabel` | `string` | Color string, or No color | Accessible preview name. |
| `decorative` | `boolean` | `false` | Remove the image role and hide the preview from assistive technology. |
| `ui` | `ColorSwatchUi` | - | Root class. |

### Emits

ColorSwatch has no custom events. Native attributes and listeners apply to its root.

### Slots

- **`#default`**: Optional overlay or empty-state content. Receives `color`, `cssColor`, and `isEmpty`.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Color preview |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-swatch` | `data-akaza-empty`; conditional `role="img"` / `aria-hidden` |

Use `class` or `ui.root` to style the swatch.

### Keyboard

ColorSwatch is not interactive and does not create a keyboard stop.

## Parity Notes

ColorSwatch provides a color preview and an optional content slot. The supplied Base UI reference has no color swatch component.
