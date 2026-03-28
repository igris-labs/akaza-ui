---
title: Checkbox
description: A control that allows the user to toggle between checked and unchecked states.
navigation:
  icon: i-lucide-square-check
---

An accessible checkbox with support for custom checked indicators, labels, descriptions, indeterminate state, and form integration.

## Anatomy

- **`#indicator`** — the visual check mark or icon inside the checkbox button
- **`#label`** — the label text beside the checkbox
- **`#description`** — supplementary text below the label

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
| `label` | The label element. |
| `description` | The description element. |
