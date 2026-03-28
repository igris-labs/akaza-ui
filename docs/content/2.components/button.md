---
title: Button
description: A button that can show a loading state during async operations.
navigation:
  icon: i-lucide-mouse-pointer-click
---

An accessible button element with built-in support for disabled, loading, and async click states. Renders as `<button>` by default but can be any element or component.

## Anatomy

- **`#default`** — the button's label or content
- **`#loading`** — content shown while loading (defaults to a spinner)

## Usage

::component-preview
  :::examples-button-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Button } from "akaza-ui";
</script>

<template>
  <Button>Click me</Button>
</template>
```
::

## Examples

### Disabled state

```vue
<template>
  <Button disabled>Unavailable</Button>
</template>
```

### Async loading

Use `loading-auto` to automatically show a spinner while the click handler's Promise is pending.

```vue
<script setup lang="ts">
async function save() {
  await api.save();
}
</script>

<template>
  <Button loading-auto :on-click="save">Save</Button>
</template>
```

### Custom loading content

```vue
<template>
  <Button :loading="isSaving">
    Save
    <template #loading>
      <span>Saving…</span>
    </template>
  </Button>
</template>
```

### Render as a link

```vue
<template>
  <Button as="a" href="/docs">Read the docs</Button>
</template>
```

### Focusable when disabled

Keeps the button in the tab order while disabled — useful for showing tooltips on disabled buttons.

```vue
<template>
  <Button disabled focusable-when-disabled>Restricted</Button>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `"button"` | Element or component to render as. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type. Only applied when `as="button"`. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `focusableWhenDisabled` | `boolean` | `false` | Keep button focusable while disabled. |
| `loading` | `boolean` | `false` | Show the loading state manually. |
| `loadingAuto` | `boolean` | `false` | Automatically show loading while `onClick`'s Promise resolves. |
| `onClick` | `(event: MouseEvent) => void \| Promise<void>` | — | Async-aware click handler for `loadingAuto`. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `default` | — | Button label / content. |
| `loading` | — | Content shown during the loading state. Defaults to a spinner icon. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Fired on click (in addition to native click). |
