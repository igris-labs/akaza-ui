---
title: Collapsible
description: A single section that can be expanded or collapsed.
navigation:
  icon: i-lucide-chevrons-down-up
---

Collapsible controls one expandable region, such as a filter panel, "show more" section, or code block.

For a list of collapsible items with headings, see [Accordion](/components/accordion).

## Anatomy

- **`#trigger`**: Content rendered inside the trigger button.
- **`#icon`**: Optional indicator rendered after the trigger content.
- **`#content`**: Panel revealed when open.

The trigger button is rendered by the component. Use the `ui.trigger` prop to add classes to it.

## Usage

::component-preview
---
fitContent: true
---
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

The `#trigger` slot renders inside the trigger button. Use `ui.trigger` to style the button and `#icon` to replace the default chevron.

```vue
<template>
  <Collapsible :ui="{ trigger: 'px-4 py-2 hover:bg-neutral-50' }">
    <template #trigger>
      <span>Details</span>
    </template>

    <template #icon="{ isOpen }">
      <svg
        :class="['chevron', { 'chevron--open': isOpen }]"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </template>

    <template #content>
      <p>Expanded content here.</p>
    </template>
  </Collapsible>
</template>
```

### Programmatic control

Use exposed methods when another control needs to open or close the panel.

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

Remove slot content after the closing CSS transition finishes, instead of
retaining it hidden. Region, inner, and body wrappers remain mounted. Reopening
during exit preserves the current slot instance.

```vue
<template>
  <Collapsible :unmount-on-hide="true">
    <template #trigger>
      <span>Toggle</span>
    </template>
    <template #content>Mounted while open and during exit.</template>
  </Collapsible>
</template>
```

By default, slot content stays mounted so form drafts and local state survive
closing. Closed content is inert and hidden from assistive technology, even
before hydration or without the package stylesheet. The region receives `hidden`
after exit completes. There is no `forceMount` prop; default retention is the
existing keep-mounted API.

The public SDK `bindPanel` coordinates sizing, CSS completion, and focus recovery.
Opening does not autofocus content. Closing around focused content returns focus
to the trigger without stealing outside focus. Canceled changes and controlled
parent refusal do not start an exit.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Prevents the panel from being toggled. |
| `unmountOnHide` | `boolean` | `false` | Remove slot content after its closing transition; otherwise retain it hidden. |
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
| `icon` | The default icon element. |
| `contentWrapper` | Animated region wrapper. |
| `contentInner` | Overflow-hiding inner wrapper. |
| `content` | The panel body element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-collapsible` | `data-akaza-state`, `data-akaza-disabled` |
| `trigger` | `akaza-collapsible-trigger` | `data-akaza-state`, `data-akaza-disabled` |
| `icon` | `akaza-collapsible-icon` | `data-akaza-state` |
| `contentWrapper` | `akaza-collapsible-content` | `data-akaza-state` |
| `contentInner` | `akaza-collapsible-content-inner` | — |
| `content` | `akaza-collapsible-content-body` | — |

The region exposes `--akaza-collapsible-content-height` and
`--akaza-collapsible-content-width`: measured pixel sizes during animation, `auto`
once open, and `0px` when closed. The default transition uses height rather than
grid rows. Existing classes, wrappers, `ui` keys, and state attributes remain.

The animated wrapper uses block flow so its contents keep a measurable natural
height while closed. Put grid or flex content layouts on `ui.content`; shrinking
the wrapper's grid rows to zero prevents height measurement.

SDK-owned `data-starting-style` and `data-ending-style` mark entry and exit.
Customize CSS through `ui.contentWrapper`; do not add another Vue `Transition`,
timer, or presence manager to the region. SDK completion controls when it hides
and when `unmountOnHide` removes the slot. Keep `[hidden]` regions `display: none`
if overriding their display mode. Package CSS disables default panel and icon
transitions under reduced motion; custom animations should honor it too.

```css
.custom-collapsible-panel {
  height: var(--akaza-collapsible-content-height);
  transition: height 240ms ease-out;
}
.custom-collapsible-panel[data-starting-style],
.custom-collapsible-panel[data-ending-style] {
  height: 0;
}
@media (prefers-reduced-motion: reduce) {
  .custom-collapsible-panel { transition: none; }
}
```

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Toggles focused trigger through native button behavior. |
| `Tab` / `Shift + Tab` | Uses native order. Closed content is inert and cannot receive focus. |
