---
title: Tree
description: Accessible hierarchical navigation and selection with lazy loading, propagation, typeahead, and virtualization.
navigation:
  icon: i-lucide-folder-tree
  badge:
    label: NEW
    color: success
---

`Tree` renders nested data as one accessible tree view. Selection and expansion use stable item keys, so the data may be replaced after an API request without losing state.

The component owns the flat `role="tree"` structure, roving focus, keyboard navigation, ARIA hierarchy metadata, and optional virtualization. The application keeps control of data fetching and item content.

## Anatomy

- **`#item`**: Replaces the generated content inside every row while retaining tree semantics and selection styling.
- **`#item-[name]`**: Replaces generated content for items whose `slot` accessor resolves to that name.
- **`#toggle`**: Branch expand/collapse control.
- **`#indicator`**: Selection indicator, including indeterminate state.
- **`#icon`**: File, folder, or domain-specific icon.
- **`#label`**: Item content, including optional supporting text.
- **`#trailing`**: Metadata or actions at the end of a row.
- **`#loading`**: Loading row shown under an expanded lazy branch.
- **`#empty`**: Empty state when no items are available.

Every item slot receives `item`, normalized `node` state, node `actions`, `toggleProps`, and the `tree` controller.

## Usage

::component-preview
  :::examples-tree-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { TreeKey, TreeSelection } from "akaza-ui";
import { Tree } from "akaza-ui";
import { ref } from "vue";

const selected = ref<TreeSelection>("button");
const expanded = ref<TreeKey[]>(["src"]);
const items = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "button", label: "Button.vue" },
      { id: "tree", label: "Tree.vue" },
    ],
  },
  { id: "package", label: "package.json" },
];
</script>

<template>
  <Tree
    v-model="selected"
    v-model:expanded="expanded"
    :items="items"
    item-key="id"
    aria-label="Project files"
  />
</template>
```
::

## Examples

### Lazy children

Mark unloaded branches with `hasChildren`. When a branch expands, fetch its children, replace the corresponding item, and remove its key from `loadingKeys`.

::component-preview
  :::examples-tree-lazy-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { TreeExpandedChangeEventDetails, TreeKey } from "akaza-ui";
import { ref } from "vue";

const items = ref([{ id: "users", label: "Users", lazy: true }]);
const expanded = ref<TreeKey[]>([]);
const loadingKeys = ref<TreeKey[]>([]);

async function onExpandedChange(_keys: TreeKey[], details: TreeExpandedChangeEventDetails<(typeof items.value)[number]>) {
  if (!details.expanded || !details.item.lazy) return;
  loadingKeys.value = [...loadingKeys.value, details.key];
  const children = await fetch(`/api/tree/${details.key}`).then(response => response.json());
  items.value = items.value.map(item => item.id === details.key ? { ...item, children } : item);
  loadingKeys.value = loadingKeys.value.filter(key => key !== details.key);
}
</script>

<template>
  <Tree
    v-model:expanded="expanded"
    :items="items"
    item-key="id"
    :has-children="item => item.lazy || Boolean(item.children?.length)"
    :loading-keys="loadingKeys"
    @expanded-change="onExpandedChange"
  />
</template>
```
::

`Tree` does not cache or fetch data. This keeps request deduplication, retries, authorization, and cache policy in the application.

### Multiple selection and propagation

Use `selectionPropagation="both"` when selecting a branch should select its descendants and fully selected descendants should select their ancestors.

```vue
<template>
  <Tree
    v-model="permissions"
    :items="permissionItems"
    item-key="id"
    selection-mode="multiple"
    selection-propagation="both"
  >
    <template #indicator="{ node }">
      <span>{{ node.isIndeterminate ? "-" : node.isSelected ? "x" : "" }}</span>
    </template>
  </Tree>
</template>
```

Propagation modes are `none`, `down`, `up`, and `both`. Disabled and non-selectable items are excluded.

For leaf-only selection, resolve `selectableKey` from the item rather than adding another selection mode:

```vue
<Tree
  :items="items"
  item-key="id"
  :selectable-key="item => item.type === 'file'"
/>
```

### Icons and row actions

Use the granular slots for content that should keep the built-in row behavior. Use `#item` only when replacing the complete row.

