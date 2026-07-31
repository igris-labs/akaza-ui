---
title: Pagination
description: Accessible page navigation with ranges, ellipses, boundary controls, and optional links.
navigation:
  icon: i-lucide-ellipsis
  badge:
    label: NEW
    color: success
---

`Pagination` calculates a compact page range from total items and page size, then renders semantic navigation with current-page metadata, optional ellipses, and boundary controls. Controls can be buttons or real links.

Use it when content is split into numbered pages. Keep data fetching and URL synchronization in application code through `v-model` and `getPageHref`.

## Anatomy

- **`#first`**: First-page control content.
- **`#previous`**: Previous-page control content.
- **`#page`**: Page control content with page number and active state.
- **`#ellipsis`**: Omitted-range marker with start/end side.
- **`#next`**: Next-page control content.
- **`#last`**: Last-page control content.
- **`#state`**: Optional renderless output with page, page count, visible items, and navigation action.

The component generates `nav`, list, page controls, current-page ARIA, and disabled boundary behavior. Style generated parts with `ui`.

## Usage

::component-preview
  :::examples-pagination-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Pagination } from "akaza-ui";
import { ref } from "vue";

const page = ref(1);
</script>

<template>
  <Pagination
    v-model="page"
    :total="240"
    :items-per-page="10"
    show-edges
    show-first-last
  />
</template>
```
::

## Examples

### Visible siblings

`siblingCount` controls how many pages remain visible on each side of the current page. Without edges, Pagination renders a moving compact window.

```vue
<template>
  <Pagination v-model="page" :total="200" :items-per-page="10" :sibling-count="1" />
</template>
```

### Edges and ellipses

Set `showEdges` to preserve first and last page numbers and insert ellipses around omitted ranges.

```vue
<template>
  <Pagination v-model="page" :total="500" show-edges />
</template>
```

### First and last controls

Boundary controls are opt-in. Previous and next controls are enabled by default and can also be removed.

```vue
<template>
  <Pagination
    v-model="page"
    :total="500"
    show-first-last
    :show-previous-next="false"
  />
</template>
```

### Real links

Return an href to render controls as anchors. Disabled boundary links prevent navigation and leave the tab order.

```vue
<template>
  <Pagination
    v-model="page"
    :total="500"
    :get-page-href="(value) => `/reports?page=${value}`"
  />
</template>
```

### Cancel navigation

`value-change` fires before the model update, so pending forms or unsaved state can block a page change.

```vue
<template>
  <Pagination
    v-model="page"
    :total="500"
    @value-change="(_page, details) => {
      if (hasUnsavedChanges) details.cancel()
    }"
  />
</template>
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `number` | `1` | Current page. Rendered state is clamped to available pages. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `total` | `number` | `0` | Total number of data items. |
| `itemsPerPage` | `number` | `10` | Data items represented by each page. |
| `siblingCount` | `number` | `2` | Visible page numbers on each side of current page. |
| `showEdges` | `boolean` | `false` | Always includes first/last page numbers and ellipses. |
| `showFirstLast` | `boolean` | `false` | Renders explicit first/last controls. |
| `showPreviousNext` | `boolean` | `true` | Renders previous/next controls. |
| `disabled` | `boolean` | `false` | Disables all pagination controls. |
| `ariaLabel` | `string` | `"Pagination"` | Accessible navigation label. |
| `getPageHref` | `(page) => string \| undefined` | — | Renders controls as anchors when an href is returned. |
| `ui` | `PaginationUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `page` | Fired after an accepted page change. |
| `value-change` | `(page, details)` | Fired before page change. `details.cancel()` prevents it. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `first` | `disabled` | First-page control content. |
| `previous` | `disabled` | Previous-page control content. |
| `page` | `page`, `isActive` | Numbered page content. |
| `ellipsis` | `side` | Start/end ellipsis content. |
| `next` | `disabled` | Next-page control content. |
| `last` | `disabled` | Last-page control content. |
| `state` | `page`, `pageCount`, `items`, `goToPage` | Optional state-driven custom UI. |

### Methods

| Method | Description |
|--------|-------------|
| `goToPage(page, reason?, event?)` | Clamps and activates a page. |
| `firstPage(event?)` | Activates page one. |
| `previousPage(event?)` | Activates previous page. |
| `nextPage(event?)` | Activates next page. |
| `lastPage(event?)` | Activates final page. |
| `pageCount` | Read-only computed page count. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Semantic navigation root. |
| `list` | Page list. |
| `item` | Every list item wrapper. |
| `first` | First-page control. |
| `previous` | Previous-page control. |
| `page` | Numbered page control. |
| `ellipsis` | Omitted-range marker. |
| `next` | Next-page control. |
| `last` | Last-page control. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-pagination` | `data-akaza-state="single|multiple"`, `data-akaza-disabled`, `data-akaza-page`, `data-akaza-page-count` |
| `list` | `akaza-pagination-list` | — |
| `item` | `akaza-pagination-item` | `data-akaza-type="page|ellipsis"` on generated range items |
| `first` | `akaza-pagination-first` | `data-akaza-disabled`, native/ARIA disabled attrs |
| `previous` | `akaza-pagination-previous` | `data-akaza-disabled`, native/ARIA disabled attrs |
| `page` | `akaza-pagination-page` | `data-akaza-state="active|inactive"`, `data-akaza-page`, `data-akaza-disabled`, `aria-current="page"` |
| `ellipsis` | `akaza-pagination-ellipsis` | `data-akaza-state="ellipsis"`, `data-akaza-side="start|end"` |
| `next` | `akaza-pagination-next` | `data-akaza-disabled`, native/ARIA disabled attrs |
| `last` | `akaza-pagination-last` | `data-akaza-disabled`, native/ARIA disabled attrs |

Plain `class` applies to the `nav` root. Use `ui.page` and control-specific keys for generated controls.

### Keyboard

Pagination uses native buttons or links. Tab moves through enabled controls; Enter and Space activate buttons, and Enter activates links. Boundary controls are disabled and removed from the tab order when they cannot move further.
