---
title: Slider
description: Single-value or range slider with pointer drag, keyboard step, and ARIA metadata.
navigation:
  icon: i-lucide-sliders-horizontal
---

`Slider` is an unstyled slider for one value or multiple thumbs. It renders a track, filled range, and `role="slider"` thumbs with pointer dragging, keyboard stepping, hidden form input support, and CSS variables for styling.

## Usage

::component-preview
  :::examples-slider-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Slider } from "akaza-ui";
import { ref } from "vue";

const volume = ref(60);
</script>

<template>
  <Slider v-model="volume" aria-label="Volume" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | field id | Thumb id. |
| `name` | `string` | field name | Form field name. Renders hidden range input. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Keyboard and pointer snapping step. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Slider orientation. |
| `minStepsBetweenThumbs` | `number` | `0` | Minimum distance between adjacent thumbs, in step units. |
| `inverted` | `boolean` | `false` | Reverses value direction. |
| `thumbAlignment` | `"center" \| "contain"` | `"center"` | Thumb alignment metadata exposed as a data attr. |
| `required` | `boolean` | `false` | Required state for hidden input. |
| `disabled` | `boolean` | `false` | Disabled state. |
| `invalid` | `boolean` | `false` | Sets invalid attrs. |
| `ariaLabel` | `string` | — | Accessible label when no visible label exists. |
| `ariaLabels` | `string[]` | — | Per-thumb accessible labels for range sliders. |
| `ariaLabelledby` | `string` | — | Accessible label id. |
| `ariaDescribedby` | `string` | field description/error | Accessible description ids. |
| `getValueLabel` | `(value, max) => string \| undefined` | — | Human-readable `aria-valuetext`. |
| `ui` | `SliderUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value: number \| number[], details)` | Fired before model updates. `details.cancel()` prevents the update. |
| `value-commit` | `(value: number \| number[], details)` | Fired at the end of pointer or keyboard interaction. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `range` | `value`, `values`, `percentage`, `percentages` | Custom range content. |
| `thumb` | `value`, `values`, `index`, `percentage`, `percentages` | Custom thumb content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root slider wrapper. |
| `input` | Hidden range input used for form submission. |
| `track` | Slider track. |
| `range` | Filled range. |
| `thumb` | Slider thumb with `role="slider"`. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-slider` | `data-akaza-orientation`, `data-akaza-disabled`, `data-akaza-invalid`, `data-akaza-dragging`, `data-akaza-focused`, `data-akaza-inverted`, `data-akaza-thumb-alignment` |
| `input` | `akaza-slider-input` | — |
| `track` | `akaza-slider-track` | same slider state attrs |
| `range` | `akaza-slider-range` | same slider state attrs |
| `thumb` | `akaza-slider-thumb` | same slider state attrs, `data-akaza-thumb-index`, and ARIA slider attrs |

`Slider` sets `--akaza-slider-percentage`, `--akaza-slider-start-percentage`, and `--akaza-slider-end-percentage` on the root. Plain `class` applies to the root wrapper.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowUp` | Increment by `step`. |
| `ArrowLeft` / `ArrowDown` | Decrement by `step`. |
| `PageUp` / `PageDown` | Increment/decrement by `step * 10`. |
| `Home` / `End` | Set to min/max. |
