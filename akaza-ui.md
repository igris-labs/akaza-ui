# Akaza UI

## Vision

Akaza UI is a Vue-native headless UI primitives library built for Vue 3.5+. It prioritizes:

- Vue idiomatic APIs (`v-model`, Composition API, scoped slots)
- Minimal wrapper components and composable behavior
- Accessibility-first (WAI-ARIA built-in)
- Unstyled primitives with CSS customization hooks
- Flat, readable templates (avoid deep React-style nesting)

Akaza UI is not a design system. It is **Vue-native UI infrastructure**.

---

## Core Principles

1. **Vue 3.5+ minimum** — Target Vue 3.5 and above. Use Vue 3.5 APIs where available: `useTemplateRef`, `useId`, `watch` with `once`, `v-bind` shorthand (`{ id }`), `defineModel`, and reactive props destructuring.
2. **Don't fight Vue** — APIs align with Vue's mental model: reactive state, `v-model`, `provide`/`inject`, slots.
3. **Primitives + composables** — Implement behavior in `useX` composables; components are thin wrappers.
4. **Clarity over cleverness** — Fewer abstractions, predictable and readable code.
5. **Accessibility is foundational** — ARIA roles, keyboard behavior, and focus management by default.
6. **Style-agnostic** — Expose semantic class names and `data-*` attributes; no CSS opinion.

---

## API Style

### Standard pattern

```vue
<script setup lang="ts">
import { useDialog } from "@akaza-ui";
const { isOpen, open, close, toggle } = useDialog();
</script>
<template>
  <Dialog v-model="isOpen">
    <template #trigger="{ isOpen }">
      <button @click="toggle">{{ isOpen ? "Hide" : "Show" }}</button>
    </template>
    <template #content="{ close }">
      <h2>Settings</h2>
      <button @click="close">Close</button>
    </template>
  </Dialog>
</template>
```

### Menu example

```vue
<script setup lang="ts">
import { useMenu } from "@akaza-ui";
const { isOpen, toggle } = useMenu();
</script>
<template>
  <Menu v-model="isOpen">
    <template #trigger="{ isOpen }">
      <button @click="toggle">{{ isOpen ? "Close" : "Open" }}</button>
    </template>
    <template #content="{ close }">
      <MenuItem>Profile</MenuItem>
      <MenuItem>Settings</MenuItem>
      <MenuSeparator />
      <MenuItem @click="close">Logout</MenuItem>
    </template>
  </Menu>
</template>
```

### Rules for every primitive

- Composable (`useX`) returns `{ isOpen, open, close, toggle }` plus any component-specific helpers.
- Component accepts `v-model` for state binding.
- All slots receive relevant state and helpers (e.g. `{ close }`, `{ isOpen }`).
- Expose `data-*` state attributes and semantic class names for CSS hooks (e.g. `data-akaza-open`, `akaza-dialog-content`).
- Components are unstyled by default.

---

## Component Roadmap

### Phase 1 — MVP

| Component    | Composable       | Notes                                                                      |
| ------------ | ---------------- | -------------------------------------------------------------------------- |
| Button       | `useButton`      | `disabled`, `focusableWhenDisabled`, `aria-disabled`, `data-disabled`      |
| Separator    | —                | Semantic `<hr>`, `role="separator"`, horizontal/vertical orientation       |
| Avatar       | `useAvatar`      | Image with fallback (initials/icon), `aria-label`                          |
| Tooltip      | `useTooltip`     | trigger + content slots, `role="tooltip"`, id references                   |
| Popover      | `usePopover`     | trigger + content slots, close on outside click / Escape                   |
| Dialog       | `useDialog`      | `role="dialog"`, `aria-modal`, focus trap, teleport to body                |
| Alert Dialog | `useAlertDialog` | Extends Dialog; `role="alertdialog"`, requires explicit confirm/cancel     |
| Drawer       | `useDrawer`      | Side-anchored Dialog variant (top/right/bottom/left), focus trap           |
| Menu         | `useMenu`        | trigger + content slots, `<MenuItem>`, roving focus                        |
| Tabs         | `useTabs`        | `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanels>`, `<TabPanel>`, arrow key nav |

### Phase 2 — Forms & Controls

| Component      | Composable         | Notes                                                                  |
| -------------- | ------------------ | ---------------------------------------------------------------------- |
| Field          | `useField`         | Label + input association, error/description slots, `aria-describedby` |
| Fieldset       | —                  | Groups related fields with `<fieldset>` + `<legend>`                   |
| Form           | `useForm`          | Validation state container, submit handling                            |
| Input          | `useInput`         | Text input, `aria-invalid`, `data-invalid`, integrates with Field      |
| Checkbox       | `useCheckbox`      | `aria-checked`, indeterminate state, `data-checked`                    |
| Checkbox Group | `useCheckboxGroup` | Manages multiple checkboxes, `role="group"`                            |
| Radio          | `useRadio`         | `role="radio"`, `aria-checked`, roving focus within group              |
| Switch         | `useSwitch`        | `role="switch"`, `aria-checked`, `data-checked`                        |
| Select         | `useSelect`        | `role="listbox"`, keyboard nav, `aria-selected`                        |
| Number Field   | `useNumberField`   | Increment/decrement, `role="spinbutton"`, min/max/step                 |
| Slider         | `useSlider`        | `role="slider"`, `aria-valuenow/min/max`, keyboard step                |
| Toggle         | `useToggle`        | Single on/off button, `aria-pressed`, `data-pressed`                   |
| Toggle Group   | `useToggleGroup`   | Single or multiple selection, `role="group"`, roving focus             |
| Meter          | `useMeter`         | `role="meter"`, `aria-valuenow/min/max`, read-only gauge               |
| Progress       | `useProgress`      | `role="progressbar"`, determinate + indeterminate states               |

