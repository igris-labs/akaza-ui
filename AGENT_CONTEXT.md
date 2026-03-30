# Akaza UI Agent Context

## Purpose

This file is a working handoff for future AI agents. Read this first before continuing implementation work in this repo. It captures the full project context, philosophy, completed work, and next steps.

Last updated: 2026-03-22 (session 2)

## Project Goal

Akaza UI is a **Vue-native headless UI library**. The project intentionally avoids a React-shaped API and should not drift toward Radix-style nesting unless there is a very strong reason.

The target is:

- headless primitives (no built-in styles beyond structural CSS)
- Vue-first API design
- `v-model` for state
- named slots instead of deep required sub-component trees
- items-based data-driven APIs for list-like components (Accordion, Menu)
- strong accessibility defaults (WAI-ARIA)
- strong styling hooks through `ui` props, slots, and `data-akaza-*` attributes
- a playground that doubles as exhaustive usage documentation

## Repository Structure

```
packages/
  akaza-ui/               # The library
    src/
      components/         # All components (one folder each)
      composables/        # Per-component composables
      utils/              # Shared utilities (focus, dismiss, etc.)
      types.ts            # Shared types (AkazaChangeEventDetails)
      index.ts            # Main barrel export
    dist/                 # Build output
playground/
  src/
    sections/             # One section per component for demo/docs
    App.vue               # Root playground app
    style.css             # Shared playground styles
```

Monorepo managed by pnpm workspaces. Build via `pnpm --filter akaza-ui run build` (uses Vite + vue-tsc). The playground is a Vite app at the root that imports `akaza-ui` as a workspace dependency.

## Non-Negotiable Product Decisions

These decisions were established across multiple sessions and should be treated as settled unless the user explicitly changes them.

### 1. Prefer Vue-native slots over React-like nesting

The user does **not** want the library to feel like "Radix but in Vue".

Prefer:

- one root component such as `Dialog`, `Menu`, `Accordion`
- named slots like `trigger`, `header`, `title`, `body`, `footer`, `content`
- scoped slot props like `isOpen`, `toggle`, `close`, item state, etc.
- items-based API (array of objects) for data-driven components

Avoid pushing users into large trees of required sub-components. When internal sub-components are needed for recursion or implementation (e.g. `MenuPanel.vue`), they must NOT be exported. Only the root component is the public API.

### 2. Keep `v-model` as the canonical state API

Open/close, selected value, pressed state, checked state, and similar state should remain aligned with Vue conventions. Use `v-model`, clear props, and events that map naturally to Vue usage.

### 3. Composables must provide behavior, not just refs

If a composable exists, it should expose meaningful behavior like `open`, `close`, `toggle`, imperative helpers, and coordination logic. A composable that only returns a plain ref is considered weak DX.

### 4. Slots and convenience props can coexist

The approved pattern is:

- slot overrides convenience prop
- convenience prop auto-renders when no slot is provided
- if neither exists, render nothing

Used for `title` and `description` in overlay-style components (Dialog, AlertDialog, Drawer).

### 5. Shared utilities must stay generic

Keep utilities like focus, dismissal, outside click, and overlay helpers generic and reusable. Do not hardcode component-specific behavior into shared utils. Component-specific behavior goes in the component itself or via an options parameter.

### 6. Playground updates are part of the task

When a component is updated, the playground must also be updated with exhaustive examples demonstrating the full API surface. The playground is not optional polish. It is part of the implementation contract.

## Established Component Review Workflow

This is the expected workflow when the user says "next component" or asks for a component review:

1. Check parity with **Reka UI** (behavior, accessibility, keyboard, features).
2. Review **Nuxt UI** for DX ideas worth adopting (data-driven APIs, convenience).
3. Review **Base UI** for DX patterns (event details, data attributes, anchor/positioning).
4. Filter ideas through Akaza UI's headless Vue-native philosophy.
5. Implement approved changes.
6. Apply the **Base UI DX pass** (AkazaChangeEventDetails pattern — see below).
7. Update the playground with exhaustive examples.

