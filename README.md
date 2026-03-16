# Akaza UI

Vue-native headless UI primitives — accessible, unstyled, composable.

Unlike libraries ported from React (Radix, Reka), Akaza UI is designed from scratch for Vue 3. It uses `v-model`, named scoped slots, and `useX` composables as first-class primitives — no sub-component trees, no `asChild`, no fighting the framework.

## Why Akaza UI?

| Others                                                                    | Akaza UI                                                         |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `<DialogRoot><DialogTrigger><DialogPortal><DialogOverlay><DialogContent>` | `<Dialog v-model="isOpen">` with named slots                     |
| Composables as optional wrappers                                          | Composables as the core — use standalone or pair with components |
| React-adapted DX                                                          | Vue-native: `v-model`, scoped slots, `inject/provide`            |
| Styled or opinionated defaults                                            | Fully unstyled — `data-akaza-*` attributes and class hooks only  |

## Core Philosophy

- **Slot-based, not sub-component-based** — named scoped slots (`#trigger`, `#header`, `#body`, `#footer`) keep templates flat and readable
- **`v-model`-native** — all stateful components bind via standard `v-model`
- **`ui` prop for structural styling** — pass class strings per part (`ui.overlay`, `ui.content`, `ui.header`…) instead of wrapping sub-components
- **Composable-first** — `useDialog()`, `useMenu()`, `useDrawer()` etc. work standalone for headless control or pair with components for full behavior
- **Accessible by default** — WAI-ARIA roles, keyboard navigation, and focus management built in

## Components

| Component                                             | Description                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Button`                                              | Accessible button with `disabled`, `loading`, `focusableWhenDisabled`, and `as` |
| `Toggle`                                              | On/off button with `aria-pressed`                                               |
| `Switch`                                              | Binary toggle with WAI-ARIA switch role                                         |
| `Checkbox`                                            | Tri-state checkbox (`true`, `false`, `'indeterminate'`)                         |
| `RadioGroup`                                          | Accessible radio group with custom item rendering                               |
| `Progress`                                            | Progressbar with indeterminate support                                          |
| `Avatar`                                              | Image with fallback slot on load error                                          |
| `Separator`                                           | Horizontal or vertical divider, decorative or semantic                          |
| `Collapsible`                                         | Single show/hide region with animated height                                    |
| `Accordion`                                           | Single or multi-open collapsible item list                                      |
| `Tooltip`                                             | Hover tooltip with auto-positioning and delay                                   |
| `Popover`                                             | Click-triggered floating panel with auto-positioning                            |
| `Dialog`                                              | Modal dialog with focus trap, Escape, backdrop                                  |
| `AlertDialog`                                         | Confirmation dialog (no Escape/backdrop close per WAI-ARIA)                     |
| `Drawer`                                              | Side panel with slide-in animation (`top`, `right`, `bottom`, `left`)           |
| `Menu`                                                | Dropdown menu with arrow-key navigation                                         |
| `MenuItem`                                            | Individual menu item with keyboard activation                                   |
| `MenuSeparator`                                       | Visual/semantic separator inside a menu                                         |
| `Tabs` + `TabList` + `Tab` + `TabPanel` + `TabPanels` | Full accessible tab set with animated indicator                                 |

## Composables

| Composable         | Pairs with    | Standalone use                                                  |
| ------------------ | ------------- | --------------------------------------------------------------- |
| `useDialog()`      | `Dialog`      | Control a dialog externally (`dialog.open()`, `dialog.close()`) |
| `useAlertDialog()` | `AlertDialog` | Same as above for alert dialogs                                 |
| `useDrawer()`      | `Drawer`      | Control drawer side panel                                       |
| `useMenu()`        | `Menu`        | Control menu open state                                         |
| `usePopover()`     | `Popover`     | Control popover open state                                      |
| `useTooltip()`     | `Tooltip`     | Control tooltip with delay                                      |
| `useTabs()`        | `Tabs`        | Control active tab externally                                   |
| `useButton()`      | `Button`      | Disabled/loading click guard logic                              |
| `useAvatar()`      | `Avatar`      | Image load status (`idle`, `loading`, `loaded`, `error`)        |

## Usage

### Dialog

```vue
<script setup lang="ts">
import { Dialog, useDialog } from "akaza-ui";

const dialog = useDialog();
</script>

<template>
  <Dialog
    v-model="dialog.isOpen.value"
    :ui="{ overlay: 'my-overlay', content: 'my-dialog' }"
  >
    <template #trigger="{ toggle }">
      <button @click="toggle">Open</button>
    </template>

    <template #header="{ close, titleId }">
      <h2 :id="titleId">Confirm</h2>
      <button @click="close">✕</button>
    </template>

    <template #body="{ descriptionId }">
      <p :id="descriptionId">Are you sure you want to continue?</p>
    </template>

    <template #footer="{ close }">
      <button @click="close">Cancel</button>
      <button @click="close">Confirm</button>
    </template>
  </Dialog>
</template>
```

### Drawer

```vue
<Drawer v-model="drawer.isOpen.value" side="right" :inset="16">
  <template #trigger="{ toggle }">
    <button @click="toggle">Open Drawer</button>
  </template>
  <template #body>
    <p>Drawer content</p>
  </template>
</Drawer>
```

### Menu

```vue
<Menu v-model="menu.isOpen.value">
  <template #trigger="{ toggle }">
    <button @click="toggle">Options</button>
  </template>
  <template #content="{ close }">
    <MenuItem @select="close">Profile</MenuItem>
    <MenuItem @select="close">Settings</MenuItem>
    <MenuSeparator />
    <MenuItem @select="close">Sign out</MenuItem>
  </template>
</Menu>
```

### Tabs

```vue
<Tabs v-model="activeTab">
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel value="overview">Overview content</TabPanel>
    <TabPanel value="settings">Settings content</TabPanel>
  </TabPanels>
</Tabs>
```

### Tooltip

```vue
<Tooltip direction="top" :delay-duration="200">
  <template #trigger>
    <button>Hover me</button>
  </template>
  <template #content>
    Helpful information
  </template>
</Tooltip>
```

## Styling

Akaza UI is fully unstyled. Every structural element carries:

- **`data-akaza-state`** — current state (`open`, `closed`, `checked`, `disabled`, `loading`…)
- **`data-akaza-side`** — positioning side for floating elements (`top`, `bottom`, `left`, `right`)
- **`class="akaza-[component]-[part]"`** — semantic class for CSS targeting

Style via the `ui` prop (inject classes per structural part):

```vue
<Dialog :ui="{
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
  content: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md',
  header: 'flex items-center justify-between p-6 border-b',
  body: 'p-6',
  footer: 'flex justify-end gap-2 p-6 border-t',
}">
```

Or target via CSS:

```css
[data-akaza-state="open"] { … }
.akaza-dialog-overlay { … }
.akaza-dialog-content { … }
```

## Requirements

- Vue `>=3.5.0`
- `@vueuse/core` (peer dependency, auto-installed)

## Installation

```sh
pnpm add akaza-ui
```

## Development

```sh
pnpm install
pnpm --filter playground dev   # playground with live source (no build needed)
```

The playground resolves `akaza-ui` directly from source via a Vite alias — no rebuild step required during development.

## Repo Structure

```
packages/
  akaza-ui/       — publishable library
    src/
      components/ — Vue component primitives
      composables/— useX composables (standalone + component-paired)
      utils/      — focusTrap, focusable helpers
playground/       — interactive demo app (Tailwind v4 + Vue Router)
docs/             — future documentation site
```

## Status

Early development. API is not stable. Breaking changes may occur between minor versions.

## License

MIT
