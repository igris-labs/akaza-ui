<p align="center">
  <a href="https://github.com/igris-labs/akaza-ui">
    <img src="./logo.png" alt="Logo" width="150" />
  </a>
</p>
<h1 align="center">
  Akaza UI
</h1>
<p align="center">
  <b>Vue-native headless UI primitives — accessible, unstyled, and built for Vue.</b>
  <br>
</p>

<p align="center">
  <a href="https://github.com/igris-labs/akaza-ui/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/igris-labs/akaza-ui?style=social">
  </a>
  <a href="https://github.com/igris-labs/akaza-ui/blob/main/LICENSE.md">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>

# Akaza UI

Unlike libraries ported from React (Radix, Reka), Akaza UI is designed from scratch for Vue 3. It uses `v-model`, named scoped slots, and the `ui` prop as first-class primitives — no sub-component trees, no `asChild`, no fighting the framework.

## Why Akaza UI?

| Others                                                                    | Akaza UI                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `<DialogRoot><DialogTrigger><DialogPortal><DialogOverlay><DialogContent>` | `<Dialog v-model="isOpen">` with named slots                    |
| React-adapted DX                                                          | Vue-native: `v-model`, scoped slots, `inject/provide`           |
| Styled or opinionated defaults                                            | Fully unstyled — `data-akaza-*` attributes and class hooks only |

## Core Philosophy

- **Slot-based, not sub-component-based** — named scoped slots (`#trigger`, `#header`, `#body`, `#footer`) keep templates flat and readable
- **`v-model`-native** — all stateful components bind via standard `v-model`
- **`ui` prop for structural styling** — pass class strings per part (`ui.overlay`, `ui.content`, `ui.header`…) instead of wrapping sub-components
- **Items-based API for lists** — `RadioGroup`, `Menu`, `Tabs` accept an `items` array; per-item rendering uses named slots, not sub-components
- **Accessible by default** — WAI-ARIA roles, keyboard navigation, and focus management built in

## Installation

```sh
pnpm add akaza-ui
# or
npm install akaza-ui
```

### Vue

Import the CSS in your app entry point:

```ts
// main.ts
import 'akaza-ui/dist/akaza-ui.css'
```

**If you use Tailwind CSS**, declare the `akaza-reset` layer before Tailwind so utility classes can override component base styles:

```css
/* main.css */
@layer akaza-reset;
@import "tailwindcss";
```

### Nuxt

Use the built-in Nuxt module — it registers all components as auto-imports and injects the CSS automatically:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['akaza-ui/nuxt'],
})
```

No manual CSS import or component registration needed.

## Components

| Component     | Description                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| `Button`      | Accessible button with `disabled`, `loading`, `focusableWhenDisabled`, and `as` |
| `Toggle`      | On/off button with `aria-pressed`                                               |
| `Switch`      | Binary toggle with WAI-ARIA switch role                                         |
| `Checkbox`    | Tri-state checkbox (`true`, `false`, `'indeterminate'`)                         |
| `RadioGroup`  | Accessible radio group with roving tabindex and custom item rendering           |
| `Progress`    | Progressbar with indeterminate support                                          |
| `Avatar`      | Image with fallback slot on load error                                          |
| `Separator`   | Horizontal or vertical divider, decorative or semantic                          |
| `Collapsible` | Single show/hide region with animated height                                    |
| `Accordion`   | Single or multi-open collapsible item list                                      |
| `Tooltip`     | Hover tooltip with auto-positioning and delay                                   |
| `Popover`     | Click-triggered floating panel with auto-positioning                            |
| `Dialog`      | Modal dialog with focus trap, Escape, backdrop                                  |
| `AlertDialog` | Confirmation dialog (no Escape/backdrop close per WAI-ARIA)                     |
| `Drawer`      | Side panel with slide-in animation (`top`, `right`, `bottom`, `left`)           |
| `Menu`        | Dropdown menu with items-based API, submenus, checkbox/radio items              |
| `Tabs`        | Accessible tab set with animated indicator, items-based API                     |

## Usage

### Dialog

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "akaza-ui";

const isOpen = ref(false);
</script>

<template>
  <Dialog
    v-model="isOpen"
    :ui="{
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
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

### Menu

```vue
<script setup lang="ts">
import { Menu } from "akaza-ui";

const items = [
  { label: "Profile", onSelect: () => {} },
  { label: "Settings", onSelect: () => {} },
  { type: "separator" },
  { label: "Sign out", onSelect: () => {} },
];
</script>

<template>
  <Menu :items="items">
    <template #trigger="{ toggle }">
      <button @click="toggle">Options</button>
    </template>
  </Menu>
</template>
```

### Tabs

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "akaza-ui";

const activeTab = ref("overview");
const items = [
  { value: "overview", label: "Overview" },
  { value: "settings", label: "Settings" },
];
</script>

<template>
  <Tabs v-model="activeTab" :items="items" aria-label="Main navigation">
    <template #panel-overview>Overview content</template>
    <template #panel-settings>Settings content</template>
  </Tabs>
</template>
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
- `@vueuse/core` (peer dependency)

## Repo Structure

```
packages/
  akaza-ui/       — publishable library (akaza-ui on npm)
    src/
      components/  — Vue component primitives
      composables/ — internal + public composables (useOverlay)
      utils/       — focusTrap, focusable helpers
docs/             — documentation site (Nuxt + Nuxt UI)
```

## Status

Early development. API is not stable. Breaking changes may occur between minor versions.

## License

MIT