## External Reference Policy

Three external libraries shape the design:

### Reka UI

Primary behavior/accessibility parity reference. Good for: feature parity, keyboard behavior, accessibility contracts, structural completeness.

### Nuxt UI

Source of DX ideas, especially around data-driven APIs (items-based), convenience props, and grouping patterns. Only adopt ideas that fit a headless library.

### Base UI (React)

Advanced DX patterns. The most important concepts adopted:

- `AkazaChangeEventDetails` — rich change-event metadata with `reason`, `event`, and `cancel()`
- `data-akaza-highlighted` — styling hook for keyboard-focused items
- Anchor/positioning props (`side`, `align`, `sideOffset`)
- `triggerProps` scoped slot prop for ARIA attributes on trigger elements

## The Base UI DX Pass (AkazaChangeEventDetails)

A cross-component pattern was applied to give consumers rich event metadata and the ability to cancel state changes. This is defined in `packages/akaza-ui/src/types.ts`:

```ts
export interface AkazaChangeEventDetails {
  reason: string; // Why the change was triggered (component-specific)
  event?: Event; // The originating DOM event, if any
  cancel: () => void; // Call to prevent the state change
}
```

### Pattern implementation

Each component that has state changes:

1. Imports `AkazaChangeEventDetails` from `../../types`
2. Defines emits with the details as the second argument
3. Aliases composable methods (e.g. `open: _open, close: _close`)
4. Wraps them in a `handleChange` function that emits the event with details, checks if `cancel()` was called, and only applies the state change if not canceled
5. Exposes the wrapper functions (not the raw composable methods)

### Components with the DX pass applied

| Component   | Event                                                       | Reasons                                                        | Status      |
| ----------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| Accordion   | `@value-change`                                             | `trigger`                                                      | Committed   |
| AlertDialog | `@open-change`                                              | `programmatic`                                                 | Committed   |
| Checkbox    | `@value-change`                                             | `click`, `keyboard`                                            | Committed   |
| Collapsible | `@open-change`                                              | `trigger`, `programmatic`                                      | Committed   |
| Dialog      | `@open-change`                                              | `backdrop-click`, `escape`, `programmatic`                     | Committed   |
| Drawer      | `@open-change`                                              | `backdrop-click`, `escape`, `swipe`, `programmatic`            | Committed   |
| Menu        | `@open-change`, `@select`, `@check-change`, `@radio-change` | `trigger`, `escape`, `outside-click`, `select`, `programmatic` | Committed   |
| Popover     | `@open-change`                                              | `outside-click`, `escape`, `programmatic`                      | Uncommitted |

### Components NOT yet updated with the DX pass

- Button (low priority — only emits `click` which already has MouseEvent)
- Avatar (no state events — presentational)
- Progress (no state change events needed — purely presentational output)
- RadioGroup (no `value-change` event yet — needs DX pass)
- Tabs (no `tab-change` event yet — needs DX pass)
- Tooltip, Toggle, Separator

### Shared infrastructure updated

- `packages/akaza-ui/src/utils/dismissableLayer.ts` — updated to pass `KeyboardEvent` through the dismiss callback, so components can report `escape` as a reason
- `packages/akaza-ui/src/types.ts` — the `AkazaChangeEventDetails` interface, exported from the package root

## All Components — Current State

### Fully reviewed and committed

