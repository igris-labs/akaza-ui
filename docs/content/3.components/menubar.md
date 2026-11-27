---
title: Menubar
description: Horizontal menu strip with arrow-key navigation across menus.
navigation:
  icon: i-lucide-panel-top
---

`Menubar` renders a horizontal `role="menubar"` command strip. Top-level triggers move with left/right arrows and each trigger can open a collision-aware vertical menu panel using the same `MenuItem` shape as [Menu](/components/menu).

## Anatomy

- **`#trigger`**: Custom top-level trigger content.
- **`#[item.slot]`**: Per-item render override for a top-level trigger or panel item.
- **`#checkbox-item`**: Shared checkbox item renderer.
- **`#radio-item`**: Shared radio item renderer.
- **`#label`**: Shared label row renderer.

## Usage

::component-preview
  :::examples-menubar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Menubar } from "akaza-ui";

const items = [
  { label: "File", children: [{ label: "New file" }, { label: "Open" }] },
  { label: "View", children: [{ label: "Preview" }, { label: "Source" }] },
];
</script>

<template>
  <Menubar
    :items="items"
    aria-label="Editor menu"
  />
</template>
```
::

## Examples

Nested items accept the same [submenu positioning options](/components/menu#menusubmenuoptions) as Menu. Use `submenu: { anchor: "parent", align: "end" }` to align a submenu with the immediate parent popup's bottom. These options do not change the top-level menubar panel's placement.

### Radio groups

Pass `radioValues` for radio menu items. The event contract matches `Menu`.

```vue
<template>
  <Menubar
    v-model:radio-values="radioValues"
    :items="[
      {
        label: 'View',
        children: [
          { type: 'radio', label: 'Preview', value: 'preview', radioGroup: 'view' },
          { type: 'radio', label: 'Source', value: 'source', radioGroup: 'view' },
        ],
      },
    ]"
  />
</template>
```

### Custom trigger

Use `#trigger` when top-level menu buttons need icons or badges.

```vue
<template>
  <Menubar :items="items">
    <template #trigger="{ item, isOpen }">
      <span>{{ item.label }}</span>
      <span aria-hidden="true">{{ isOpen ? "▲" : "▼" }}</span>
    </template>
  </Menubar>
</template>
```

### Controlled menu and top-level actions

Plain items without `children` are commands. Bind default `v-model` to control the open top-level menu.

```vue
<Menubar
  v-model="openMenu"
  :items="[
    { value: 'file', label: 'File', children: fileItems },
    { value: 'save', label: 'Save', onSelect: save },
  ]"
/>
```

## Focus and direction

Set `dir="rtl"` for right-to-left movement. Triggers keep their remembered tab stop by item value when reordered. Disabled triggers are skipped. From an open panel, the horizontal arrows move to the adjacent menu; a submenu's open/close keys take priority. Escape returns focus to the menu's trigger unless the close is canceled.

