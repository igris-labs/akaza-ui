---
title: Tooltip
description: A floating label that appears when the user hovers or focuses an element.
navigation:
  icon: i-lucide-info
---

Tooltip shows supplemental text on hover or focus without trapping focus. It suits icon buttons and truncated text.

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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps" aria-label="Settings">⚙️</button>
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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps">Hover me</button>
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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps" aria-label="Information">ℹ️</button>
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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps">Help</button>
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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps">No tooltip here</button>
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
    <template #trigger="{ triggerProps }">
      <button v-bind="triggerProps">
        Focus me
      </button>
    </template>
    <template #content>Controlled tooltip</template>
  </Tooltip>
  <button @click="open = !open">Toggle externally</button>
</template>
```

## Hover, SSR, and layers

The transparent hit area bridges the gap between the trigger and tooltip content.
The SDK owns hover handoff, hover delays, focus activation, dismissal, and presence.
Keyboard focus opens immediately; `delayDuration` applies to hover. Escape ignores
`closeDelay` and closes the tooltip without moving focus. Delay props remain reactive
after mount; tooltips can open immediately when moving between recently used triggers.

Open tooltips do not install browser listeners during SSR. Client tooltips use the
SDK popup stack and native top layer where supported. Closed tooltip markup may
remain mounted with SDK-owned hiding; mounted does not mean open. Named transition
classes remain supported, while SDK presence owns exit completion. Bind the slot's
`triggerProps` to the actual focusable trigger so `aria-describedby` reaches it.
The SDK keeps that description relationship while the hidden tooltip is closed,
including during SSR, so assistive technology can find the hint before focus.

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
| `transition` | `string \| false` | `"akaza-tooltip"` | CSS transition class prefix, or `false` to disable transition classes. |
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

### Positioning Variables

SDK positioning leaves CSS transforms available for consumer styles and enter/leave transitions. The preferred direction flips to its opposite side when space is insufficient. The arrow follows the resolved placement.

| Variable | Meaning |
| --- | --- |
| `--akaza-tooltip-anchor-width` | Anchor width in pixels. |
| `--akaza-tooltip-anchor-height` | Anchor height in pixels. |
| `--akaza-tooltip-available-width` | Available width at the resolved placement. |
| `--akaza-tooltip-available-height` | Available height at the resolved placement. |
| `--akaza-tooltip-transform-origin` | Origin matching the resolved side and alignment. |

### Keyboard

| Key | Behavior |
|-----|----------|
| `Tab` / `Shift + Tab` | Focusing trigger or its child opens tooltip; leaving closes it. |
| `Escape` | Closes the topmost tooltip without moving focus. |

Tooltip never requires pointer hover. Apply `triggerProps` to interactive trigger so `aria-describedby` reaches actual focus target.
