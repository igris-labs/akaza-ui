---
title: Dialog
description: A modal dialog that appears over the page and traps focus.
navigation:
  icon: i-lucide-square
---

A modal panel that overlays the page. Focus is trapped inside while open and restored to the trigger when closed. Screen readers are informed via `role="dialog"` and `aria-modal`.

For confirmations requiring a required response, use [Alert Dialog](/components/alert-dialog) instead.

## Anatomy

- **`#trigger`** — element that opens the dialog
- **`#overlay`** — the backdrop behind the dialog (optional)
- **`#header`** — region containing the title and close control
- **`#title`** — the dialog's accessible title
- **`#description`** — supplementary description text
- **`#body`** — main content area
- **`#footer`** — action buttons

## Usage

::component-preview
  :::examples-dialog-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Dialog } from "akaza-ui";
</script>

<template>
  <Dialog title="Edit profile">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Edit</button>
    </template>

    <template #body>
      <input type="text" placeholder="Display name" />
    </template>

    <template #footer="{ close }">
      <button @click="() => close()">Cancel</button>
      <button @click="() => close()">Save</button>
    </template>
  </Dialog>
</template>
```
::

## Examples

### Custom header with close button

```vue
<template>
  <Dialog>
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Settings</h2>
      <button aria-label="Close" @click="() => close()">✕</button>
    </template>

    <template #body>
      <p>Dialog content here.</p>
    </template>
  </Dialog>
</template>
```

### Fullscreen dialog

```vue
<template>
  <Dialog :fullscreen="true" title="Full view">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Expand</button>
    </template>
    <template #body>
      <p>Takes up the entire viewport.</p>
    </template>
  </Dialog>
</template>
```

### Prevent close on backdrop click

```vue
<template>
  <Dialog :close-on-backdrop-click="false" title="Required step">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Start</button>
    </template>
    <template #footer="{ close }">
      <button @click="() => close()">Complete</button>
    </template>
  </Dialog>
</template>
```

### Programmatic control

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "akaza-ui";

const dialog = ref();
</script>

<template>
  <Dialog ref="dialog" title="Notification">
    <template #body><p>You have a new message.</p></template>
    <template #footer="{ close }">
      <button @click="() => close()">Dismiss</button>
    </template>
  </Dialog>

  <button @click="dialog?.open()">Show notification</button>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Convenience title. Slot `#title` takes priority. |
| `description` | `string` | — | Convenience description. Slot `#description` takes priority. |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking the overlay. |
| `fullscreen` | `boolean` | `false` | Expand the dialog to fill the viewport. |
| `teleport` | `string \| false` | `"body"` | Teleport target. |
| `transition` | `string \| false` | `"akaza-dialog"` | Named Vue transition. |
| `duration` | `number` | `100` | Transition duration in ms. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `DialogUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle }` | Element that opens the dialog. |
| `overlay` | — | Backdrop element. |
| `header` | `{ close, titleId }` | Header region. |
| `title` | — | Dialog title. Defaults to the `title` prop. |
| `description` | — | Description text. Defaults to the `description` prop. |
| `body` | `{ close, descriptionId }` | Main content area. |
| `footer` | `{ close }` | Action buttons region. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the dialog. |
| `close` | `(reason?, event?) => void` | Closes the dialog. |
| `toggle` | `(reason?, event?) => void` | Toggles the dialog. |
| `titleId` | `string` | Auto-generated id for the title element. |
| `descriptionId` | `string` | Auto-generated id for the description element. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open: boolean, details]` | Fired when the open state changes. |

### UI Options

| Key | Description |
|-----|-------------|
| `overlay` | The backdrop overlay. |
| `content` | The dialog panel. |
| `header` | The header region. |
| `title` | The title element. |
| `description` | The description element. |
| `body` | The body region. |
| `footer` | The footer region. |