| Component       | API Style                                                  | Key Features                                                                                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accordion**   | Items-based (`AccordionItem[]`)                            | `type` (single/multiple), `collapsible`, `orientation`, `unmountOnHide`, per-item `disabled`, per-item named slots via `item.slot`, keyboard nav (arrows, Home, End), `ui` prop, `@value-change` with details                                                           |
| **AlertDialog** | Slots + convenience props                                  | `title`/`description` props + slots, focus-on-open prefers `[data-akaza-cancel]`, NO backdrop/escape close (WAI-ARIA), `@open-change` with details                                                                                                                      |
| **Avatar**      | Sub-components (`Avatar`, `AvatarImage`, `AvatarFallback`) | Image loading states, fallback text, `ui` prop                                                                                                                                                                                                                          |
| **Button**      | Single component                                           | `as` polymorphism, `type` prop, `loadingAuto` for async, `disabled`, `ui` prop                                                                                                                                                                                          |
| **Checkbox**    | Single component                                           | Tri-state (`true`/`false`/`"indeterminate"`), `trueValue`/`falseValue`, `label`/`description` props + slots, form submission (`name`/`required`), `ui` prop, `@value-change` with details                                                                               |
| **Collapsible** | Single component                                           | `v-model` open state, `disabled`, `unmountOnHide`, CSS grid animation, `#trigger`/`#icon`/`#content` slots, `ui` prop, programmatic `open()`/`close()`/`toggle()`, `@open-change` with details                                                                          |
| **Dialog**      | Slots + convenience props                                  | `title`/`description` props + slots, `#header`/`#body`/`#footer` slots, `fullscreen`, `closeOnBackdropClick`, `teleport`, `transition`/`duration`, nested dialog support, focus trap, `@open-change` with details (reasons: `backdrop-click`, `escape`, `programmatic`) |
| **Drawer**      | Slots + convenience props                                  | Same slot API as Dialog, `side` (top/right/bottom/left), `inset`, `swipeToClose`, JS transition hooks for swipe, CSS variables for swipe progress, `@open-change` with details (reasons: `backdrop-click`, `escape`, `swipe`, `programmatic`)                           |
| **Menu**        | Items-based (`MenuItem[]` or `MenuItem[][]` for groups)    | See Menu section below                                                                                                                                                                                                                                                  |

### Reviewed and updated (uncommitted)

| Component      | API Style                              | Key Features                                                                                                                                                                                                                                    |
| -------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Popover**    | Slots (`#trigger`, `#content`)         | `side`/`align`/`sideOffset` positioning, auto-flip, scroll/resize tracking, `triggerProps` (ARIA) in trigger slot, `@open-change` with details, `data-akaza-side`/`data-akaza-align` on content, 9-demo playground                             |
| **Progress**   | Single component                       | `min`/`max` with correct range percentage, `orientation`, `ariaLabel`, `getValueLabel` (aria-valuetext), `--akaza-progress-percentage` CSS variable, `data-akaza-state` (loading/complete/indeterminate), `#indicator` slot, 8-demo playground  |
| **RadioGroup** | Items-based (`options: any[]`)         | Roving tabindex, arrow key nav with `loop`, Home/End, per-item disabled (`getItemDisabled` + `option.disabled`), `legend` prop/slot, `labelKey`/`descriptionKey`, `ariaLabel`/`ariaLabelledby`, `name`/`required` form integration, 7-demo playground |
| **Switch**     | Single component (Checkbox pattern)    | `trueValue`/`falseValue`, `label`/`description` props + `#label`/`#description` slots, `id`/`name`/`required` form integration, `ariaLabel`, `@value-change` with details, wrapper `<span>` root, hidden checkbox input, 7-demo playground      |
| **Tabs**       | Items-based (`items: TabsItem[]`)      | See Tabs section below                                                                                                                                                                                                                          |

### Not yet reviewed (pending component review sprint)

| Component  | Current State            | Notes                                       |
| ---------- | ------------------------ | ------------------------------------------- |
| Tooltip    | Basic implementation     | Needs parity check, DX pass                 |
| Toggle     | Basic implementation     | Needs parity check, DX pass                 |
| Separator  | Basic implementation     | Simple, may not need much review            |
| Overlay    | Infrastructure component | Provider pattern for overlays — reviewed, committed |

## Menu — Detailed Context

The Menu component was completely rewritten from a Radix-style sub-component approach (`MenuItem`, `MenuSeparator`) to an items-based data-driven API.

### Architecture

```
Menu.vue              # Root component — trigger, positioning, dismiss, provides context
  MenuPanel.vue       # Internal recursive renderer — NOT exported
  context.ts          # Injection key + MenuContext type
  index.ts            # Public exports: Menu component + types
```

