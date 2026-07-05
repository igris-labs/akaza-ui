---
title: Tooltip
description: A floating label that appears when the user hovers or focuses an element.
navigation:
  icon: i-lucide-info
---

A small informational popup that appears on hover and focus. Does not trap focus. Use it to provide supplemental context for icon buttons or truncated text.

## Anatomy

- **`#trigger`**: Element the tooltip anchors to.
- **`#content`**: Tooltip popup text or content.

## Usage

::component-preview
  :::examples-tooltip-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Tooltip } from "akaza-ui";
</script>

<template>
  <Tooltip>
    <template #trigger>
      <button aria-label="Settings">⚙️</button>
    </template>

    <template #content>Settings</template>
  </Tooltip>
</template>
```
::

## Examples

### Custom delay

Use delay props to tune how quickly the tooltip appears and disappears.

```vue
<template>
  <Tooltip :delay-duration="500">
    <template #trigger>
      <button>Hover me</button>
    </template>
    <template #content>Appears after 500ms</template>
  </Tooltip>
</template>
```

### Positioned to the right

Use `direction` to choose the preferred side for the tooltip.

```vue
<template>
  <Tooltip direction="right">
    <template #trigger>
      <button>ℹ️</button>
    </template>
    <template #content>More information</template>
  </Tooltip>
</template>
```

### With arrow

Use `arrow` when the tooltip needs a visual pointer back to the trigger.

```vue
<template>
  <Tooltip :arrow="true">
    <template #trigger>
      <button>Help</button>
    </template>
    <template #content>This is a tooltip with an arrow.</template>
  </Tooltip>
</template>
```

### Disabled tooltip

Use `disabled` when the trigger should render but the tooltip should not open.

```vue
<template>
  <Tooltip :disabled="true">
    <template #trigger>
      <button>No tooltip here</button>
    </template>
    <template #content>You won't see this.</template>
  </Tooltip>
</template>
```

### Controlled open state

Use `v-model` when external state should control tooltip visibility.

```vue
<script setup lang="ts">
import { ref } from "vue";
const open = ref(false);
</script>

<template>
  <Tooltip v-model="open">
    <template #trigger>
      <button @focus="open = true" @blur="open = false">Focus me</button>
    </template>
    <template #content>Controlled tooltip</template>
  </Tooltip>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Which side the tooltip appears on. |
| `delayDuration` | `number` | `300` | Delay in ms before the tooltip shows on hover. |
| `closeDelay` | `number` | `0` | Delay in ms before the tooltip hides after hover ends. |
| `disabled` | `boolean` | `false` | Prevent the tooltip from showing. |
| `arrow` | `boolean` | `false` | Show an arrow pointing to the trigger. |
| `teleport` | `string \| false` | `"body"` | Teleport target. |
| `transition` | `string \| false` | `"akaza-tooltip"` | Named Vue transition. |
| `ui` | `TooltipUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, triggerProps }` | The element that triggers the tooltip. |
| `content` | `{ close }` | The tooltip popup content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The outer wrapper element. |
| `trigger` | The trigger element wrapper. |
| `content` | The tooltip popup element. |
| `arrow` | The optional arrow element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-tooltip-root` | — |
| `trigger` | `akaza-tooltip-trigger` | `data-akaza-state` |
| `content` | `akaza-tooltip-content` | `data-akaza-state`, `data-akaza-side` |
| `arrow` | `akaza-tooltip-arrow` | — |
