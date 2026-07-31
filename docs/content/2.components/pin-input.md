---
title: Pin / OTP Input
description: Multi-cell input for verification codes, PINs, and fixed-length tokens.
navigation:
  icon: i-lucide-binary
  badge:
    label: NEW
    color: success
---

`PinInput` is an unstyled fixed-length text control rendered as individual cells. It distributes typed or pasted characters, manages focus, supports numeric OTP metadata and masking, and submits one canonical string to native forms.

Use it for short verification codes and PINs. Use [Input](/components/input) for unrestricted text.

## Anatomy

- **`#cell`**: Replaces one generated cell. Bind `inputProps` to the focusable input so keyboard, paste, ARIA, and form behavior remain connected.

The component generates one input per character plus a visually hidden native form control. Style generated cells with `ui.input`.

## Usage

::component-preview
  :::examples-pin-input-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { PinInput } from "akaza-ui";
import { ref } from "vue";

const code = ref("");
</script>

<template>
  <PinInput
    v-model="code"
    :length="6"
    type="number"
    otp
    aria-label="Verification code"
  />
</template>
```
::

## Examples

### Paste a one-time code

Set `otp` on a numeric input. The first cell exposes `autocomplete="one-time-code"`, and pasting fills consecutive cells.

```vue
<template>
  <PinInput v-model="code" :length="6" type="number" otp />
</template>
```

### Mask a PIN

Set `mask` to render password cells while preserving the string model and submitted value.

```vue
<template>
  <PinInput v-model="pin" :length="4" type="number" mask aria-label="Security PIN" />
</template>
```

### Restrict characters

Use a regular expression or function for application-specific token rules. Numeric mode is applied before `allowedChars`.

```vue
<template>
  <PinInput
    v-model="inviteCode"
    :length="8"
    :allowed-chars="/^[A-Z0-9]$/"
    aria-label="Invite code"
  />
</template>
```

### Custom cells

`#cell` receives all required native attributes and handlers in `inputProps`. Add classes or markup without recreating behavior.

```vue
<template>
  <PinInput v-model="code" :length="6">
    <template #cell="{ index, inputProps, isFilled }">
      <label>
        <span class="sr-only">Character {{ index + 1 }}</span>
        <input v-bind="inputProps" :class="{ filled: isFilled }">
      </label>
    </template>
  </PinInput>
</template>
```

### Completion

`complete` fires after an accepted change fills every cell. It also provides cancelable details for a consistent event shape; cancellation does not roll back the already accepted value.

```vue
<template>
  <PinInput v-model="code" :length="6" @complete="verifyCode" />
</template>
```

### Field integration

Inside [Field](/components/field), PinInput inherits `id`, `name`, required/disabled/invalid state, and description/error IDs. Incomplete required state appears after blur or an invalid submit.

```vue
<template>
  <Field label="Verification code" name="code" required>
    <PinInput v-model="code" :length="6" type="number" otp />
  </Field>
</template>
```

### Cancel a value

`value-change` fires before the model updates. This can reject a specific sequence without manually restoring the model.

```vue
<template>
  <PinInput
    v-model="code"
    @value-change="(value, details) => value.startsWith('0') && details.cancel()"
  />
</template>
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `string` | `""` | Canonical value across every cell. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `4` | Number of cells; clamped to at least one. |
| `type` | `"text" \| "number"` | `"text"` | Character mode and input metadata. |
| `mask` | `boolean` | `false` | Renders password cells. |
| `otp` | `boolean` | `false` | Enables one-time-code autocomplete on the first cell. |
| `placeholder` | `string` | `""` | Placeholder applied to every cell. |
| `allowedChars` | `RegExp \| (character) => boolean` | non-whitespace | Additional character filter. |
| `selectOnFocus` | `boolean` | `true` | Selects a cell value when focused. |
| `autoFocus` | `boolean` | `false` | Focuses the first cell after mount. |
| `id` | `string` | field/generated id | First cell id. Later cells receive numbered suffixes. |
| `name` | `string` | field name | Native form field name. |
| `required` | `boolean` | `false` | Requires all cells to be filled. |
| `disabled` | `boolean` | `false` | Disables every cell and form submission. |
| `readOnly` | `boolean` | `false` | Prevents value changes while retaining focus. |
| `invalid` | `boolean` | `false` | Forces invalid styling and ARIA state. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Cell direction and Arrow-key behavior. |
| `ariaLabel` | `string` | `"Pin input"` | Group label and per-cell label prefix. |
| `ariaLabelledby` | `string` | - | Accessible label element id. |
| `ariaDescribedby` | `string` | field IDs | Accessible description/error ids. |
| `ui` | `PinInputUi` | - | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fires before the canonical value updates. Cancelable. |
| `complete` | `(value, details)` | Fires after every cell becomes filled. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `cell` | `index`, `value`, `isFilled`, `isActive`, `inputProps` | Custom cell. Bind `inputProps` to an input. |

### Exposed Methods

| Method | Description |
|--------|-------------|
| `focus()` | Focuses the first cell. |
| `clear(event?)` | Clears every cell through `value-change`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Group wrapper. |
| `hiddenInput` | Native form/validity input. |
| `input` | Every generated cell input. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-pin-input` | `data-akaza-state`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-filled` |
| `hiddenInput` | `akaza-pin-input-hidden-input` | native validity attrs |
| `input` | `akaza-pin-input-input` | `data-akaza-state`, `data-akaza-index`, `data-akaza-active`, `data-akaza-disabled`, `data-akaza-invalid` |

Root `data-akaza-state` is `incomplete` or `complete`; cell state is `empty` or `filled`. Plain `class` applies to the root group. Use `ui.input` for every generated cell.

### Keyboard

| Key | Behavior |
|-----|----------|
| text input | Accepts valid characters and advances focus. Multiple characters distribute forward. |
| paste | Distributes valid characters from the current cell. |
| `ArrowLeft` / `ArrowRight` | Move between cells, respecting `dir`. |
| `Home` / `End` | Focus first/last cell. |
| `Backspace` | Clears current cell, or previous cell when current is empty. |
| `Delete` | Clears current cell. |
