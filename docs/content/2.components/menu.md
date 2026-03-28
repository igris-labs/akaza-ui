---
title: Menu
description: A floating menu of actions, anchored to a trigger element.
navigation:
  icon: i-lucide-list
---

A dropdown menu positioned relative to a trigger. Supports plain items, checkboxes, radio groups, separators, labels, submenus, and grouped item arrays.

## Anatomy

- **`#trigger`** — element that opens the menu

Items are rendered internally from the `items` prop. Individual items can be overridden via named slots using `item.slot`.

## Usage

::component-preview
  :::examples-menu-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Menu } from "akaza-ui";

const items = [
  { label: "Edit", value: "edit" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Delete", value: "delete", disabled: true },
];
</script>

<template>
  <Menu :items="items" @select="({ value }) => console.log(value)">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">Actions ▾</button>
    </template>
  </Menu>
</template>
```
::

## Examples

### Grouped items with separators

Pass an array of arrays — Akaza UI inserts separators automatically between groups.

```vue
<script setup lang="ts">
const items = [
  [
    { label: "Edit", value: "edit" },
    { label: "Rename", value: "rename" },
  ],
  [
    { label: "Delete", value: "delete" },
  ],
];
</script>

<template>
  <Menu :items="items">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">More ▾</button>
    </template>
  </Menu>
</template>
```

### Checkbox items

```vue
<script setup lang="ts">
const items = [
  { type: "checkbox", label: "Show sidebar", checked: true, value: "sidebar",
    onUpdateChecked: (v) => console.log("sidebar:", v) },
  { type: "checkbox", label: "Compact mode", checked: false, value: "compact",
    onUpdateChecked: (v) => console.log("compact:", v) },
];
</script>
```

### Radio group

```vue
<script setup lang="ts">
import { ref } from "vue";
const radioValues = ref({ view: "list" });

const items = [
  { type: "radio", label: "Grid", value: "grid", radioGroup: "view" },
  { type: "radio", label: "List", value: "list", radioGroup: "view" },
];
</script>

<template>
  <Menu :items="items" v-model:radio-values="radioValues">
    <template #trigger="{ toggle }">
      <button @click="() => toggle()">View ▾</button>
    </template>
  </Menu>
</template>
```

### Submenu

```vue
<script setup lang="ts">
const items = [
  { label: "Share", children: [
    { label: "Copy link", value: "copy-link" },
    { label: "Send email", value: "send-email" },
  ]},
];
</script>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[] \| MenuItem[][]` | — | Flat array or grouped array (groups get auto-separators). |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Preferred side to position the menu. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignment relative to the trigger. |
| `sideOffset` | `number` | `4` | Gap in px between trigger and menu. |
| `closeOnSelect` | `boolean` | `true` | Close the menu after an item is selected. |
| `radioValues` | `Record<string, string>` | — | `v-model:radio-values` — state for radio groups. |
| `teleport` | `string \| false` | `false` | Teleport target for the menu. |
| `as` | `string \| Component` | `"div"` | Root element tag. |
| `ui` | `MenuUi` | — | CSS class overrides. |

### MenuItem

| Key | Type | Description |
|-----|------|-------------|
| `label` | `string` | Display label. |
| `value` | `string` | Unique value identifier. |
| `type` | `"item" \| "checkbox" \| "radio" \| "separator" \| "label"` | Item type. Defaults to `"item"`. |
| `disabled` | `boolean` | Disables this item. |
| `checked` | `boolean` | Checked state for checkbox items. |
| `onUpdateChecked` | `(checked: boolean) => void` | Called when a checkbox item changes. |
| `radioGroup` | `string` | Radio group key for radio items. |
| `children` | `MenuItem[] \| MenuItem[][]` | Sub-menu items. |
| `slot` | `string` | Named slot key for per-item render override. |
| `onSelect` | `() => void` | Per-item select callback. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `trigger` | `{ isOpen, open, close, toggle, triggerProps }` | The element that opens the menu. |
| `[item.slot]` | `{ item }` | Per-item render override when `item.slot` is set. |

### Exposed methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `(reason?, event?) => void` | Opens the menu. |
| `close` | `(reason?, event?) => void` | Closes the menu. |
| `toggle` | `(reason?, event?) => void` | Toggles the menu. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open: boolean, details]` | Fired when the open state changes. |
| `select` | `[item: MenuItem, details]` | Fired when an item is selected. |
| `check-change` | `[item: MenuItem, checked: boolean, details]` | Fired when a checkbox item changes. |
| `radio-change` | `[group: string, value: string, details]` | Fired when a radio item is selected. |
| `update:radioValues` | `[values: Record<string, string>]` | v-model event for radio group state. |

### UI Options

| Key | Description |
|-----|-------------|
| `content` | The floating menu panel. |
| `item` | Each menu item element. |
| `separator` | Separator elements between groups. |
| `label` | Label-type item elements. |
| `group` | Group wrapper element. |
| `submenuContent` | Submenu panel element. |