```vue
<script setup lang="ts">
import { Menubar } from "akaza-ui";
import { ref } from "vue";

const open = ref<string | null>(null);
const items = [
  { value: "file", label: "File", children: [{ label: "New file" }] },
  { value: "edit", label: "Edit", children: [{ label: "Undo" }] },
];
</script>

<template>
  <Menubar v-model="open" :items="items" dir="rtl" :loop="false" aria-label="Application menu" />
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenubarItem[]` | required | Top-level menu items. Items with `children` open panels. |
| `loop` | `boolean` | `true` | Left/right focus wraps. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reverses horizontal arrow behavior for RTL. |
| `teleport` | `string \| false` | `"body"` | Popup DOM target. Set `false` for inline panels; native top-layer presentation is unchanged. |
| `disabled` | `boolean` | `false` | Disables the menubar. |
| `closeOnSelect` | `boolean` | `true` | Closes after normal item selection. |
| `radioValues` | `Record<string, string>` | — | State for radio groups inside panels. |
| `ariaLabel` | `string` | — | Accessible label. |
| `ariaLabelledby` | `string` | — | Accessible label id. |
| `ui` | `MenubarUi` | — | Classes for root, triggers, content, and menu parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `(value: string \| null, details)` | Fired before active menu changes. |
| `select` | `(item, details)` | Fired when an item is selected. |
| `check-change` | `(item, checked, details)` | Fired when checkbox item changes. |
| `radio-change` | `(group, value, details)` | Fired when radio item changes. |
| `update:radioValues` | `(values)` | v-model event for radio state. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `item`, `isOpen` | Top-level trigger content. |
| `[item.slot]` | Depends on item type | Per-item panel renderer. |
| `checkbox-item` | `item`, `checked` | Shared checkbox item renderer. |
| `radio-item` | `item`, `checked` | Shared radio item renderer. |
| `label` | `item` | Shared label renderer. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | `role="menubar"` root. |
| `trigger` | Top-level menu trigger button. |
| `content` | Open menu panel wrapper. |
| `panel`, `group`, `item`, `checkboxItem`, `radioItem`, `separator`, `label`, `submenu`, `submenuTrigger`, `submenuContent` | Same as Menu. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-menubar` | `data-akaza-state`, `data-akaza-disabled` |
| `trigger` | `akaza-menubar-trigger` | `data-akaza-state`, `data-akaza-disabled` |
| `content` | `akaza-menubar-content`, `akaza-menu-content` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align`, `--akaza-menubar-anchor-width`, `--akaza-menubar-anchor-height`, `--akaza-menubar-available-width`, `--akaza-menubar-available-height`, `--akaza-menubar-transform-origin`, `--akaza-menubar-duration` |
| menu parts | `akaza-menu-*` | Same as Menu. |

Popup transitions follow their placement side and last `120ms`. Set `--akaza-menubar-duration` to change the duration. Reduced-motion mode removes the visible transition.

### Keyboard

Typeahead works across top-level triggers and within each open panel. It ignores case and accents and skips disabled items. Repeat a letter to cycle matches. The query clears after 500ms. Space continues an active query instead of activating a command.

Submenus use [Menu's viewport collision positioning](/components/menu#submenus). Horizontal arrows follow `dir` even when a submenu flips visually. Opening a submenu does not switch the top-level menu.

The SDK owns native top-layer presentation, nesting, dismissal, positioning, and exit presence. Panels teleport to `body` by default; `:teleport="false"` changes the DOM parent without disabling native top-layer presentation. Use `ui.content` for popup styles; descendant selectors from the menubar root do not cross Teleport. Nested panels share Menu's styling hooks.

Existing `akaza-menubar-enter-*` and `akaza-menubar-leave-*` transition classes remain. A closing panel keeps its last menu's items mounted until its exit finishes, with `data-akaza-state="closed"`. The shared popup adapter allocates `--akaza-layer-order` for CSS fallback stacking. `--akaza-z-layer-base` and `--akaza-z-menubar` remain fallback styling hooks, not controls for native top-layer order or SDK dismissal. A selected command may move focus elsewhere without the menubar taking it back.

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Move between top-level triggers. |
| `ArrowDown` | Open active menu and focus first panel item. |
| `ArrowUp` | Open active menu and focus last panel item. |
| `Enter` / `Space` | Open a menu or activate a top-level command without children. |
| `ArrowUp` / `ArrowDown` | Move within an open panel. |
| `Home` / `End` | Focus first/last enabled top-level item. |
| Character keys | Typeahead across top-level items. |
| `Escape` | Close the open panel and return focus to its trigger. |
| `Tab` / `Shift+Tab` | Leave the menu through SDK popup focus handling without trapping focus. |

Panel navigation skips disabled items across groups. Each nested submenu owns its own tab stop and highlight. Checkbox and radio updates preserve the focused row when item values stay stable. Composition and Ctrl/Meta/Alt shortcuts do not navigate or activate panel items.
