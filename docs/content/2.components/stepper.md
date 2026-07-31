---
title: Stepper
description: Multi-step progress and navigation with linear rules, roving focus, and associated panels.
navigation:
  icon: i-lucide-list-ordered
  badge:
    label: NEW
    color: success
---

`Stepper` represents progress through a multi-step process. It renders an accessible ordered list, connects each trigger to a panel, supports linear or free navigation, and exposes controls and state without requiring nested part components.

Use it for onboarding, checkout, setup, and other bounded workflows. Stepper coordinates navigation; application code still owns validation and persistence for each step.

## Anatomy

- **`#item`**: Replaces one generated trigger body. Per-item named slots are supported through `item.slot`.
- **`#indicator`**: Step number or status visual.
- **`#title`**: Accessible step title.
- **`#description`**: Optional accessible step description.
- **`#optional`**: Optional-step label.
- **`#separator`**: Connector between adjacent steps.
- **`#panel`**: Shared panel content for each item.
- **`#panel-[value]`**: Value-specific panel content.
- **`#previous`**: Previous control content when `showControls` is enabled.
- **`#next`**: Next control content when `showControls` is enabled.
- **`#state`**: Optional renderless current-step state and navigation actions.

Titles, descriptions, triggers, and panels receive unique SSR-safe ids. Keep title content meaningful because it labels the generated trigger and panel.

## Usage

::component-preview
  :::examples-stepper-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Stepper } from "akaza-ui";
import { ref } from "vue";

const step = ref(1);
const items = [
  { value: 1, title: "Account", content: "Account details" },
  { value: 2, title: "Workspace", content: "Workspace settings" },
  { value: 3, title: "Review", content: "Review request" },
];
</script>

<template>
  <Stepper v-model="step" :items="items" show-controls />
</template>
```
::

## Examples

### Linear flow

Linear mode is enabled by default. Users can revisit completed steps or advance one step, but cannot skip unfinished steps.

```vue
<template>
  <Stepper v-model="step" :items="items" linear />
</template>
```

### Non-linear flow

Disable `linear` when every enabled step can be opened directly.

```vue
<template>
  <Stepper v-model="step" :items="items" :linear="false" />
</template>
```

### Vertical orientation

Vertical orientation switches arrow navigation to Up and Down and exposes matching orientation data attributes.

```vue
<template>
  <Stepper v-model="step" :items="items" orientation="vertical" />
</template>
```

### Completed, optional, and disabled items

Item metadata can override derived completion or block a step. Disabled steps are skipped by roving focus.

```vue
<script setup lang="ts">
const items = [
  { value: "account", title: "Account", completed: true },
  { value: "profile", title: "Profile", optional: true },
  { value: "billing", title: "Billing", disabled: true },
];
</script>

<template>
  <Stepper v-model="step" :items="items" :linear="false" />
</template>
```

### Application validation

Cancel a proposed step change until application validation passes. Akaza does not hide workflow validation inside the visual primitive.

```vue
<template>
  <Stepper
    v-model="step"
    :items="items"
    @value-change="(_value, details) => {
      if (!currentStepIsValid) details.cancel()
    }"
  />
</template>
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `string \| number \| undefined` | first enabled item | Active item value. |

### Item shape

