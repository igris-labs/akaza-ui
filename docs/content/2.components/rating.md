---
title: Rating
description: Accessible rating input with fractional values, hover preview, keyboard navigation, and forms.
navigation:
  icon: i-lucide-star
  badge:
    label: NEW
    color: success
---

`Rating` is an unstyled radio-group control for bounded scores. It supports fractional steps, hover previews, clearable values, RTL and vertical navigation, custom visuals, native validation, and form submission.

Use it when a user chooses a score. For a read-only quantitative gauge, use [Meter](/components/meter).

## Anatomy

- **`#item`**: Replaces one complete rating item and receives fill percentage and state.
- **`#empty`**: Empty visual rendered inside each default item.
- **`#filled`**: Filled visual clipped inside each default item.
- **`#radio`**: Optional content inside each transparent fractional radio target.
- **`#state`**: Optional renderless output with committed, preview, hover, and item state.

The component generates accessible radio buttons over each visual item. Keep those controls mounted when replacing visuals through slots.

## Usage

::component-preview
  :::examples-rating-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Rating } from "akaza-ui";
import { ref } from "vue";

const rating = ref(3.5);
</script>

<template>
  <Rating v-model="rating" :step="0.5" hoverable clearable />
</template>
```
::

## Examples

### Fractional rating

Set `step` below `1` to expose fractional radio values. Akaza supports the Reka-compatible values `0.5`, `0.25`, and `0.1`, plus other positive values up to `1`.

```vue
<template>
  <Rating v-model="rating" :step="0.25" />
</template>
```

### Clearable and hoverable

`hoverable` previews the pointer value without committing it. `clearable` resets the current value to `0` when selected again.

```vue
<template>
  <Rating v-model="rating" hoverable clearable />
</template>
```

### Custom length and labels

Change the number of items and provide localized value text with `getValueLabel`.

```vue
<template>
  <Rating
    v-model="rating"
    :length="10"
    :get-value-label="(value, max) => `${value} points out of ${max}`"
  />
</template>
```

### Read-only and disabled

Read-only ratings remain perceivable and focusable but reject changes. Disabled ratings are removed from interaction and native form submission.

```vue
<template>
  <Rating :model-value="4" read-only aria-label="Average rating" />
  <Rating :model-value="2" disabled aria-label="Unavailable rating" />
</template>
```

### Field and native forms

Inside [Field](/components/field), Rating inherits label, name, required, disabled, and error metadata. Required validation treats `0` as empty.

```vue
<template>
  <Field label="Service rating" name="rating" required>
    <Rating v-model="rating" />
  </Field>
</template>
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `number` | `0` | Selected score. `0` means no rating. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `5` | Number of rating items. |
| `step` | `number` | `1` | Selection granularity, clamped from `0.01` through `1`. |
| `clearable` | `boolean` | `false` | Selecting the committed value clears it. |
| `hoverable` | `boolean` | `false` | Previews pointer values before commit. |
| `loop` | `boolean` | `true` | Loops arrow navigation at range boundaries. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout and arrow-key axis. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Horizontal navigation direction. |
| `autoFocus` | `boolean` | `false` | Focuses selected or first value on mount. |
| `id` | `string` | field/generated id | Native validity input id. |
| `name` | `string` | field name | Native form field name. |
| `required` | `boolean` | `false` | Requires a value above `0`. |
| `disabled` | `boolean` | `false` | Disables interaction and form submission. |
| `readOnly` | `boolean` | `false` | Blocks value changes without disabling focus. |
| `invalid` | `boolean` | `false` | Controlled invalid state. |
| `ariaLabel` | `string` | `"Rating"` | Accessible group label. |
| `ariaLabelledby` | `string` | — | Id of an external label. |
| `ariaDescribedby` | `string` | field ids | Accessible description ids. |
| `getValueLabel` | `(value, maximum) => string` | `"value of maximum"` | Accessible label for each radio value. |
| `ui` | `RatingUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Fired after an accepted selection. |
| `value-change` | `(value, details)` | Fired before commit. `details.cancel()` prevents it. |
| `hover-change` | `(value \| null, details)` | Fired when hover preview enters, moves, or leaves. Cancelable. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` | `item`, `value`, `previewValue`, `fill`, `state` | Replaces one full visual item. |
| `empty` | `item` | Empty item visual. |
| `filled` | `item` | Filled item visual. |
| `radio` | `value`, `label` | Content inside a generated radio target. |
| `state` | `value`, `previewValue`, `items`, `hoveredValue`, `clear` | Optional state-driven custom UI. |

### Methods

| Method | Description |
|--------|-------------|
| `clear(event?)` | Sets the rating to `0` when editable. |
| `focus()` | Focuses the selected value or first radio. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Radio-group root. |
| `hiddenInput` | Native form/validity input. |
| `item` | One visual item wrapper. |
| `base` | Empty visual wrapper. |
| `fill` | Clipped filled visual wrapper. |
| `fillIcon` | Inner filled visual kept at full width. |
| `radio` | Fractional radio button. |

### Styling Hooks

| UI key | CSS class | Data attrs / variables |
|--------|-----------|------------------------|
| `root` | `akaza-rating` | `data-akaza-state="empty|selected"`, `data-akaza-orientation`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused` |
| `hiddenInput` | `akaza-rating-hidden-input` | native validity attrs |
| `item` | `akaza-rating-item` | `data-akaza-state="active|partial|inactive"`, `data-akaza-value` |
| `base` | `akaza-rating-base` | — |
| `fill` | `akaza-rating-fill` | `--akaza-rating-item-fill` |
| `fillIcon` | `akaza-rating-fill-icon` | — |
| `radio` | `akaza-rating-radio` | `data-akaza-state="checked|unchecked"`, `data-akaza-highlighted`, `data-akaza-value`, `--akaza-rating-step-width`, `--akaza-rating-step-z-index` |

Plain `class` applies to the radio-group root. Use item/fill/radio UI keys for custom rating visuals.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Move by `step` in horizontal mode, respecting RTL. |
| `ArrowDown` / `ArrowUp` | Move by `step` in vertical mode. |
| `Home` | Select the first value. |
| `End` | Select the maximum value. |
| `Space` / `Enter` | Select focused value; may clear it when `clearable`. |
