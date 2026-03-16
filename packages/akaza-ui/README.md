# akaza-ui

Vue-native headless UI primitives — accessible, unstyled, composable.

> **Status:** Early development. API is not stable.

## Philosophy

Built for Vue 3, not adapted from React. Every primitive uses `v-model`, named scoped slots, and `useX` composables as first-class APIs — no sub-component trees, no `asChild`.

- **Slot-based** — `#trigger`, `#header`, `#body`, `#footer` slots keep templates flat
- **`ui` prop** — inject CSS classes per structural part (`ui.overlay`, `ui.content`, …)
- **Composable-first** — use `useDialog()`, `useMenu()` etc. standalone or paired with components
- **Accessible** — WAI-ARIA roles, keyboard navigation, focus management
- **Unstyled** — `data-akaza-*` attributes and semantic class hooks; no style opinion

## Requirements

- Vue `>=3.5.0`

## Installation

```sh
npm install akaza-ui
# or
pnpm add akaza-ui
```

## Components

`Button` · `Toggle` · `Switch` · `Checkbox` · `RadioGroup` · `Progress` · `Avatar` · `Separator` · `Collapsible` · `Accordion` · `Tooltip` · `Popover` · `Dialog` · `AlertDialog` · `Drawer` · `Menu` · `MenuItem` · `MenuSeparator` · `Tabs` · `TabList` · `Tab` · `TabPanel` · `TabPanels`

## Composables

`useDialog` · `useAlertDialog` · `useDrawer` · `useMenu` · `usePopover` · `useTooltip` · `useTabs` · `useButton` · `useAvatar`

## Usage

```vue
<script setup lang="ts">
import { Dialog, useDialog } from 'akaza-ui'

const dialog = useDialog()
</script>

<template>
  <Dialog
    v-model="dialog.isOpen.value"
    :ui="{
      overlay: 'fixed inset-0 bg-black/50',
      content: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md',
      header: 'flex items-center justify-between p-6 border-b',
      body: 'p-6',
      footer: 'flex justify-end gap-2 p-6 border-t',
    }"
  >
    <template #trigger="{ toggle }">
      <button @click="toggle">Open</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Dialog Title</h2>
      <button @click="close">✕</button>
    </template>

    <template #body="{ descriptionId }">
      <p :id="descriptionId">Dialog description.</p>
    </template>

    <template #footer="{ close }">
      <button @click="close">Cancel</button>
      <button @click="close">Confirm</button>
    </template>
  </Dialog>
</template>
```

## Styling

Style via the `ui` prop or target semantic classes and data attributes:

```css
.akaza-dialog-overlay { … }
.akaza-dialog-content { … }
[data-akaza-state="open"] { … }
[data-akaza-side="bottom"] { … }
```

## License

MIT
