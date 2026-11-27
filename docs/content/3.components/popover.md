---
title: Popover
description: A floating panel anchored to a trigger element.
navigation:
  icon: i-lucide-message-square
---

Popover positions a non-modal panel next to its trigger. It supports rich hints, pickers, and contextual forms without trapping focus.

SDK positioning follows the trigger through scrolling and resizing and flips to
the opposite side when there is not enough room. Both inline and teleported
panels use fixed coordinates. `teleport` controls where the panel renders in the
DOM; it does not change the positioning strategy.

The SDK owns popup presence, dismissal, positioning, and focus return. On supported
browsers the panel uses the native top layer, including when `teleport` is `false`.
Teleport still controls DOM placement and logical nesting follows the trigger.

## Anatomy

- **`#trigger`**: Element that opens the popover.
- **`#content`**: Floating panel content.

## Usage

::component-preview
  :::examples-popover-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Popover } from "akaza-ui";
</script>

<template>
  <Popover>
    <template #trigger="{ toggle, triggerProps }">
      <button v-bind="triggerProps" @click="toggle">Open</button>
    </template>

    <template #content>
      <p>Popover content here.</p>
    </template>
  </Popover>
</template>
```
::

## Examples

### Positioned to the top

Use `side` and `align` to control where the panel appears relative to the trigger.

```vue
<template>
  <Popover
    side="top"
    align="center"
  >
    <template #trigger="{ toggle, triggerProps }">
      <button v-bind="triggerProps" @click="toggle">Info</button>
    </template>
    <template #content>
      <p>Appears above the button.</p>
    </template>
  </Popover>
</template>
```

### With a close button inside

Use the content slot's `close` function for actions inside the panel.

```vue
<template>
  <Popover>
    <template #trigger="{ toggle, triggerProps }">
      <button v-bind="triggerProps" @click="toggle">Filters</button>
    </template>

    <template #content="{ close }">
      <div class="popover-panel">
        <h3>Filter options</h3>
        <!-- filter controls -->
        <button @click="close">Apply</button>
      </div>
    </template>
  </Popover>
</template>
```

### Enable teleport

By default the popover stays in the DOM tree next to its trigger. Pass `teleport="body"` to render the panel under `<body>`.

```vue
<template>
  <Popover teleport="body">
    <template #trigger="{ toggle, triggerProps }">
      <button v-bind="triggerProps" @click="toggle">Open</button>
    </template>
    <template #content>Content in body.</template>
  </Popover>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Preferred side to position the popover. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignment relative to the trigger. |
| `sideOffset` | `number` | `6` | Gap in px between trigger and panel. |
| `teleport` | `string \| false` | `false` | Teleport target. |
| `transition` | `string \| false` | `"akaza-popover"` | CSS transition class prefix, or `false` to disable transition classes. |
| `ui` | `PopoverUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle, triggerProps }` | Element that opens the popover. |
| `content` | `{ close }` | The floating panel content. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the popover. |
| `close` | `(reason?, event?) => void` | Closes the popover. |
| `toggle` | `(reason?, event?) => void` | Toggles the popover. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open: boolean, details]` | Fired when the open state changes. |

Reasons include `trigger`, `escape`, `outside-click`, and `programmatic`. Actions
also accept custom reason strings. `details.event` preserves the original DOM
event, and `details.cancel()` prevents the model update. A controlled parent may
also refuse the update without changing popup presence or focus.

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Trigger wrapper/root. |
| `content` | The floating panel element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-popover-root` | `data-akaza-state` |
| `content` | `akaza-popover-content` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align` |

### Positioning Variables

The panel updates when its trigger or content resizes, and on viewport scroll or resize. Placement can switch sides to fit the viewport.

| Variable | Meaning |
| --- | --- |
| `--akaza-popover-anchor-width` | Anchor width in pixels. |
| `--akaza-popover-anchor-height` | Anchor height in pixels. |
| `--akaza-popover-available-width` | Available width at the resolved placement. |
| `--akaza-popover-available-height` | Available height at the resolved placement. |
| `--akaza-popover-transform-origin` | Origin matching the resolved side and alignment. |

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Opens when trigger is a native button wired to `toggle`. |
| `Escape` | Requests closing the topmost popover. An accepted close returns focus to its trigger without scrolling, unless focus moved to another control. Canceled or refused closes preserve focus. |
| `Tab` / `Shift + Tab` | Follows trigger-relative popup order, including teleported content; Popover does not trap focus. |

Apply `triggerProps` to trigger element so expanded state and popup relationship are announced.

Opening does not move focus. If the browser leaves focus on the previous element
after clicking the trigger, Escape can still return focus to the trigger. Opening
from an external control does not transfer that control's focus when closing.

The panel is a generic non-modal container, not a dialog. `triggerProps` supplies `aria-expanded` and, while open, `aria-controls`; it does not advertise `aria-haspopup="dialog"`. Use `Dialog` when dialog semantics and focus management are required.

Existing `*-enter-active`, `*-enter-from`, `*-enter-to`, `*-leave-active`, and
`*-leave-to` classes apply only during the transition. Style the settled open
panel through `ui.content` or `data-akaza-state="open"`. SDK presence keeps content mounted
through its exit animation; no Vue `Transition` controls removal. During exit,
`data-akaza-state` is `closed` even while the content remains mounted.
