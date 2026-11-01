---
title: Color Field
description: An input for CSS colors or a single color channel.
navigation:
  icon: i-lucide-palette
  badge:
    label: NEW
    color: success
---

## Anatomy

- **`#default`**: Optional content after the input. Receives `value`, `draft`, and `isInvalid`.

## Usage

::component-preview
  :::examples-color-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ColorField, ColorSwatch, Field } from "akaza-ui";
import { ref } from "vue";
const color = ref("#56d799");
</script>

<template>
  <Field
    label="Color"
    :ui="{ root: 'grid w-full max-w-64 gap-2', label: 'text-sm font-medium' }"
  >
    <div class="flex min-w-0 items-center gap-3">
      <ColorSwatch
        :color="color"
        decorative
        :ui="{ root: 'block size-9 shrink-0 rounded-md border border-border' }"
      />
      <ColorField
        v-model="color"
        :ui="{
          root: 'block min-w-0 flex-1',
          input:
            'h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        }"
      />
    </div>
  </Field>
</template>
```
::

## Examples

### Required field and form reset

Enter a valid color to submit the form. This example submits LCH text. Reset clears the field.

```vue
<template>
  <form
    class="grid max-w-sm gap-3"
    @submit.prevent="submit"
  >
    <Field
      label="Brand color"
      name="brand"
      required
      :ui="{
        root: 'grid gap-1',
        label: 'text-sm font-medium',
        error: 'text-xs text-destructive',
      }"
    >
      <ColorField
        v-model="requiredColor"
        format="lch"
        placeholder="Enter a color"
        :ui="fieldUi"
      />
    </Field>
    <div class="flex gap-2">
      <button
        class="rounded-md border border-input px-3 py-1.5 text-sm"
        type="submit"
      >
        Submit color
      </button>
      <button
        class="rounded-md border border-input px-3 py-1.5 text-sm"
        type="reset"
      >
        Reset
      </button>
    </div>
    <output class="break-all font-mono text-xs">{{ result || "Not submitted" }}</output>
  </form>
</template>
```

See the live demo's code for `fieldUi` and the submit handler.

## Formats

Set `format` to choose the returned color string. It does not change which colors you can enter or which channels you edit. See [supported formats](/composables/use-color#formats). Changing the format keeps opacity and emits `value-change` with reason `format`. HEX uses eight digits for transparent colors; `hexa` uses eight digits for all colors.

HEX and RGB can lose colors outside sRGB. The control keeps the original color until you replace the model or enter a new value. Area and slider previews use sRGB. See [precision and gamut](/composables/use-color#precision-and-gamut) for details.

Use a color value such as `#56d799` or `oklch(0.65 0.2 250)`. CSS variables, `currentColor`, and relative color expressions are not supported.

## Behavior

The field starts empty. While you type an incomplete value such as `#` or `oklch(`, the model keeps its last valid color. The field shows validation state after you leave it. Invalid drafts block form submission. Press Escape to restore the last valid color.

Valid input updates `v-model` as you type. Leaving the input or pressing Enter emits `value-commit`. The visible input handles browser validation; a hidden input submits the color in the chosen format. Use `ui.input` to style the text box; `class` styles its wrapper.

Set `channel` to edit one number, such as hue or opacity. Set `colorSpace` to choose its units. See [useColor channels](/composables/use-color#channels) for the ranges and steps.

## API Reference

### Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `modelValue` | `string` | `""` | Selected CSS color. Bind with `v-model`. |
| `format` | `ColorFormat` | `"hex"` | Format for the returned and submitted color string. |
| `id`, `name` | `string` | From Field | Input ID and form field name. |
| `required`, `disabled`, `readOnly`, `invalid` | `boolean` | `false` | Native validation and interaction states; disabled/required also inherit from Field. |
| `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` | `string` | From Field where applicable | Accessible naming and description. |
| `ui` | Component UI object | - | Classes for the named parts below. |
| `channel` | `ColorChannel` | - | Omit for a complete CSS color; provide for a numeric channel. |
| `colorSpace` | `ColorSpace` | `"hsb"` | Space used by numeric channel editing. |
| `step` | `number` | Channel default | Increment for arrow/wheel actions. |
| `locale` | `string` | Runtime locale | Number formatting and decimal separator for channel editing. |
| `disableWheelChange` | `boolean` | `true` | Wheel adjustment is opt-in and only applies while focused. |
| `placeholder` | `string` | - | Empty input hint. |

### Emits

| Event | Payload | Meaning |
| --- | --- | --- |
| `update:modelValue` | Selected color | Vue model update. |
| `value-change` | `(value, details)` | Runs before a change. Use `details.cancel()` to stop it. Includes `reason` and the native `event` when available. |
| `value-commit` | `(value, details)` | Runs when an interaction ends. Canceling it does not undo the value change. |

### Slots

- **`#default`**: Optional content after the input. Receives `value`, `draft`, and `isInvalid`.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Wrapper; direct class styles this wrapper |
| `input` | Visible input; use `ui.input` for borders and typography |
| `hiddenInput` | Normalized form value |

### Styling Hooks

| UI key | CSS class | Data attributes / semantics |
| --- | --- | --- |
| `root` | `akaza-color-field` | Shared form flags |
| `input` | `akaza-color-field-input` | Shared form flags; native input attributes |
| `hiddenInput` | `akaza-color-field-hidden-input` | `name`, `value`, `disabled` |

Form state attributes: `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-touched`, `data-akaza-dirty`, `data-akaza-filled`, and `data-akaza-out-of-gamut`. Each appears only when true.

Use `class` or `ui.root` to style the root. Use the other `ui` keys for inner parts. Set sizes, borders, and colors in your own styles.

### Keyboard

| Key | Behavior |
| --- | --- |
| `ArrowUp` / `ArrowDown` | Increment/decrement the channel. In whole-color mode, increment/decrement the RGB HEX integer. |
| `PageUp` / `PageDown` | Adjust by ten steps. |
| `Home` / `End` | Use channel minimum/maximum; whole-color text retains normal caret behavior. |
| `Enter` | Commit a valid draft without suppressing normal form submission. |
| `Escape` | Restore a pending draft without committing it. With nothing to restore, allow the parent popup to handle Escape. |

## Parity Notes

ColorField combines Reka's root and input parts in one component. Use `ui.input` to style the input. The supplied Base UI reference has no color field component.
