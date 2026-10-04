---
title: useOverlay
description: Open dialogs, drawers, and custom overlays from Vue code.
navigation:
  icon: i-lucide-panels-top-left
---

`useOverlay()` creates reusable overlay instances. [OverlayProvider](/components/overlay) renders them; mount one provider near the app root.

Import `useOverlay` from `akaza-ui` during component setup, then use the returned manager in event handlers.

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
  <button type="button" @click="openDialog">Open dialog</button>
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
import { Button, Dialog, useOverlay } from "akaza-ui";

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
  if (accepted === true) {
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
import { Button, Dialog } from "akaza-ui";

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


## Lifecycle and results

`open(props)` merges props into the instance and returns `{ result }`. Props not supplied on a later open keep their previous values.

- `close(value)` resolves the current result with that value.
- A component's `update:modelValue=false` closes it with `undefined`; a `close` event can return a value.
- Opening the same instance again resolves the previous pending result with `undefined` before creating a new promise.
- `unmount()` resolves a pending result with `undefined` and removes the entry. The instance can be opened again.
- `destroyOnClose` removes the entry immediately after close. Leave it `false` if the component needs to remain mounted for an exit transition.
- `patch()` updates an existing entry only; before the first `open()`, or after `unmount()`, it does nothing.

Results are typed as `unknown`. Narrow them before using them; the manager does not infer a custom component's result type.

## SSR and ownership

During SSR, setup calls share one manager within that Vue app, isolated from other requests. Do not call `useOverlay()` at module scope or outside component setup on the server. The browser default is shared so the provider and event handlers reach the same queue.

Keep `OverlayProvider` mounted for the lifetime of its overlays. The mounted Dialog, Drawer, or custom component owns focus management, keyboard behavior, and styling.

## API Reference

### Signature

```ts
const overlay = useOverlay();
```

| Member | Description |
| --- | --- |
| `create(component, options?)` | Returns a reusable `OverlayInstance`. Creating it does not mount it unless `defaultOpen` is true. |
| `overlays` | Reactive entries consumed by OverlayProvider. Use instance methods rather than mutating this array. |

### OverlayOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `props` | Partial component props | - | Initial props. Per-open values merge into these props. |
| `defaultOpen` | `boolean` | `false` | Mount and open at creation time. |
| `destroyOnClose` | `boolean` | `false` | Remove the entry after close. |

The component's model and close callback are provider-owned, not creation props.

### OverlayInstance

| Method | Signature | Description |
| --- | --- | --- |
| `open` | `(props?) => OverlayOpenResult` | Mount if necessary, open, and return the close result promise. |
| `close` | `(value?: unknown) => void` | Close and resolve the current result. |
| `patch` | `(props) => void` | Merge props into an existing entry without reopening it. |
| `unmount` | `() => void` | Remove the entry and settle a pending result with `undefined`. |
| `isOpen` | `() => boolean` | Read current visibility. This is a function, not a ref. |

### Exported types

| Type | Description |
| --- | --- |
| `OverlayOptions<T>` | Creation options with props inferred from the component when available. |
| `OverlayInstance<T>` | The instance methods returned by `create`. |
| `OverlayOpenResult` | An object containing `result: Promise<unknown>`. |

## Related

- [Overlay Provider](/components/overlay)
- [Dialog](/components/dialog)
- [Drawer](/components/drawer)