### Phase 3 — Complex Patterns

| Component       | Composable          | Notes                                                               |
| --------------- | ------------------- | ------------------------------------------------------------------- |
| Accordion       | `useAccordion`      | Single/multiple open items, `role="region"`, arrow key nav          |
| Collapsible     | `useCollapsible`    | Single trigger/content toggle, `aria-expanded`                      |
| Context Menu    | `useContextMenu`    | Right-click triggered Menu, positions at pointer                    |
| Navigation Menu | `useNavigationMenu` | Top-level nav with flyout submenus, `role="navigation"`             |
| Menubar         | `useMenubar`        | Horizontal menu strip, `role="menubar"`, arrow key nav across menus |
| Toolbar         | `useToolbar`        | `role="toolbar"`, roving focus across buttons and controls          |
| Scroll Area     | `useScrollArea`     | Custom scrollbar, keyboard scrollable, cross-browser consistent     |
| Combobox        | `useCombobox`       | Input + listbox, `aria-autocomplete`, `aria-activedescendant`       |
| Autocomplete    | `useAutocomplete`   | Extends Combobox with async suggestion loading                      |
| Preview Card    | `usePreviewCard`    | Hover-triggered rich content card (link previews, user cards)       |
| Toast           | `useToast`          | `role="status"` / `role="alert"`, auto-dismiss, queue management    |

---

## Implementation Steps (per primitive)

1. Create `packages/akaza-ui/src/composables/x/useX.ts` — expose `open`, `close`, `toggle`, and any component-specific helpers.
2. Create `packages/akaza-ui/src/composables/x/index.ts` — export `useX` and any TypeScript types/interfaces used by the composable.
3. Create `packages/akaza-ui/src/components/x/X.vue` — `v-model`, named slots, ARIA, `data-*` attributes.
4. Create `packages/akaza-ui/src/components/x/index.ts` — export `X.vue` and the `XProps` interface (and any sub-component types).
5. Re-export both from `packages/akaza-ui/src/index.ts`.
6. Run `pnpm run build` and verify compile.
7. Add a demo in `playground/src/App.vue`.
8. Add tests for the composable and component.

---

## Accessibility Checklist (per component)

- Correct ARIA role (`dialog`, `menu`, `tooltip`, `listbox`, etc.)
- `aria-expanded` / `aria-controls` where applicable
- Focus management for overlays and dialogs (focus trap on open, restore on close)
- Keyboard controls — see table below
- Disabled state uses `aria-disabled`; optionally keep keyboard focusable

### Keyboard contracts

| Component | Key          | Action                      |
| --------- | ------------ | --------------------------- |
| Dialog    | `Escape`     | Close and restore focus     |
| Menu      | `ArrowDown`  | Move focus to next item     |
| Menu      | `ArrowUp`    | Move focus to previous item |
| Menu      | `Home`       | Focus first item            |
| Menu      | `End`        | Focus last item             |
| Menu      | `Escape`     | Close and restore focus     |
| Tabs      | `ArrowLeft`  | Activate previous tab       |
| Tabs      | `ArrowRight` | Activate next tab           |
| Tooltip   | `Escape`     | Dismiss tooltip             |

---

## DX Decisions

### Composables expose behavior, not just state

`useX` must return `open`, `close`, and `toggle` (plus component-specific helpers). Returning only `isOpen` offers no advantage over `const isOpen = ref(false)`.

### Content slots expose `{ close }`

Callers should never need to hold an external ref just to close from within the content slot:

```vue
<!-- Wrong -->
<template #content>
  <button @click="isOpen = false">Close</button>
</template>

<!-- Right -->
<template #content="{ close }">
  <button @click="close()">Close</button>
</template>
```

### Polymorphic `as` prop

Every primitive accepts an `as` prop to control the rendered element:

```vue
<Button as="a" href="/profile">Profile</Button>
<MenuItem as="router-link" :to="{ name: 'settings' }">Settings</MenuItem>
```

Default values: `Button` → `"button"`, `MenuItem` → `"div"`, etc.

### Transition integration

Overlays accept a `transition` prop and wrap content in Vue's `<Transition>`:

```vue
<Dialog v-model="isOpen" transition="fade" />
<Dialog v-model="isOpen" :transition="false" />
<!-- disable -->
```

### Teleport for overlays

Dialog, Popover, and Tooltip teleport their content to `<body>` by default to avoid stacking context bugs:

```vue
<Dialog v-model="isOpen" />
<!-- teleports to body -->
<Dialog v-model="isOpen" teleport="#modal-root" />
<!-- custom target -->
<Dialog v-model="isOpen" :teleport="false" />
<!-- disable -->
```

---

## Repo Structure

```
packages/
  akaza-ui/
    src/
      components/
        button/
          Button.vue
          index.ts        ← exports Button.vue + ButtonProps interface
        dialog/
          Dialog.vue
          index.ts        ← exports Dialog.vue + DialogProps interface
        menu/
          Menu.vue
          MenuItem.vue
          MenuSeparator.vue
          index.ts        ← exports all sub-components + Props interfaces
        ...              ← one folder per component
      composables/
        button/
          useButton.ts
          index.ts        ← exports useButton + related types
        dialog/
          useDialog.ts
          index.ts        ← exports useDialog + related types
        ...              ← one folder per composable
      index.ts            ← re-exports everything for the public API
playground/              ← local Vite dev app for visual iteration
  src/
    App.vue              ← demos for each primitive
  vite.config.ts
docs/                    ← philosophy, API docs, examples
```

The `playground/` app imports directly from `packages/akaza-ui/src` so changes reflect instantly without a build step.

### Folder index.ts convention

Each component folder's `index.ts` must export:

- The component(s) as named exports
- The `Props` interface as a named export
- Any related sub-types (enums, slot types, emit types)

```ts
// packages/akaza-ui/src/components/dialog/index.ts
export { default as Dialog } from "./Dialog.vue";
export type { DialogProps } from "./Dialog.vue";
```

```ts
// packages/akaza-ui/src/components/menu/index.ts
export { default as Menu } from "./Menu.vue";
export { default as MenuItem } from "./MenuItem.vue";
export { default as MenuSeparator } from "./MenuSeparator.vue";
export type { MenuProps, MenuItemProps } from "./Menu.vue";
```

Each composable folder's `index.ts` must export:

- The composable function
- Any TypeScript types or interfaces it uses

```ts
// packages/akaza-ui/src/composables/dialog/index.ts
export { useDialog } from "./useDialog";
export type { UseDialogReturn } from "./useDialog";
```

---

## VueUse Integration

`@vueuse/core` is a runtime dependency of `akaza-ui`. Use its composables in components where applicable — **do not reimplement what VueUse already provides well.**

### Composables in use

| VueUse composable | Where used | Purpose |
|---|---|---|
| `onClickOutside` | Popover, Menu | Close on click outside the root element |
| `onKeyStroke` | Tooltip, Popover, Dialog, AlertDialog, Drawer, Menu, TabList | Keyboard handling (Escape, Arrow keys) |

### Composables available but not yet used — prefer these over custom implementations

| VueUse composable | When to use |
|---|---|
| `useScrollLock` | Dialog / Drawer — lock body scroll when overlay is open |
| `useFocus` | Programmatic focus management on specific elements |
| `useFocusWithin` | Detect if focus is inside a container (useful for toolbar, menubar) |
| `useElementHover` | Tooltip — reactive hover state (alternative to mouseenter/mouseleave) |
| `useEventListener` | Any component needing a cleaned-up event listener |
| `onLongPress` | Toggle, Button — long press interaction |
| `useActiveElement` | Track the currently focused element (for focus restore) |
| `useResizeObserver` | Popover / Tooltip — reposition on element resize |

### Do NOT reimplement these with custom code

- Outside click detection → use `onClickOutside`
- Keyboard stroke listeners → use `onKeyStroke`
- Event listeners with cleanup → use `useEventListener`

### Composables NOT covered by VueUse

These remain as custom utilities in `src/utils/`:

| Utility | File | Reason |
|---|---|---|
| Focus trap | `src/utils/focusTrap.ts` | VueUse's `useFocusTrap` lives in `@vueuse/integrations` (heavier dep, requires `focus-trap` package) |
| Focusable element query | `src/utils/focusable.ts` | No VueUse equivalent |

---

## Agent Instructions

When implementing a new primitive:

1. Read existing composables and components in `packages/akaza-ui/src` first to understand the established patterns.
2. Write all code targeting **Vue 3.5+**. Use Vue 3.5 APIs: `defineModel` for `v-model`, `useTemplateRef` instead of `ref` for template refs, `useId` for generating unique IDs, reactive props destructuring, and `v-bind` shorthand syntax.
3. Follow the standard composable contract: `{ isOpen, open, close, toggle, ...extras }`.
4. Use `v-model` + named slots; expose `{ close }` and other relevant helpers in content slots.
5. Add ARIA roles, `aria-expanded`, and keyboard handlers per the checklist above.
6. Add `data-akaza-*` state attributes and semantic class names.
7. Keep the component wrapper minimal and unstyled.
8. Place files in the correct folder structure (`components/x/` and `composables/x/`) with an `index.ts` in each folder exporting the component/composable and their TypeScript types.
9. Re-export from the root `packages/akaza-ui/src/index.ts`, build, and add a playground demo.
