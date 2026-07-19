---
title: Context Menu
description: Right-click triggered menu positioned at the pointer.
navigation:
  icon: i-lucide-mouse-pointer-2
---

`ContextMenu` uses the same item model as [Menu](/components/menu), but opens from a `contextmenu` event and positions the panel at the pointer. Use it for file lists, canvases, editors, tables, and other surfaces where secondary actions belong near the clicked target.

## Anatomy

- **`#default`**: The surface that receives the right-click gesture.
- **`#[item.slot]`**: Per-item render override when an item has a `slot` key.
- **`#checkbox-item`**: Shared override for checkbox menu items.
- **`#radio-item`**: Shared override for radio menu items.
- **`#label`**: Shared override for label rows.

The menu panel, groups, items, separators, checkbox/radio roles, and submenu panels are generated from `items`.

## Usage

::component-preview
  :::examples-context-menu-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ContextMenu } from "akaza-ui";

const items = [
  { label: "Open" },
  { label: "Rename" },
  { type: "separator" },
  { label: "Delete", disabled: true },
];
</script>

<template>
  <ContextMenu :items="items">
    <div>Right-click this area</div>
  </ContextMenu>
</template>
```
::

## Examples

### Checkbox and radio items

Context menus support the same checkbox and radio item shape as `Menu`. Checkbox items stay open by default because `closeOnSelect` only applies to normal action items.

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

const showGrid = ref(true);
const radioValues = ref({ sort: "name" });

const items = computed(() => [
  { type: "checkbox", label: "Show grid", checked: showGrid.value, onUpdateChecked: (value) => (showGrid.value = value) },
  { type: "radio", label: "Name", value: "name", radioGroup: "sort" },
  { type: "radio", label: "Date", value: "date", radioGroup: "sort" },
]);
</script>

<template>
  <ContextMenu v-model:radio-values="radioValues" :items="items">
    <div>Right-click</div>
  </ContextMenu>
</template>
```

### Programmatic open

Use the exposed `openAt(x, y)` method when the menu should open from a custom gesture.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ContextMenu } from "akaza-ui";

const menu = ref<InstanceType<typeof ContextMenu>>();
</script>

<template>
  <ContextMenu ref="menu" :items="items">
    <button @click="menu?.openAt(120, 160, 'custom')">Open at point</button>
  </ContextMenu>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[] \| MenuItem[][]` | — | Flat or grouped menu item array. |
| `disabled` | `boolean` | `false` | Prevents opening. |
| `closeOnSelect` | `boolean` | `true` | Closes after normal item selection. |
| `radioValues` | `Record<string, string>` | — | State for radio item groups. |
| `sideOffset` | `number` | `4` | Gap in px from the pointer. |
| `longPressDelay` | `number` | `700` | Touch/pen hold delay. Set `0` to disable. |
| `restoreFocus` | `boolean` | `true` | Returns focus after keyboard close or selection. |
| `teleport` | `string \| false` | `"body"` | Teleport target. |
| `ui` | `ContextMenuUi` | — | Classes for root, content, and menu parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `(open, details)` | Fired before open state changes. |
| `select` | `(item, details)` | Fired when a normal item is selected. |
| `check-change` | `(item, checked, details)` | Fired when a checkbox item changes. |
| `radio-change` | `(group, value, details)` | Fired when a radio item is selected. |
| `update:radioValues` | `(values)` | v-model event for radio state. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `isOpen`, `openAt`, `close` | Context-menu surface. |
| `[item.slot]` | Depends on item type | Per-item render override. |
| `checkbox-item` | `item`, `checked` | Shared checkbox item renderer. |
| `radio-item` | `item`, `checked` | Shared radio item renderer. |
| `label` | `item` | Shared label renderer. |

### Exposed Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `openAt` | `(x: number, y: number, reason?, event?) => void` | Opens at viewport coordinates. |
| `close` | `(reason?, event?) => void` | Closes the menu. |

### UI Options

`ContextMenuUi` extends `MenuUi`.

| Key | Description |
|-----|-------------|
| `root` | Context-menu wrapper. |
| `content` | Floating menu panel. |
| `panel`, `group`, `item`, `checkboxItem`, `radioItem`, `separator`, `label`, `submenu`, `submenuTrigger`, `submenuContent` | Same as [Menu UI options](/components/menu#ui-options). |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-context-menu-root` | `data-akaza-state`, `data-akaza-disabled` |
| `content` | `akaza-context-menu-content`, `akaza-menu-content` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align`, `--akaza-context-menu-duration` |
| menu parts | `akaza-menu-*` | Same as Menu. |

Popup entry and exit use a subtle side-aware structural transition. Override `--akaza-context-menu-duration` to change its `120ms` duration. Reduced-motion preference shortens it automatically.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowDown` / `ArrowUp` | Move highlighted item. |
| `Home` / `End` | Move to first/last enabled item. |
| `Enter` / `Space` | Select or toggle highlighted item. |
| `ArrowRight` / `ArrowLeft` | Open/close submenu. |
| `Escape` | Close the context menu. |
| `Shift+F10` / Context Menu key | Open at focused target. |

Touch and pen users can open the menu with a long press. Moving more than 10px before delay cancels it.