```vue
<template>
  <Tree :items="items" item-key="id">
    <template #icon="{ item, node }">
      <FolderOpenIcon v-if="item.type === 'folder' && node.isExpanded" />
      <FolderIcon v-else-if="item.type === 'folder'" />
      <FileIcon v-else />
    </template>

    <template #trailing="{ item }">
      <button type="button" data-akaza-tree-ignore @click="rename(item)">Rename</button>
    </template>
  </Tree>
</template>
```

Interactive controls in a row do not activate or select the node. Add `data-akaza-tree-ignore` to a custom interactive wrapper that is not a native button, link, input, select, textarea, or editable element.

The data contract has no built-in description field. Render a title, description, or any other item content through `#label`:

```vue
<Tree :items="items" item-key="id">
  <template #label="{ item }">
    <span class="grid">
      <span>{{ item.title }}</span>
      <span class="text-sm text-neutral-500">{{ item.description }}</span>
    </span>
  </template>
</Tree>
```

### Row expansion

Clicking a branch row toggles it by default. Native controls and elements marked with `data-akaza-tree-ignore` do not toggle the branch. Restrict expansion to the generated toggle button when row clicks perform another action:

```vue
<Tree :expand-on-click="false" />
```

### Selection highlight

Selection semantics always stay on the complete `treeitem`. `selectionHighlight` only controls the visual highlight boundary:

```vue
<Tree selection-highlight="full" />
<Tree selection-highlight="indented" />
<Tree selection-highlight="label" />
```

- `full` spans the available row width.
- `indented` starts at the node depth. This is the default.
- `label` follows the label content.

Style all three modes with `ui.selection`. Its `data-akaza-selection-highlight` value identifies the active boundary.

### Expansion motion

Children fade and move a few pixels as branches open and close. Existing rows also move into their new position. Disable this behavior when another animation system owns the rows:

```vue
<Tree :transition="false" />
```

Motion is disabled automatically for virtualized trees and reduced to an effectively immediate transition when the user prefers reduced motion.

### Activation and detail loading

`activate` runs on row click, touch, or `Enter`. Use it to load a detail panel independently from branch expansion.

```vue
<template>
  <Tree
    :items="items"
    item-key="id"
    @activate="(item, details) => openDetails(item, details.reason)"
  />
</template>
```

### Virtualization

Virtualization keeps only the visible rows mounted. Set a fixed row height and viewport height.

```vue
<template>
  <Tree
    :items="largeTree"
    item-key="id"
    :virtualize="{ height: 320, itemHeight: 36, overscan: 6 }"
  />
</template>
```

