---
title: Drawer
description: A panel that slides in from the edge of the viewport.
navigation:
  icon: i-lucide-panel-right
---

A slide-in panel anchored to a viewport edge. Supports swipe-to-close on touch devices and all four sides. It is modal by default; use `:modal="false"` to keep the page interactive.

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
  <Drawer
    title="Cart"
    side="right"
  >
    <template #trigger="{ toggle }">
      <button @click="toggle">Open cart</button>
    </template>

    <template #body>
      <p>Your items will appear here.</p>
    </template>

    <template #footer="{ close }">
      <button @click="close">Close</button>
      <button>Checkout</button>
    </template>
  </Drawer>
</template>
```
::

## Examples

### Nonmodal side panel

Set `modal` to `false` for a preview that stays open while users interact with the page. There is no backdrop, focus trap, or body scroll lock. Opening does not move focus. Closing restores focus only if it was still inside the drawer; focus elsewhere on the page stays unchanged. Escape still closes the topmost drawer; clicking elsewhere does not close it.

::component-preview
  :::examples-drawer-nonmodal
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Drawer } from "akaza-ui";
import { ref } from "vue";

const open = ref(false);
const issue = ref("Login stalls");
const draft = ref("");
</script>

<template>
  <label>
    Quick capture
    <input v-model="draft" />
  </label>
  <button
    v-for="item in ['Login stalls', 'Search is slow']"
    :key="item"
    @click="
      issue = item;
      open = true;
    "
  >
    {{ item }}
  </button>
  <Drawer
    v-model="open"
    :modal="false"
    title="Issue preview"
  >
    <template #body>
      <p>{{ issue }}</p>
    </template>
    <template #footer="{ close }"><button @click="close">Close preview</button></template>
  </Drawer>
</template>
```
::

The panel keeps `role="dialog"` but omits `aria-modal`. Use `title`, `#title`, or `aria-label` to name it. An enclosing modal Dialog still controls interaction outside that Dialog. For a panel that takes space in the page instead of floating over it, use [AppLayout](/components/app-layout).

### Bottom drawer

Use `side="bottom"` for mobile-style sheets and short task flows.

```vue
<template>
  <Drawer
    side="bottom"
    title="Options"
  >
    <template #trigger="{ toggle }">
      <button @click="toggle">Open options</button>
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
  <Drawer
    :swipe-to-close="false"
    title="Required"
  >
    <template #trigger="{ toggle }">
      <button @click="toggle">Open</button>
    </template>
    <template #footer="{ close }">
      <button @click="close">Done</button>
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
      <button @click="toggle">Menu</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Navigation</h2>
      <button @click="close">✕</button>
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
| `modal` | `boolean` | `true` | Show a backdrop, trap focus, hide background content from assistive technology, and lock body scrolling. Set false for a nonmodal panel. |
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
| `overlay` | The backdrop overlay; rendered only in modal mode. |
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

`Drawer` renders trigger slot content plus a teleported panel and, in modal mode, an overlay. Use `ui` keys instead of plain `class` fallthrough. Your markup supplies the `handle` slot.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Tab` / `Shift + Tab` | Cycles through drawer controls in modal mode. Follows normal page order in nonmodal mode. |
| `Escape` | Closes the topmost drawer. Restores prior focus in modal mode, or when focus was inside a nonmodal drawer. |

Pointer and touch users can use backdrop dismissal in modal mode and swipe gestures in either mode. Include a close button for keyboard and screen reader users.
