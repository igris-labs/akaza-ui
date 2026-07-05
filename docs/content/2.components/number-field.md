---
title: Number Field
description: Spinbutton number input with increment and decrement controls.
navigation:
  icon: i-lucide-badge-plus
---

`NumberField` is an unstyled spinbutton control. It combines a native number input with increment/decrement buttons, optional scrub area, wheel and keyboard stepping, min/max/step constraints, cancelable changes, commit events, and [Field](/components/field) integration.

## Usage

::component-preview
  :::examples-number-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { NumberField } from "akaza-ui";
import { ref } from "vue";

const seats = ref<number | null>(3);
</script>

<template>
  <NumberField v-model="seats" :min="1" :max="10" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | field id | Input id. |
| `name` | `string` | field name | Form field name. |
| `min` | `number` | — | Minimum value. |
| `max` | `number` | — | Maximum value. |
| `step` | `number` | `1` | Increment/decrement step. |
| `placeholder` | `string` | — | Native input placeholder. |
| `required` | `boolean` | `false` | Required state. |
| `disabled` | `boolean` | `false` | Disabled state. |
| `readonly` | `boolean` | `false` | Read-only state. |
| `invalid` | `boolean` | `false` | Sets invalid attrs. |
| `stepSnapping` | `boolean` | `true` | Snap input/button values to the nearest step. |
| `disableWheelChange` | `boolean` | `false` | Disables focused wheel stepping. |
| `invertWheelChange` | `boolean` | `false` | Reverses wheel direction. |
| `focusOnChange` | `boolean` | `true` | Focuses the input after button/scrub changes. |
| `scrubLabel` | `string` | — | Renders a drag scrub area before the decrement button. |
| `scrubStep` | `number` | `step` | Step used by scrub dragging. |
| `disableScrub` | `boolean` | `false` | Disables scrub dragging. |
| `getValueLabel` | `(value) => string \| undefined` | — | Human-readable `aria-valuetext`. |
| `ariaLabel` | `string` | — | Accessible label when no visible label exists. |
| `ariaDescribedby` | `string` | field description/error | Accessible description ids. |
| `ui` | `NumberFieldUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fired before model updates. `details.cancel()` prevents the update. |
| `value-commit` | `(value, details)` | Fired on blur and after button, wheel, keyboard, or scrub interactions. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `scrub` | `value`, `isScrubbing` | Custom scrub area content. |
| `decrement` | `value`, `decrement` | Custom decrement button content. |
| `increment` | `value`, `increment` | Custom increment button content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root wrapper. |
| `scrubArea` | Optional drag scrub area. |
| `decrement` | Decrement button. |
| `input` | Native number input. |
| `increment` | Increment button. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-number-field` | `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-dirty`, `data-akaza-touched`, `data-akaza-filled`, `data-akaza-focused`, `data-akaza-scrubbing` |
| `scrubArea` | `akaza-number-field-scrub-area` | same state attrs |
| `decrement` | `akaza-number-field-decrement` | same state attrs |
| `input` | `akaza-number-field-input` | same state attrs plus native validity attrs |
| `increment` | `akaza-number-field-increment` | same state attrs |

Plain `class` applies to the root wrapper. Use `ui.input` for the actual input.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowUp` / `ArrowDown` | Increment/decrement by `step`. |
| `PageUp` / `PageDown` | Increment/decrement by `step * 10`. |
| `Home` | Set to `min` when provided. |
| `End` | Set to `max` when provided. |

Mouse wheel changes the value only while the input is focused. Set `disableWheelChange` to opt out.
