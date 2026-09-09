---
title: Overlay Provider
description: Programmatic overlay mounting with useOverlay.
navigation:
  icon: i-lucide-panels-top-left
  badge:
    label: UPDATED
    color: warning
---

`OverlayProvider` renders components created with `useOverlay`. Mount one provider near the app root.

The composable opens dialogs, drawers, and custom overlays outside the current template.

## Anatomy

- **`OverlayProvider`**: Renders programmatic overlay entries and no wrapper element.
- **`useOverlay`**: Shared composable that creates overlay instances.
- **`open()`**: Opens an overlay and returns a result promise.
- **`patch()`**: Updates props while the overlay is mounted.
- **`close()`**: Closes the overlay and resolves the pending result.

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

## Examples

### Mount once

Place the provider near the app root. It renders only active overlay components.

```vue
<template>
  <NuxtPage />
  <OverlayProvider />
</template>
```

### Open with props

Pass props at creation time and override them when opening the instance.

```vue
<script setup lang="ts">
import { Dialog, useOverlay } from "akaza-ui";

const overlay = useOverlay();
const confirmDialog = overlay.create(Dialog, {
  props: {
    title: "Delete project",
    description: "This action cannot be undone.",
  },
});

function confirmDelete() {
  confirmDialog.open({
    description: "Delete the selected project?",
  });
}
</script>

<template>
  <Button @click="confirmDelete">Delete</Button>
</template>
```

### Await the close result

`open()` returns a result promise. Programmatic `close(value)` resolves it with that value. Closing from the mounted component resolves `undefined` unless the component emits `close` with a value.

```vue
<script setup lang="ts">
async function ask() {
  const { result } = confirmDialog.open();
  const accepted = await result;
  if (accepted) {
    await deleteProject();
  }
}
</script>
```

### Patch props while open

Use `patch()` to update the mounted overlay without closing it.

```vue
<script setup lang="ts">
import { Drawer, useOverlay } from "akaza-ui";

const overlay = useOverlay();
const progressDrawer = overlay.create(Drawer);

function showProgress() {
  progressDrawer.open({ title: "Importing" });
  progressDrawer.patch({ description: "Uploading files..." });
}
</script>
```

### Custom overlay component

Custom overlay components should accept `modelValue`, emit `update:modelValue`, and optionally emit `close` with a result.

```vue
<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  message: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [value: boolean];
}>();
</script>

<template>
  <Dialog
    :model-value="modelValue"
    title="Confirm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #body>
      <p>{{ message }}</p>
    </template>
    <template #footer>
      <Button @click="emit('close', false)">Cancel</Button>
      <Button @click="emit('close', true)">Confirm</Button>
    </template>
  </Dialog>
</template>
```

## SSR and ownership

During SSR, `useOverlay()` called in component setup shares one manager within that Vue app, isolated from other requests. Do not call it at module scope or outside component setup on the server. Capture the returned manager in setup for later event handlers. The browser default remains shared so programmatic calls and `OverlayProvider` reach the same queue.

Overlay focus scopes recognize Akaza popup descendants across Teleport. Keep `OverlayProvider` mounted for the lifetime of the overlays it renders.

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