Keep custom rows and loading content compatible with `itemHeight`; variable-height virtualization is not supported.

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `TreeKey \| TreeKey[] \| null` | `null` | Selected key in single mode or selected keys in multiple mode. |
| `v-model:expanded` | `TreeKey[]` | `defaultExpanded` | Expanded branch keys. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `readonly T[]` | required | Nested tree data. |
| `itemKey` | `keyof T \| (item) => TreeKey` | required | Stable, globally unique item key. |
| `labelKey` | `keyof T \| (item) => unknown` | `"label"` | Label accessor. |
| `childrenKey` | `keyof T \| (item) => T[]` | `"children"` | Child collection accessor. |
| `disabledKey` | `keyof T \| (item) => unknown` | `"disabled"` | Disabled state accessor. |
| `selectableKey` | `keyof T \| (item) => unknown` | `"selectable"` | Selectable state accessor. |
| `defaultExpandedKey` | `keyof T \| (item) => unknown` | `"defaultExpanded"` | Initial expansion accessor. |
| `slotKey` | `keyof T \| (item) => unknown` | `"slot"` | Dynamic item slot accessor. |
| `textValue` | `(item: T) => string` | label text | Text used by typeahead. |
| `hasChildren` | `(item: T) => boolean` | - | Marks a branch before its children are loaded. |
| `defaultValue` | `TreeSelection` | `null` | Initial uncontrolled selection. |
| `defaultExpanded` | `TreeKey[]` | item defaults | Initial uncontrolled expansion. |
| `loadingKeys` | `readonly TreeKey[]` | `[]` | Branches currently loading children. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"single"` | Selection mode. |
| `selectionBehavior` | `"replace" \| "toggle"` | `"toggle"` | Multiple-selection behavior without a modifier key. |
| `selectionPropagation` | `"none" \| "up" \| "down" \| "both"` | `"none"` | Branch selection propagation. |
| `selectionHighlight` | `"full" \| "indented" \| "label"` | `"indented"` | Visual boundary used by `ui.selection`; ARIA selection remains on the complete item. |
| `selectOnFocus` | `boolean` | `false` | Selects a node when roving focus reaches it. |
| `expandOnClick` | `boolean` | `true` | Toggles a branch when its non-interactive row content is clicked. Toggle buttons always work. |
| `disabled` | `boolean` | `false` | Disables the tree. |
| `readOnly` | `boolean` | `false` | Blocks selection changes while preserving navigation and expansion. |
| `typeahead` | `boolean` | `true` | Enables printable-character navigation. |
| `transition` | `boolean` | `true` | Enables built-in branch row motion. Ignored during virtualization. |
| `indent` | `number` | `16` | Indentation in pixels for each nested level. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Navigation orientation. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction and horizontal Arrow behavior. |
| `virtualize` | `boolean \| TreeVirtualOptions` | `false` | Enables fixed-height row virtualization. |
| `ariaLabel` | `string` | `"Tree"` | Accessible tree label. |
| `ariaLabelledby` | `string` | - | Id of an accessible label. |
| `ariaDescribedby` | `string` | - | Id of supporting text. |
| `labels` | `TreeLabels<T>` | - | Expand, collapse, loading, and empty labels. |
| `as` | `string \| Component` | `"div"` | Root element or component. |
| `ui` | `TreeUi` | - | Classes for structural parts. |

`TreeVirtualOptions` accepts `height`, `itemHeight`, and `overscan` numbers.

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `selection-change` | `(value, details)` | Fired before selection updates. |
| `expanded-change` | `(keys, details)` | Fired before expansion updates. `details.expanded` reports the requested branch state. |
| `focus-change` | `(key, details)` | Fired before the roving focus key changes. |
| `activate` | `(item, details)` | Fired on row click, touch, or `Enter`. |

Event `details` include `key`, `item`, `reason`, the original `event` when available, and `cancel()`. Calling `cancel()` in a change event prevents its model update.

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` | `item`, `node`, `actions`, `toggleProps`, `tree` | Replaces generated content inside every row. |
| `item-[name]` | same as `item` | Content replacement selected by an item's `slot` value. |
| `toggle` | `item`, `node`, `actions`, `toggleProps`, `tree` | Toggle content inside the generated button. |
| `indicator` | `item`, `node`, `actions`, `toggleProps`, `tree` | Selection indicator. |
| `icon` | `item`, `node`, `actions`, `toggleProps`, `tree` | Item icon. |
| `label` | `item`, `node`, `actions`, `toggleProps`, `tree` | Item content. May contain a title and supporting text. |
| `trailing` | `item`, `node`, `actions`, `toggleProps`, `tree` | Trailing content or controls. |
| `loading` | `item`, `node`, `actions`, `toggleProps`, `tree` | Expanded lazy-branch loading content. |
| `empty` | `tree` | Empty state. |

`node` exposes key, parent, depth, sibling position, label, and branch, expansion, selection, indeterminate, focus, disabled, selectable, and loading state.

### Exposed Methods

| Method | Description |
|--------|-------------|
| `getNode(key)` | Returns normalized item state. |
| `getItem(key)` | Returns the source item. |
| `focus(key?)` | Focuses a visible enabled item. |
| `select(key)` | Selects an item. |
| `toggleSelection(key)` | Toggles item selection. |
| `expand(key)` / `collapse(key)` | Changes one branch. |
| `toggleExpanded(key)` | Toggles one branch. |
| `expandAll()` / `collapseAll()` | Changes all enabled branches. |
| `activate(key)` | Emits item activation. |

The `tree` controller available to slots exposes the same methods plus reactive visible nodes, selected items, models, and focused key.

### Item Shape

Default accessors recognize these keys. Accessor props support any data shape.

