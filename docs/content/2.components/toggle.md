---
title: Toggle
description: A two-state button that can be on or off.
navigation:
  icon: i-lucide-toggle-right
---

A single button that toggles between pressed and unpressed states. Use it for toolbar actions, view toggles, or any binary UI control that doesn't need a label (see [Switch](/components/switch) for a labeled toggle field).

## Anatomy

- **`#default`** — the button content, receives `{ pressed, state }` scoped props

## Usage

::component-preview
  :::examples-toggle-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "akaza-ui";

const bold = ref(false);
</script>

<template>
  <Toggle v-model="bold" aria-label="Bold">
    <template #default="{ pressed }">
      <strong :class="{ active: pressed }">B</strong>
    </template>
  </Toggle>
</template>
```
::

## Examples

### Toolbar group

```vue
<template>
  <div role="toolbar" aria-label="Text formatting">
    <Toggle v-model="bold" aria-label="Bold">
      <template #default="{ pressed }">
        <span :data-active="pressed">B</span>
      </template>
    </Toggle>

    <Toggle v-model="italic" aria-label="Italic">
      <template #default="{ pressed }">
        <span :data-active="pressed">I</span>
      </template>
    </Toggle>
  </div>
</template>
```

### Using the `state` prop

`state` is `"on"` or `"off"` — useful for data-attribute-driven styling.

```vue
<template>
  <Toggle v-model="active" aria-label="Mute">
    <template #default="{ state }">
      <span :data-state="state">🔇</span>
    </template>
  </Toggle>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Whether the toggle is pressed. |
| `disabled` | `boolean` | `false` | Disables the toggle. |
| `value` | `string` | — | Value used when the toggle is part of a group. |
| `ariaLabel` | `string` | — | Accessible label for icon-only toggles. |
| `as` | `string` | `"button"` | Root element tag. |
| `ui` | `ToggleUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `default` | `{ pressed, state }` | Button content. `state` is `"on"` or `"off"`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The button element. |
