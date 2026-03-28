---
title: Accordion
description: A set of collapsible sections with headings.
navigation:
  icon: i-lucide-layout-panel-top
---

A vertically stacked list of items that can be expanded or collapsed. Supports single or multiple open items and full keyboard navigation.

## Anatomy

Accordion is a single component. You shape every part through named slots:

- **`#trigger`** — content rendered inside the trigger button (defaults to the item label)
- **`#icon`** — optional chevron/indicator rendered after the trigger content
- **`#content`** — the panel body revealed when the item is open
- **`#[item.slot]`** — per-item override when an item has a `slot` key

The trigger button itself is rendered by the component; use the `ui.trigger` prop to add classes to it.

## Usage

::component-preview
  :::examples-accordion-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Accordion } from "akaza-ui";

const items = [
  { value: "a", label: "What is Akaza UI?", content: "A headless Vue component library with a Vue-native slots API." },
  { value: "b", label: "Is it styled?", content: "No — bring your own CSS, Tailwind, or any design system." },
  { value: "c", label: "Is it accessible?", content: "Yes, fully WAI-ARIA compliant with keyboard navigation built in." },
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

The `#trigger` slot is rendered inside the trigger button — use it to customise the label content. Style the button itself with `ui.trigger`. Use `#icon` to override the chevron indicator.

```vue
<template>
  <Accordion :items="items" :ui="{ trigger: 'px-4 py-3 hover:bg-neutral-50' }">
    <template #trigger="{ item, isOpen }">
      <span :class="['trigger-label', { 'trigger-label--open': isOpen }]">
        {{ item.label }}
      </span>
    </template>

    <template #icon="{ isOpen }">
      <svg :class="['icon', { 'icon--open': isOpen }]" .../>
    </template>
  </Accordion>
</template>
```

### Multiple open items

```vue
<template>
  <Accordion :items="items" type="multiple" />
</template>
```

### Per-item custom content

Give an item a `slot` key to render rich content in its panel.

```vue
<script setup lang="ts">
const items = [
  { value: "form", label: "Contact us", slot: "contact-form" },
];
</script>

<template>
  <Accordion :items="items">
    <template #contact-form="{ close }">
      <form @submit.prevent="close">
        <input type="email" placeholder="your@email.com" />
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
| `unmountOnHide` | `boolean` | `false` | Remove content from the DOM when closed instead of hiding it. |
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
| `item` | Wrapper element around each trigger + content pair. |
| `trigger` | The trigger button element. |
| `icon` | The icon container inside the trigger. |
| `content` | The panel content element. |
