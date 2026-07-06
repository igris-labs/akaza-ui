---
title: Button
description: A button that can show a loading state during async operations.
navigation:
  icon: i-lucide-mouse-pointer-click
---

An accessible button element with built-in support for disabled, loading, and async click states. Renders as `<button>` by default but can be any element or component.

## Anatomy

- **`#default`**: Button label or content.
- **`#loading`**: Content shown while loading. Defaults to the built-in spinner.

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

Use `disabled` for actions that cannot currently run.

```vue
<template>
  <Button disabled>Unavailable</Button>
</template>
```

### Async loading

Use `loading-auto` to automatically show a spinner while the `@click` handler's Promise is pending.

```vue
<script setup lang="ts">
async function save() {
  await api.save();
}
</script>

<template>
  <Button loading-auto @click="save">Save</Button>
</template>
```

### Custom loading content

Use `#loading` when the default spinner does not match your UI.

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

Use `as` to render a different root while keeping Akaza button state hooks.

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
| `loadingAuto` | `boolean` | `false` | Automatically show loading while the `@click` handler's Promise resolves. |
| `ui` | `ButtonUi` | — | Classes for root and default loading parts. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `default` | — | Button label / content. |
| `loading` | — | Content shown during the loading state. Defaults to a spinner icon. |

### Native Events

`Button` forwards native button events to the root element. Use `@click` directly; when `loading-auto` is set and the handler returns a Promise, the button enters loading state until it settles.

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The button element or custom rendered root. |
| `spinner` | The default loading spinner. |
| `loadingText` | The visually hidden default loading text. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-button` | `data-akaza-state`, `data-akaza-disabled`, `data-akaza-loading` |
| `spinner` | `akaza-button-spinner` | — |
| `loadingText` | `akaza-button-loading-text` | — |

Plain `class` also applies to the root button. Use `ui.root` when styling root together with `spinner` or `loadingText`.