### Key design decisions

1. **Items-based API** — `items` prop accepts `MenuItem[]` (flat) or `MenuItem[][]` (grouped with auto-separators between groups)
2. **Item types** — `'item'` (default), `'checkbox'`, `'radio'`, `'separator'`, `'label'`, or items with `children` (submenu)
3. **Recursive submenus** — `MenuPanel.vue` uses `defineOptions({ name: 'MenuPanel' })` for Vue self-reference, enabling infinite nesting depth
4. **Slot forwarding** — Root `Menu`'s slots are provided via inject and rendered in recursive panels using `<component :is="() => ctx.rootSlots[name](props)" />`
5. **Per-level state** — Each `MenuPanel` instance manages its own `activeSubmenu` ref, so nested submenus operate independently
6. **Anchor positioning** — `side` (top/bottom/left/right), `align` (start/center/end), `sideOffset` (px gap) — CSS-based positioning relative to the trigger
7. **Keyboard boundary** — `onContentKeydown` on the content wrapper calls `stopPropagation()` for all nav keys to prevent leaking to the rest of the page

### MenuItem interface

```ts
interface MenuItem {
  label?: string;
  value?: string;
  type?: "item" | "checkbox" | "radio" | "separator" | "label";
  disabled?: boolean;
  checked?: boolean; // checkbox items
  onUpdateChecked?: (checked: boolean) => void; // checkbox callback
  radioGroup?: string; // radio items — group name
  children?: MenuItem[] | MenuItem[][]; // submenu
  slot?: string; // per-item named slot
  onSelect?: () => void; // per-item action callback
  [key: string]: unknown; // extensible
}
```

### Events

| Event                 | Payload                    | Description                                   |
| --------------------- | -------------------------- | --------------------------------------------- |
| `@open-change`        | `(open, details)`          | Menu open/close with reason                   |
| `@select`             | `(item, details)`          | Action item selected (includes submenu items) |
| `@check-change`       | `(item, checked, details)` | Checkbox toggled                              |
| `@radio-change`       | `(group, value, details)`  | Radio selection changed                       |
| `@update:radioValues` | `(values)`                 | For two-way binding of radio state            |

### Scoped slot props on `#trigger`

```ts
{ isOpen, open, close, toggle, triggerProps }
```

`triggerProps` contains `aria-haspopup`, `aria-expanded`, `aria-controls` — use `v-bind="triggerProps"` on the trigger element.

### Keyboard navigation

- **ArrowDown/ArrowUp** — move between items (wraps)
- **Home/End** — jump to first/last item
- **ArrowRight** — open submenu, focus first submenu item
- **ArrowLeft** — close submenu, return focus to parent trigger
- **Escape** — close submenu (if in one) or close entire menu
- **Enter/Space** — select item
- **Typeahead** — type characters to jump to matching item (500ms buffer)

### Focus management

- Auto-focus first item on menu open
- `data-akaza-highlighted` attribute set on the currently focused item
- Items filtered by `closest('[role="menu"]')` to avoid reaching into nested submenu panels
- Submenu focus: ArrowRight on a submenu trigger opens the submenu and focuses its first `> [role="menu"]` child's first item

### Old sub-components removed

`MenuItem.vue` and `MenuSeparator.vue` were deleted. They are no longer exported from the package.

### Playground

11 exhaustive demos: basic, groups, disabled, checkbox, radio, submenus, deep nested (4 levels), mixed, anchor positioning, custom #item slot, @open-change + @select event details.

## Popover — Detailed Context

### Positioning strategy

Uses `position: fixed` with JS-computed coordinates (viewport-relative). This enables auto-flip (tries preferred side, falls back if no room) and scroll tracking. Coordinates are recomputed via `requestAnimationFrame` on open (to ensure layout is complete) and via `scroll`/`resize` listeners while open.

**Critical implementation note:** For `side = "top"` and `side = "left"`, the main-axis coordinate depends on `c.height` / `c.width` respectively. These must be measured AFTER browser layout is complete. Using `nextTick()` alone is insufficient — the content may not have been painted yet. Always use `requestAnimationFrame(computePosition)` after `nextTick` to ensure correct gap.