| Key | Type | Description |
|-----|------|-------------|
| `value` | `string \| number` | Stable step value. Falls back to one-based index. |
| `title` | `string` | Accessible title. |
| `description` | `string` | Optional accessible description. |
| `content` | `string` | Default panel content. |
| `disabled` | `boolean` | Blocks trigger and navigation. |
| `completed` | `boolean` | Overrides derived completion. |
| `optional` | `boolean` | Marks the step optional. |
| `slot` | `string` | Named slot used instead of `#item`. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StepperItem[]` | required | Step data. |
| `valueKey` | `string` | `"value"` | Custom item value key. |
| `titleKey` | `string` | `"title"` | Custom title key. |
| `descriptionKey` | `string` | `"description"` | Custom description key. |
| `disabledKey` | `string` | `"disabled"` | Custom disabled key. |
| `completedKey` | `string` | `"completed"` | Custom completed key. |
| `linear` | `boolean` | `true` | Requires ordered progression. |
| `disabled` | `boolean` | `false` | Disables all step triggers. |
| `loop` | `boolean` | `false` | Loops roving keyboard focus. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout and arrow-key axis. |
| `activationMode` | `"manual" \| "automatic"` | `"manual"` | Whether arrow focus also changes active step. |
| `showControls` | `boolean` | `false` | Renders generated previous/next buttons. |
| `unmountOnHide` | `boolean` | `false` | Unmounts inactive panels instead of hiding them. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Horizontal keyboard direction. |
| `ariaLabel` | `string` | `"Progress steps"` | Accessible ordered-list label. |
| `ui` | `StepperUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Fired after an accepted step change. |
| `value-change` | `(value, details)` | Fired before step activation. `details.cancel()` prevents it. |
| `complete` | `(value, details)` | Fired when the final item becomes active. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` / item `slot` | `item`, `index`, `value`, `state`, `isActive`, `isCompleted`, `isDisabled`, `select` | Entire trigger body. |
| `indicator` | `item`, `index`, `state` | Generated indicator content. |
| `title` | `item`, `index` | Accessible title content. |
| `description` | `item`, `index` | Accessible description content. |
| `optional` | `item`, `index` | Optional label content. |
| `separator` | `item`, `index`, `isCompleted` | Connector content. |
| `panel` | `item`, `index`, `value` | Shared panel content. |
| `panel-[value]` | `item`, `index`, `value`, `isActive` | Value-specific panel content. |
| `previous` | `disabled`, `previous` | Previous button content. |
| `next` | `disabled`, `next` | Next button content. |
| `state` | current state and all navigation methods | Optional state-driven custom controls. |

### Methods

| Method | Description |
|--------|-------------|
| `goToStep(value, event?)` | Activates a permitted step. |
| `nextStep(event?)` | Activates the next permitted step. |
| `prevStep(event?)` | Activates the previous permitted step. |
| `hasNext()` | Returns whether a next permitted step exists. |
| `hasPrev()` | Returns whether a previous permitted step exists. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root wrapper. |
| `list` | Ordered step list. |
| `item` | Step list item. |
| `trigger` | Step button. |
| `indicator` | Number/status wrapper. |
| `text` | Title/description wrapper. |
| `title` | Step title. |
| `description` | Step description. |
| `optional` | Optional label. |
| `separator` | Connector. |
| `panels` | Panels wrapper. |
| `panel` | One associated panel. |
| `controls` | Generated controls wrapper. |
| `previous` | Previous button. |
| `next` | Next button. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-stepper` | `data-akaza-state="empty|active|complete"`, `data-akaza-orientation`, `data-akaza-linear`, `data-akaza-disabled` |
| `list` | `akaza-stepper-list` | `data-akaza-orientation` |
| `item` | `akaza-stepper-item` | `data-akaza-state="active|completed|inactive"`, `data-akaza-disabled`, `data-akaza-optional` |
| `trigger` | `akaza-stepper-trigger` | item state and disabled attrs, native `aria-current` |
| `indicator` | `akaza-stepper-indicator` | inherited through parent state selectors |
| `text` | `akaza-stepper-text` | inherited through parent state selectors |
| `title` | `akaza-stepper-title` | — |
| `description` | `akaza-stepper-description` | — |
| `optional` | `akaza-stepper-optional` | — |
| `separator` | `akaza-stepper-separator` | `data-akaza-state="completed|inactive"` |
| `panels` | `akaza-stepper-panels` | — |
| `panel` | `akaza-stepper-panel` | `data-akaza-state="active|inactive"` |
| `controls` | `akaza-stepper-controls` | — |
| `previous` | `akaza-stepper-previous` | native disabled attr |
| `next` | `akaza-stepper-next` | native disabled attr |

Plain `class` applies to the root wrapper. Use `ui.trigger`, `ui.indicator`, and `ui.panel` for the main generated parts.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Move roving focus horizontally, respecting RTL. |
| `ArrowDown` / `ArrowUp` | Move roving focus vertically. |
| `Home` | Focus first permitted step. |
| `End` | Focus last permitted step. |
| `Enter` / `Space` | Activate focused step in manual mode. |

With `activationMode="automatic"`, arrow-key focus also activates the destination step.
