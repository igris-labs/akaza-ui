---
title: Collapsible
description: A single section that can be expanded or collapsed.
navigation:
  icon: i-lucide-chevrons-down-up
---

A single collapsible region controlled by a trigger. Use this for inline toggleable content like a filter panel, "show more" section, or expandable code block.

For a list of collapsible items with headings, see [Accordion](/components/accordion).

## Anatomy

- **`#trigger`** — content rendered inside the trigger button
- **`#icon`** — optional indicator rendered after the trigger content
- **`#content`** — the panel that reveals when open

The trigger button is rendered by the component. Use the `ui.trigger` prop to add classes to it.

## Usage

::component-preview
  :::examples-collapsible-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Collapsible } from "akaza-ui";
</script>

<template>
  <Collapsible :ui="{ trigger: 'px-4 py-2 hover:bg-neutral-50' }">
    <template #trigger="{ isOpen }">
      <span>{{ isOpen ? "Show less" : "Show more" }}</span>
    </template>

    <template #content>
      <p>This content is revealed when open.</p>
    </template>
  </Collapsible>
</template>
```
::

## Examples

### With animated icon

The `#trigger` slot is rendered inside the trigger button — use `ui.trigger` to style the button, and `#icon` to replace the default chevron.

```vue
<template>
  <Collapsible :ui="{ trigger: 'px-4 py-2 hover:bg-neutral-50' }">
    <template #trigger>
      <span>Details</span>
    </template>

    <template #icon="{ isOpen }">
      <svg :class="['chevron', { 'chevron--open': isOpen }]" .../>
    </template>

    <template #content>
      <p>Expanded content here.</p>
    </template>
  </Collapsible>
</template>
```

### Programmatic control

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Collapsible } from "akaza-ui";

const panel = ref();
</script>

<template>
  <Collapsible ref="panel">
    <template #content>Hidden details.</template>
  </Collapsible>

  <button @click="panel?.open()">Open</button>
  <button @click="panel?.close()">Close</button>
</template>
```

### Unmount on hide

Remove the content from the DOM when collapsed, instead of hiding it.

```vue
<template>
  <Collapsible :unmount-on-hide="true">
    <template #trigger>
      <span>Toggle</span>
    </template>
    <template #content>Only in DOM when open.</template>
  </Collapsible>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Prevents the panel from being toggled. |
| `unmountOnHide` | `boolean` | `false` | Remove content from the DOM when closed. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `CollapsibleUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle }` | The toggle trigger element. |
| `icon` | `{ isOpen }` | Indicator icon inside the trigger. |
| `content` | `{ isOpen, close }` | The collapsible panel body. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the panel. |
| `close` | `(reason?, event?) => void` | Closes the panel. |
| `toggle` | `(reason?, event?) => void` | Toggles the panel. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open: boolean, details]` | Fired when the open state changes. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The outer wrapper element. |
| `trigger` | The trigger element. |
| `content` | The panel content element. |
