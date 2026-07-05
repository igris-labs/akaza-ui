---
title: Drawer
description: A panel that slides in from the edge of the viewport.
navigation:
  icon: i-lucide-panel-right
---

A slide-in panel anchored to a viewport edge. Supports swipe-to-close on touch devices, focus trapping, and all four sides.

## Anatomy

- **`#trigger`**: Element that opens the drawer.
- **`#handle`**: Optional drag handle. Usually shown at the top for bottom drawers.
- **`#header`**: Region with title and close control.
- **`#title`**: Drawer accessible title.
- **`#description`**: Supplementary description text.
- **`#body`**: Main content area.
- **`#footer`**: Action buttons.

## Usage

::component-preview
  :::examples-drawer-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Drawer } from "akaza-ui";
</script>

<template>
  <Drawer title="Cart" side="right">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open cart</button>
    </template>

    <template #body>
      <p>Your items will appear here.</p>
    </template>

    <template #footer="{ close }">
      <button @click="() => close()">Close</button>
      <button>Checkout</button>
    </template>
  </Drawer>
</template>
```
::

## Examples

### Bottom drawer

Use `side="bottom"` for mobile-style sheets and short task flows.

```vue
<template>
  <Drawer side="bottom" title="Options">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open options</button>
    </template>
    <template #body>
      <p>Sheet content.</p>
    </template>
  </Drawer>
</template>
```

### Disable swipe to close

Disable swipe dismissal when accidental close would be costly.

```vue
<template>
  <Drawer :swipe-to-close="false" title="Required">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open</button>
    </template>
    <template #footer="{ close }">
      <button @click="() => close()">Done</button>
    </template>
  </Drawer>
</template>
```

### Custom header

Use `#header` when the drawer needs custom title actions.

```vue
<template>
  <Drawer side="left">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Menu</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Navigation</h2>
      <button @click="() => close()">✕</button>
    </template>

    <template #body>
      <nav>...</nav>
    </template>
  </Drawer>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Edge the drawer slides from. |
| `title` | `string` | — | Convenience title. Slot `#title` takes priority. |
| `description` | `string` | — | Convenience description. Slot `#description` takes priority. |
| `ariaLabel` | `string` | — | Fallback accessible name when no title is rendered. |
| `inset` | `number \| string` | `0` | Space between the drawer and the viewport edge. |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking the overlay. |
| `swipeToClose` | `boolean` | `true` | Allow swiping the drawer closed on touch devices. |
| `teleport` | `string \| false` | `"body"` | Teleport target. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `DrawerUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle }` | Element that opens the drawer. |
| `handle` | — | Drag handle element. |
| `header` | `{ close, titleId }` | Header region. |
| `title` | — | Drawer title. Defaults to the `title` prop. |
| `description` | — | Description text. Defaults to the `description` prop. |
| `body` | `{ close, descriptionId }` | Main content area. |
| `footer` | `{ close }` | Action buttons region. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the drawer. |
| `close` | `(reason?, event?) => void` | Closes the drawer. |
| `toggle` | `(reason?, event?) => void` | Toggles the drawer. |
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
| `content` | The drawer panel. |
| `header` | The header region. |
| `title` | The title element. |
| `description` | The description element. |
| `body` | The body region. |
| `footer` | The footer region. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `overlay` | `akaza-drawer-overlay` | `data-akaza-state` |
| `content` | `akaza-drawer` | `data-akaza-state`, `data-akaza-side`, `data-swiping` |
| `header` | `akaza-drawer-header` | — |
| `title` | `akaza-drawer-title` | — |
| `description` | `akaza-drawer-description` | — |
| `body` | `akaza-drawer-body` | — |
| `footer` | `akaza-drawer-footer` | — |

`Drawer` renders trigger slot content plus teleported overlay/content. Use `ui` keys instead of relying on plain `class` fallthrough. The `handle` slot is fully owned by your markup.