### Props

| Prop         | Type                                | Default       | Description                              |
| ------------ | ----------------------------------- | ------------- | ---------------------------------------- |
| `side`       | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Preferred side, auto-flips if no room |
| `align`      | `'start' \| 'center' \| 'end'`     | `'start'`     | Cross-axis alignment                     |
| `sideOffset` | `number`                            | `6`           | Gap in px between trigger and content    |
| `teleport`   | `string \| false`                   | `'body'`      | Teleport target                          |
| `transition` | `string \| false`                   | `'akaza-popover'` | Transition name or false to disable  |
| `ui`         | `{ content?: string }`              | —             | Class overrides                          |

### Events

| Event          | Payload              | Reasons                                      |
| -------------- | -------------------- | -------------------------------------------- |
| `@open-change` | `(open, details)`    | `outside-click`, `escape`, `programmatic`    |

### Trigger slot props

```ts
{ isOpen, open, close, toggle, triggerProps }
```

`triggerProps`: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.

### Playground

9 demos: basic, controlled (v-model), alignment, side, sideOffset, triggerProps/ARIA, @open-change events, cancelable close, custom/no transition.

## Cross-Cutting Infrastructure

### Shared utilities

| File                        | Purpose                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `utils/focusScope.ts`       | Trap/release focus within a container (used by Dialog, AlertDialog, Drawer)                    |
| `utils/focusable.ts`        | Query focusable elements                                                                       |
| `utils/dismissableLayer.ts` | Escape key stack for nested overlays — passes `KeyboardEvent` to callback for reason reporting |

### Shared types

| File       | Exports                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| `types.ts` | `AkazaChangeEventDetails` — the cross-component event details interface |

### Known pre-existing issues

- `packages/akaza-ui/src/components/overlay/OverlayProvider.vue` has two TypeScript errors (`Parameter 'val' implicitly has an 'any' type` on lines 34 and 38). These are pre-existing and unrelated to current work. They cause `vue-tsc --noEmit` strict mode to fail, but the Vite build succeeds.

## Playground Details

Each component has its own section file at `playground/src/sections/<component>/<Component>Section.vue`. Sections follow a consistent pattern:

- Demo blocks with label (title + description) and canvas
- CSS classes scoped by prefix (e.g. `mn-` for menu, `dlg-` for dialog, `po-` for popover)
- Each demo demonstrates one API feature
- Event detail demos show a log of recent events with reason

The playground app at `playground/src/App.vue` imports all sections.

## Tabs — Detailed Context

### Architecture

The old sub-component approach (`Tab.vue`, `TabList.vue`, `TabPanel.vue`, `TabPanels.vue`, `context.ts`) was deleted and replaced with a single `Tabs.vue`. This was an explicit user-directed change — the sub-component tree violated Akaza's no-subcomponent philosophy.

### Public API

```vue
<Tabs v-model="active" :items="items" aria-label="Label">
  <!-- optional: customize each tab trigger -->
  <template #tab="{ item, isActive, select }">...</template>

  <!-- panel content keyed by item value — dynamic slot names -->
  <template #panel-overview>...</template>
  <template #panel-settings>...</template>
</Tabs>
```

### Props

| Prop             | Type                          | Default         | Description                                                              |
| ---------------- | ----------------------------- | --------------- | ------------------------------------------------------------------------ |
| `items`          | `TabsItem[]`                  | required        | Defines tabs. Each item: `{ value, label?, disabled? }`                  |
| `orientation`    | `"horizontal" \| "vertical"` | `"horizontal"`  |                                                                          |
| `activationMode` | `"automatic" \| "manual"`    | `"automatic"`   | automatic: arrow keys activate. manual: arrow keys focus only            |
| `unmountOnHide`  | `boolean`                     | `false`         | `true` uses `v-if` (unmount inactive). `false` uses `v-show`             |
| `ariaLabel`      | `string`                      | —               | `aria-label` on the tab list element                                     |
| `labelKey`       | `string`                      | `"label"`       | Field to use as label from item objects                                  |
| `ui`             | `TabsUi`                      | —               | `{ root, list, tab, indicator, panels, panel }`                          |

