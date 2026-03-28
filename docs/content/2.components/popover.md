---
title: Popover
description: A floating panel anchored to a trigger element.
navigation:
  icon: i-lucide-message-square
---

A non-modal floating panel positioned relative to a trigger. Use it for tooltips with rich content, pickers, or contextual forms. Unlike [Dialog](/components/dialog), it doesn't trap focus.

## Anatomy

- **`#trigger`** — element that opens the popover
- **`#content`** — the floating panel content

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
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open</button>
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

```vue
<template>
  <Popover side="top" align="center">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Info</button>
    </template>
    <template #content>
      <p>Appears above the button.</p>
    </template>
  </Popover>
</template>
```

### With a close button inside

```vue
<template>
  <Popover>
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Filters</button>
    </template>

    <template #content="{ close }">
      <div class="popover-panel">
        <h3>Filter options</h3>
        <!-- filter controls -->
        <button @click="() => close()">Apply</button>
      </div>
    </template>
  </Popover>
</template>
```

### Disable teleport

By default the popover is teleported to `<body>`. Disable this if you need it to stay in the DOM tree (e.g. for stacking contexts).

```vue
<template>
  <Popover :teleport="false">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Open</button>
    </template>
    <template #content>Content in-tree.</template>
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
| `teleport` | `string \| false` | `"body"` | Teleport target. |
| `transition` | `string \| false` | `"akaza-popover"` | Named Vue transition. |
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

### UI Options

| Key | Description |
|-----|-------------|
| `content` | The floating panel element. |
