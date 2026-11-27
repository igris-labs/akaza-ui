---
title: Accordion
description: A set of collapsible sections with headings.
navigation:
  icon: i-lucide-layout-panel-top
---

Accordion displays expandable sections with single or multiple selection and keyboard navigation.

## Anatomy

Accordion is a single component. You shape every part through named slots:

- **`#trigger`**: Content rendered inside the trigger button. Defaults to the item label.
- **`#icon`**: Optional chevron or indicator rendered after the trigger content.
- **`#content`**: Panel body revealed when the item is open.
- **`#[item.slot]`**: Per-item override when an item has a `slot` key.

The trigger button itself is rendered by the component; use the `ui.trigger` prop to add classes to it.

Each trigger sits in an unstyled heading wrapper. Set `headingLevel` to fit the page outline; the default is `3`. Style that wrapper with `ui.header`.

## Usage

::component-preview
---
fitContent: true
---
  :::examples-accordion-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Accordion } from "akaza-ui";

const items = [
  {
    value: "a",
    label: "What is Akaza UI?",
    content: "A headless Vue component library with a Vue-native slots API.",
  },
  {
    value: "b",
    label: "Is it styled?",
    content: "No. Bring your own CSS, Tailwind, or design system.",
  },
  {
    value: "c",
    label: "Does it support keyboard input?",
    content: "Yes. Use arrow, Home, End, Enter, and Space keys.",
  },
];
</script>

<template>
  <Accordion
    :items="items"
    collapsible
    :ui="{ trigger: 'px-4 py-3 hover:bg-neutral-50' }"
  >
    <template #trigger="{ item }">
      <span>{{ item.label }}</span>
    </template>
    <template #icon="{ isOpen }">
      <svg :class="{ 'rotate-180': isOpen }" />
    </template>
    <template #content="{ item }">
      <p>{{ item.content }}</p>
    </template>
  </Accordion>
</template>
```
::

## Examples

### Custom trigger and icon

The `#trigger` slot renders inside the trigger button. Style the button with `ui.trigger`, and replace its chevron with `#icon`.

```vue
<template>
  <Accordion
    :items="items"
    :ui="{ trigger: 'px-4 py-3 hover:bg-neutral-50' }"
  >
    <template #trigger="{ item, isOpen }">
      <span :class="['trigger-label', { 'trigger-label--open': isOpen }]">
        {{ item.label }}
      </span>
    </template>

    <template #icon="{ isOpen }">
      <svg
        :class="['icon', { 'icon--open': isOpen }]"
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
  </Accordion>
</template>
```

### Multiple open items

Use `type="multiple"` when more than one accordion panel should stay open at the same time.

```vue
<template>
  <Accordion
    :items="items"
    type="multiple"
  />
</template>
```

### Panel lifecycle

Closed panels keep their slot content mounted by default, preserving form drafts
and component state. Closed content is inert and hidden from assistive technology,
including before hydration and without the package stylesheet. After the closing
transition finishes, the region receives `hidden`.

Set `unmountOnHide` to remove only the slot content after the exit finishes. The
region, inner wrapper, and body wrapper remain mounted. Reopening during exit
keeps the same slot instance. There is no `forceMount` prop; default retention is
the existing keep-mounted API.

The public SDK `bindPanel` coordinates sizing, CSS completion, and focus recovery.
Opening does not autofocus content. Closing around focused content returns focus
to that panel's trigger; outside focus is left alone. Cancellation and a controlled
parent refusing a change do not start an exit.

### Per-item custom content

Give an item a `slot` key to render rich content in its panel.

