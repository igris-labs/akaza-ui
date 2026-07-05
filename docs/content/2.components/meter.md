---
title: Meter
description: Read-only gauge for displaying a bounded numeric value.
navigation:
  icon: i-lucide-gauge
---

`Meter` displays a read-only value inside a known range. Use it for gauges like storage usage, quota, battery level, or health scores. It renders `role="meter"` with value ARIA metadata and exposes label, value, track, and indicator parts.

## Usage

::component-preview
  :::examples-meter-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Meter } from "akaza-ui";
</script>

<template>
  <Meter label="Storage used" :value="64" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Current value. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `low` | `number` | — | Low threshold. Values below set `data-akaza-state="low"`. |
| `high` | `number` | — | High threshold. Values above set `data-akaza-state="high"`. |
| `optimum` | `number` | — | Preferred range hint. |
| `label` | `string` | — | Visible label. Also labels the meter. |
| `ariaLabel` | `string` | — | Accessible label when no visible label exists. |
| `ariaLabelledby` | `string` | label id | Accessible label id. |
| `ariaValueText` | `string` | — | Custom `aria-valuetext`. |
| `locale` | `Intl.LocalesArgument` | runtime locale | Locale for formatted value. |
| `formatOptions` | `Intl.NumberFormatOptions` | — | Number formatting options. |
| `getValueLabel` | `(formattedValue, value) => string \| undefined` | — | Function for `aria-valuetext`. |
| `ui` | `MeterUi` | — | Classes for structural parts. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root meter element. |
| `label` | Label text. |
| `value` | Formatted value text. |
| `track` | Meter track. |
| `indicator` | Filled indicator. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `label` | `value`, `formattedValue`, `state` | Custom label. |
| `value` | `value`, `formattedValue`, `percentage`, `state` | Custom formatted value. |
| `indicator` | `value`, `percentage`, `state` | Custom indicator content. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-meter` | `data-akaza-state` |
| `label` | `akaza-meter-label` | — |
| `value` | `akaza-meter-value` | — |
| `track` | `akaza-meter-track` | — |
| `indicator` | `akaza-meter-indicator` | `data-akaza-state` |

`Meter` sets `--akaza-meter-percentage` on the root. Plain `class` applies to the root meter.
