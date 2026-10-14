# Akaza UI

Vue-native headless UI primitives — accessible, unstyled, composable.

> **Status:** Early development. API is not stable.

## Philosophy

Built for Vue 3, not adapted from React. Every primitive uses `v-model`, named scoped slots, and `useX` composables as first-class APIs - no sub-component trees, no `asChild`.

- **Slot-based** - `#trigger`, `#header`, `#body`, `#footer` slots keep templates flat
- **`ui` prop** - inject CSS classes per structural part (`ui.overlay`, `ui.content`)
- **Accessible** - WAI-ARIA roles, keyboard navigation, focus management, and mouse/touch interaction
- **Unstyled** - `data-akaza-*` attributes and semantic class hooks; no style opinion

## Requirements

- Vue `>=3.5.0`

## Installation

```sh
pnpm add akaza-ui
# or
npm install akaza-ui
```

## Setup

### Vue

Import component styles once in your app entry point:

```ts
// main.ts
import "akaza-ui/dist/akaza-ui.css";
```

**If you use Tailwind CSS**, put the Akaza import in your CSS entry instead of `main.ts`. Declare `akaza-reset` first so utility classes take precedence, then import Tailwind followed by Akaza:

```css
/* main.css */
@layer akaza-reset;
@import "tailwindcss";
@import "akaza-ui/dist/akaza-ui.css";
```

### Nuxt

Add the Nuxt module — it auto-registers all components and injects CSS:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["akaza-ui/nuxt"],
});
```

No manual CSS import or component registration needed.

## Components

`AppLayout` provides a flat application shell with optional header, left, content, right, and footer slots. Compose `Sidebar` for responsive navigation. A readable `layout` object controls spans and overlay sides; `scroll` selects content or page scrolling. Try the layout builder in the component docs for complete examples.

`Accordion` · `AlertDialog` · `AppLayout` · `Avatar` · `Button` · `Calendar` · `Checkbox` · `CheckboxGroup` · `Collapsible` · `Combobox` · `ContextMenu` · `DataTable` · `DateField` · `DateRangeField` · `DateRangePicker` · `Dialog` · `Drawer` · `Editable` · `Field` · `Fieldset` · `Form` · `HoverPreviewCard` · `Input` · `Listbox` · `Menu` · `Menubar` · `Meter` · `NavigationMenu` · `NumberField` · `OverlayProvider` · `Pagination` · `PinInput` · `Popover` · `Progress` · `RadioGroup` · `Rating` · `Select` · `Separator` · `Sidebar` · `Slider` · `Stepper` · `Switch` · `Tabs` · `TagsInput` · `Toast` · `Toggle` · `ToggleGroup` · `Toolbar` · `Tooltip` · `Tree`

## Usage

```vue
<script setup lang="ts">
import { Dialog } from "akaza-ui";
</script>

<template>
  <Dialog
    :ui="{
      overlay: 'fixed inset-0 bg-black/50',
      content:
        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md',
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
[data-akaza-invalid] { … }
[data-akaza-side="bottom"] { … }
```

## License

MIT