### Slots

- `#tab="{ item, isActive, select }"` — custom tab trigger. Default renders `getLabel(item)`.
- `#panel-{value}="{ item, isActive }"` — panel content. One slot per item value.

### Keyboard navigation

- Arrow keys (horizontal: Left/Right, vertical: Up/Down) with wrap
- Home/End
- In `automatic` mode: arrow keys change active tab + move focus
- In `manual` mode: arrow keys move focus only; Space/Enter activates

### Sliding indicator

The `akaza-tab-indicator` is absolutely positioned inside the tab list. Its `left`/`width` (horizontal) or `top`/`height` (vertical) are computed from the active tab element's `getBoundingClientRect()` relative to the list. Updated on `model` change (via `watch`) and on mount. Consumers style it via `--akaza-tab-indicator-color` CSS variable on the list.

For pill-style tabs: re-enable the indicator, style it as a rounded background, give it `z-index: 0` and buttons `z-index: 1` — the indicator becomes the sliding pill background.

### Playground

6 demos: basic underline, custom `#tab` slot pill style (with sliding indicator), vertical orientation, disabled tab, manual activation mode, `unmountOnHide` with mount counter.

### Files deleted

`Tab.vue`, `TabList.vue`, `TabPanel.vue`, `TabPanels.vue`, `context.ts` — removed. The `useTabs` composable at `composables/tabs/useTabs.ts` was kept (standalone utility, still useful).

## Uncommitted Work

As of 2026-03-22 (session 2):

**Popover review:**
- `packages/akaza-ui/src/components/popover/Popover.vue`
- `packages/akaza-ui/src/components/popover/index.ts`
- `playground/src/sections/popover/PopoverSection.vue`

**Progress review:**
- `packages/akaza-ui/src/components/progress/Progress.vue`
- `packages/akaza-ui/src/components/progress/index.ts`
- `playground/src/sections/progress/ProgressSection.vue`

**RadioGroup review:**
- `packages/akaza-ui/src/components/radio-group/RadioGroup.vue`
- `packages/akaza-ui/src/components/radio-group/index.ts`
- `playground/src/sections/radio-group/RadioGroupSection.vue`

**Switch review:**
- `packages/akaza-ui/src/components/switch/Switch.vue`
- `packages/akaza-ui/src/components/switch/index.ts`
- `playground/src/sections/switch/SwitchSection.vue`

**Tabs rewrite:**
- `packages/akaza-ui/src/components/tabs/Tabs.vue` — full rewrite
- `packages/akaza-ui/src/components/tabs/index.ts` — new types
- `playground/src/sections/tabs/TabsSection.vue` — full rewrite
- Deleted: `Tab.vue`, `TabList.vue`, `TabPanel.vue`, `TabPanels.vue`, `context.ts`

## Next Steps

The remaining unreviewed components are:

- Tooltip
- Toggle
- Separator

For each, follow the established review workflow:

1. Read current implementation
2. Check Reka UI parity
3. Query Nuxt UI via context7 MCP (`/context nuxt-ui-mcp`)
4. Review Base UI
5. Present analysis to user
6. Implement after approval
7. Apply AkazaChangeEventDetails pattern where applicable
8. Update playground

## What Not To Do

- Do not redesign the project around sub-components unless explicitly asked.
- Do not treat Nuxt UI as a direct blueprint for styling or design-system behavior.
- Do not add shared-utils behavior that really belongs in a specific component.
- Do not update components without also updating playground examples.
- Do not remove convenience props like `title`/`description` where they were already agreed and implemented.
- Do not introduce backwards-compatibility hacks — if something is unused, delete it.
- Do not add error handling, fallbacks, or validation for scenarios that can't happen.
- Do not over-engineer. Keep solutions simple and focused on what was asked.