```vue
<script setup lang="ts">
const items = [{ value: "form", label: "Contact us", slot: "contact-form" }];
</script>

<template>
  <Accordion :items="items">
    <template #contact-form="{ close }">
      <form @submit.prevent="close">
        <input
          type="email"
          placeholder="your@email.com"
        />
        <button type="submit">Send</button>
      </form>
    </template>
  </Accordion>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | — | **Required.** List of accordion items. |
| `type` | `"single" \| "multiple"` | `"single"` | Whether one or many items can be open simultaneously. |
| `collapsible` | `boolean` | `false` | Allow toggling the open item closed again (single mode only). |
| `disabled` | `boolean` | `false` | Disable all items. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Orientation of the accordion. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | Accessible heading level around each trigger. |
| `unmountOnHide` | `boolean` | `false` | Remove slot content after its closing transition; otherwise retain it hidden. |
| `valueKey` | `string` | — | Property to read as the unique item value. |
| `labelKey` | `string` | `"label"` | Property to use as the trigger label. |
| `contentKey` | `string` | — | Property to use as the body text. |
| `disabledKey` | `string` | `"disabled"` | Property to read for per-item disabled state. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `AccordionUi` | — | CSS class overrides. |

### AccordionItem

| Key | Type | Description |
|-----|------|-------------|
| `value` | `string` | Unique identifier. Auto-generated if omitted. |
| `label` | `string` | Trigger label text. |
| `content` | `string` | Panel body text (used when no content slot is provided). |
| `disabled` | `boolean` | Disables this item. |
| `slot` | `string` | Named slot key for a custom panel content slot. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ item, value, isOpen, toggle }` | Trigger button content for every item. |
| `icon` | `{ isOpen, item }` | Icon inside the trigger (e.g. chevron). |
| `content` | `{ item, value, isOpen }` | Panel body content for every item. |
| `[item.slot]` | `{ item, value, isOpen }` | Per-item panel override when `item.slot` is set. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `[value: string \| string[], details]` | Fired when the open item(s) change. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root accordion element. |
| `item` | Wrapper element around each trigger + content pair. |
| `header` | Unstyled heading wrapper around the trigger. |
| `trigger` | The trigger button element. |
| `icon` | The icon container inside the trigger. |
| `contentWrapper` | Animated region wrapper. |
| `contentInner` | Overflow-hiding inner wrapper. |
| `content` | Panel body element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-accordion` | `data-akaza-orientation` |
| `item` | `akaza-accordion-item` | `data-akaza-state`, `data-akaza-disabled` |
| `header` | `akaza-accordion-header` | `role="heading"`, `aria-level` |
| `trigger` | `akaza-accordion-trigger` | `data-akaza-state`, `data-akaza-disabled` |
| `icon` | `akaza-accordion-icon` | `data-akaza-state` |
| `contentWrapper` | `akaza-accordion-content` | `data-akaza-state` |
| `contentInner` | `akaza-accordion-content-inner` | — |
| `content` | `akaza-accordion-content-body` | — |

The region exposes `--akaza-accordion-content-height` and
`--akaza-accordion-content-width`: measured pixel sizes during animation, `auto`
once open, and `0px` when closed. The default transition uses height, not the old
grid-row transition. Classes, wrappers, `ui` keys, and `data-akaza-state` remain
available for custom CSS.

The animated wrapper uses block flow so its contents keep a measurable natural
height while closed. Put grid or flex content layouts on `ui.content`; shrinking
the wrapper's grid rows to zero prevents height measurement.

SDK-owned `data-starting-style` and `data-ending-style` mark entry and exit.
Override transition duration or add animations through `ui.contentWrapper`; the
SDK waits for CSS completion before hiding or unmounting. Do not add a second
Vue `Transition`, timer, or presence manager to the region. Keep `[hidden]`
regions `display: none`, including when overriding their display mode. Package
CSS disables the default panel and icon transitions under reduced motion; apply
the same preference to custom animations.

```css
.custom-accordion-panel {
  height: var(--akaza-accordion-content-height);
  transition: height 240ms ease-out;
}
.custom-accordion-panel[data-starting-style],
.custom-accordion-panel[data-ending-style] {
  height: 0;
}
@media (prefers-reduced-motion: reduce) {
  .custom-accordion-panel { transition: none; }
}
```

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Toggles focused trigger through native button behavior. |
| `ArrowDown` / `ArrowUp` | Moves between enabled triggers in vertical orientation and loops. |
| `ArrowRight` / `ArrowLeft` | Moves between enabled triggers in horizontal orientation and loops. |
| `Home` / `End` | Focuses first or last enabled trigger. |

Every enabled trigger remains a native Tab stop. Arrow keys only move focus; they do not change the open value. Horizontal arrows follow inherited text direction. Nested accordions and controls inside panels handle their own keys. Composition and Ctrl/Meta/Alt shortcuts do not move focus.