| Key | Type | Description |
|-----|------|-------------|
| `id` | `string \| number` | Stable key when `item-key="id"`. |
| `label` | `string` | Visible label and default typeahead text. |
| `children` | `TreeItem[]` | Nested items. |
| `disabled` | `boolean` | Disables interaction. |
| `selectable` | `boolean` | Excludes the item from selection while keeping navigation. |
| `defaultExpanded` | `boolean` | Expands the branch initially in uncontrolled mode. |
| `slot` | `string` | Selects `#item-[name]`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Component root. |
| `viewport` | Scrollable element with `role="tree"`. |
| `virtualWrapper` | Virtual row sizing wrapper. |
| `item` | Focusable `role="treeitem"`. |
| `row` | Visible row content. |
| `indent` | Structural indentation spacer. |
| `content` | Indented content from the node depth onward. |
| `selection` | Active full, indented, or label highlight boundary. Use it for selection, hover, and focus styles. |
| `toggle` | Branch toggle. Its dimensions are reused by the hidden leaf spacer. |
| `leafSpacer` | Hidden leaf alignment spacer outside the indented highlight boundary. |
| `toggleIcon` | Default rotating chevron. |
| `indicator` | Selection indicator wrapper. |
| `icon` | Icon wrapper. |
| `text` | Label wrapper. |
| `label` | Item content. |
| `trailing` | Trailing content. |
| `loading` | Lazy branch loading row. |
| `empty` | Empty state. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-tree` | `data-akaza-state`, `data-akaza-orientation`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-selection-highlight`, `data-akaza-transition` |
| `viewport` | `akaza-tree-viewport` | tree ARIA attrs, virtual height style |
| `virtualWrapper` | `akaza-tree-virtual-wrapper` | virtual transform/height style |
| `item` | `akaza-tree-item` | `data-akaza-state`, `data-akaza-selected`, `data-akaza-indeterminate`, `data-akaza-focused`, `data-akaza-disabled`, `data-akaza-selectable`, `data-akaza-loading`, `data-akaza-depth`, hierarchy ARIA attrs |
| `row` | `akaza-tree-row` | Item state attrs plus `data-akaza-selection-highlight` |
| `indent` | `akaza-tree-indent` | Width uses `--akaza-tree-indent-offset` |
| `content` | `akaza-tree-content` | Starts after the indentation spacer |
| `selection` | `akaza-tree-selection` | `data-akaza-selected`, `data-akaza-indeterminate`, `data-akaza-focused`, `data-akaza-selection-highlight` |
| `toggle` | `akaza-tree-toggle` | `aria-expanded`, native `disabled`; also sizes the hidden leaf spacer |
| `leafSpacer` | `akaza-tree-toggle-spacer` | `aria-hidden="true"` |
| `toggleIcon` | `akaza-tree-toggle-icon` | `data-akaza-state="expanded \| collapsed"` |
| `indicator` | `akaza-tree-indicator` | - |
| `icon` | `akaza-tree-icon` | `aria-hidden="true"` |
| `text` | `akaza-tree-text` | - |
| `label` | `akaza-tree-label` | - |
| `trailing` | `akaza-tree-trailing` | - |
| `loading` | `akaza-tree-loading` | `role="status"` |
| `empty` | `akaza-tree-empty` | - |

Plain `class` applies to the root. Use `ui.viewport`, `ui.item`, and the granular part keys for generated content. Items expose `--akaza-tree-depth` and the computed `--akaza-tree-indent-offset`.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowDown` / `ArrowUp` | Move through visible items in a vertical tree. |
| `ArrowRight` | Expand a collapsed branch, then move to its first child. In RTL, `ArrowLeft` does this. |
| `ArrowLeft` | Collapse an expanded branch, then move to its parent. In RTL, `ArrowRight` does this. |
| `Home` / `End` | Move to the first/last enabled visible item. |
| `*` | Expand all enabled branches at the current level. |
| `Space` | Select or toggle the focused item. |
| `Enter` | Select and activate the focused item. |
| `Shift` + movement Arrow or `Home` / `End` | Extend a multiple-selection range from its anchor. |
| `Ctrl+A` / `Cmd+A` | Select all enabled items in multiple mode. |
| printable characters | Move to the next visible label matching the typed prefix. |

Horizontal orientation maps movement to Left/Right and expansion to Down/Up. One visible enabled item participates in the page tab order.

In multiple mode, `Shift` + click selects the visible range from the last selection anchor. `Ctrl` / `Cmd` + `Shift` + click adds that range to the current selection.
