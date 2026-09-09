---
title: Checkbox
description: A control that allows the user to toggle between checked and unchecked states.
navigation:
  icon: i-lucide-square-check
---

Checkbox renders a labeled control with checked, unchecked, and indeterminate states. It supports native forms and custom indicators.

## Anatomy

- **`#indicator`**: Visual check mark or icon inside the checkbox button.
- **`#label`**: Label text beside the checkbox.
- **`#description`**: Supplementary text below the label.

## Usage

::component-preview
  :::examples-checkbox-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "akaza-ui";

const checked = ref(false);
</script>

<template>
  <Checkbox v-model="checked" label="Accept terms" />
</template>
```
::

## Examples

### Custom indicator

Use `#indicator` to render your own checkmark or icon.

```vue
<template>
  <Checkbox v-model="checked">
    <template #indicator="{ checked }">
      <svg v-if="checked" class="check-icon" .../>
    </template>
  </Checkbox>
</template>
```

### With description

Use `description` when the label needs supporting context.

```vue
<template>
  <Checkbox
    v-model="enabled"
    label="Enable notifications"
    description="We'll email you when something important happens."
  />
</template>
```

### Indeterminate state

Use `"indeterminate"` for parent or mixed-selection states.

```vue
<script setup lang="ts">
import { ref } from "vue";
const value = ref<boolean | "indeterminate">("indeterminate");
</script>

<template>
  <Checkbox v-model="value">
    <template #indicator="{ checked }">
      <span v-if="checked === 'indeterminate'">—</span>
      <span v-else-if="checked">✓</span>
    </template>
  </Checkbox>
</template>
```

### Custom true/false values

Use custom values when the model should store domain values instead of booleans.

```vue
<script setup lang="ts">
const permission = ref<"granted" | "denied">("denied");
</script>

<template>
  <Checkbox
    v-model="permission"
    true-value="granted"
    false-value="denied"
    label="Allow camera access"
  />
</template>
```

## Field and native forms

Inside `Field`, Checkbox inherits its id, name, required/disabled state, accessible label, and error/hint description. Validation is revealed after interaction or an invalid submit, not merely because an untouched required control is empty. Invalid submission focuses the visible button. Required validation also works without a name; unnamed controls do not submit a value.

Clicking label text activates the native button, so a disabled fieldset remains disabled. Links and other interactive descendants in the label do not toggle the checkbox. Native reset restores its mount-time model unless the reset is canceled.

`class`/`ui.wrapper` style the outer wrapper. `ui.root` styles the checkbox button. Supply dimensions, border, radius, spacing, and disabled opacity through `ui`.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disables the checkbox. |
| `id` | `string` | auto | HTML id for the button element. |
| `name` | `string` | — | HTML name for form submission. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `trueValue` | `unknown` | `true` | Model value when checked. |
| `falseValue` | `unknown` | `false` | Model value when unchecked. |
| `label` | `string` | — | Label text. Slot `#label` takes priority. |
| `description` | `string` | — | Description text. Slot `#description` takes priority. |
| `ariaLabel` | `string` | — | Accessible name when no visible label is rendered. |
| `ariaDescribedby` | `string` | — | IDs of external descriptive elements. |
| `ui` | `CheckboxUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `indicator` | `{ checked }` | Visual check mark inside the button. `checked` is `true`, `false`, or `"indeterminate"`. |
| `label` | — | Label text. Defaults to the `label` prop. |
| `description` | — | Description text. Defaults to the `description` prop. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `[value: CheckboxValue, details]` | Fired when the checked state changes. |

### UI Options

| Key | Description |
|-----|-------------|
| `wrapper` | Outer wrapper element. |
| `root` | The interactive button element. |
| `indicator` | The indicator container. |
| `input` | Hidden native input used for form submission. |
| `text` | Wrapper around label and description. |
| `label` | The label element. |
| `description` | The description element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `wrapper` | `akaza-checkbox-wrapper` | — |
| `root` | `akaza-checkbox` | `data-akaza-state`, `data-akaza-disabled`, `data-akaza-invalid`, `data-akaza-dirty`, `data-akaza-touched`, `data-akaza-focused`, `data-akaza-filled` |
| `indicator` | `akaza-checkbox-indicator` | `data-akaza-state` |
| `input` | `akaza-checkbox-input` | — |
| `text` | `akaza-checkbox-text` | — |
| `label` | `akaza-checkbox-label` | — |
| `description` | `akaza-checkbox-description` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Toggles focused checkbox. |
| `Tab` / `Shift + Tab` | Uses native document focus order. |

Visible label is a real `<label>` associated with control, so pointer and touch activation on label toggles checkbox too.
