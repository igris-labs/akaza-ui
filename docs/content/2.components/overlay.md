---
title: Overlay Provider
description: Programmatic overlay mounting with useOverlay.
navigation:
  icon: i-lucide-panels-top-left
---

`OverlayProvider` renders overlay components created with `useOverlay`. Mount one provider near your app root, then open dialogs, drawers, or custom overlay components from anywhere.

## Usage

```vue
<script setup lang="ts">
import { Dialog, OverlayProvider, useOverlay } from "akaza-ui";

const overlay = useOverlay();
const dialog = overlay.create(Dialog, {
  props: {
    title: "Confirm action",
  },
});

function openDialog() {
  dialog.open();
}
</script>

<template>
  <button @click="openDialog">Open dialog</button>
  <OverlayProvider />
</template>
```

## API Reference

### `useOverlay()`

| Method | Signature | Description |
|--------|-----------|-------------|
| `create` | `(component, options?) => OverlayInstance` | Creates a programmatic overlay instance. |

### Overlay options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `props` | `object` | — | Default props passed to the overlay component. |
| `defaultOpen` | `boolean` | `false` | Opens the overlay immediately after creation. |
| `destroyOnClose` | `boolean` | `false` | Removes the overlay entry after close. |

### Overlay instance

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(props?) => { result: Promise<unknown> }` | Opens the overlay and optionally merges props. |
| `close` | `(value?) => void` | Closes the overlay and resolves the pending result. |
| `patch` | `(props) => void` | Updates props while mounted. |
| `unmount` | `() => void` | Removes the overlay entry. |
| `isOpen` | `() => boolean` | Returns current open state. |

### UI Options

`OverlayProvider` has no `ui` prop and renders no wrapper. Style the overlay component it mounts, such as `Dialog`, `Drawer`, or your custom component.

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| — | — | — |
