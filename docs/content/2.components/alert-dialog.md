---
title: Alert Dialog
description: A modal dialog that interrupts the user and requires a response.
navigation:
  icon: i-lucide-triangle-alert
---

An alert dialog interrupts the user with important content and blocks interaction with the rest of the page until dismissed. Focus is trapped inside and screen readers announce it as an alert.

Use this for destructive or irreversible actions. For non-critical dialogs, use [Dialog](/components/dialog) instead.

## Anatomy

- **`#trigger`** — element that opens the dialog
- **`#header`** — area containing the title and optional close control
- **`#title`** — the dialog's accessible title
- **`#description`** — supplementary description text
- **`#body`** — main content area
- **`#footer`** — action buttons (confirm / cancel)

## Usage

::component-preview
  :::examples-alert-dialog-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { AlertDialog } from "akaza-ui";
</script>

<template>
  <AlertDialog
    title="Delete account"
    description="This action cannot be undone. Your data will be permanently removed."
  >
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Delete account</button>
    </template>

    <template #footer="{ close }">
      <button @click="() => close()">Cancel</button>
      <button class="btn-danger" @click="() => close()">Delete</button>
    </template>
  </AlertDialog>
</template>
```
::

## Examples

### Custom header

```vue
<template>
  <AlertDialog>
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Are you sure?</h2>
      <button aria-label="Close" @click="() => close()">✕</button>
    </template>

    <template #body="{ descriptionId }">
      <p :id="descriptionId">This cannot be undone.</p>
    </template>

    <template #footer="{ close }">
      <button @click="() => close()">Cancel</button>
      <button @click="() => close()">Confirm</button>
    </template>
  </AlertDialog>
</template>
```

### Programmatic control

Expose the component ref to open/close from outside.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AlertDialog } from "akaza-ui";

const dialog = ref();
</script>

<template>
  <AlertDialog ref="dialog">
    <template #footer="{ close }">
      <button @click="() => close()">Dismiss</button>
    </template>
  </AlertDialog>

  <button @click="dialog?.open()">Open from outside</button>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Convenience title prop. Slot `#title` takes priority. |
| `description` | `string` | — | Convenience description prop. Slot `#description` takes priority. |
| `teleport` | `string \| false` | `"body"` | Teleport target for the dialog. |
| `transition` | `string \| false` | `"akaza-alert-dialog"` | Named Vue transition to apply. |
| `duration` | `number` | `150` | Transition duration in ms. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `AlertDialogUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle }` | Element that opens the dialog. |
| `header` | `{ close, titleId }` | Header region. |
| `title` | — | Dialog title. Defaults to the `title` prop. |
| `description` | — | Description text. Defaults to the `description` prop. |
| `body` | `{ close, descriptionId }` | Main content area. |
| `footer` | `{ close }` | Action buttons region. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open: boolean, details]` | Fired when the open state changes. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the dialog. |
| `close` | `(reason?, event?) => void` | Closes the dialog. |
| `toggle` | `(reason?, event?) => void` | Toggles the dialog. |
| `titleId` | `string` | Auto-generated id for the title element. |
| `descriptionId` | `string` | Auto-generated id for the description element. |

### UI Options

| Key | Description |
|-----|-------------|
| `overlay` | The backdrop overlay element. |
| `content` | The dialog panel element. |
| `header` | The header region. |
| `title` | The title element. |
| `description` | The description element. |
| `body` | The body region. |
| `footer` | The footer region. |
