# The Akaza UI Philosophy

**Akaza UI is built to work with Vue — not against it.**

Most headless UI libraries started in React. When their APIs are ported to Vue, the friction shows: you get sub-component trees that feel foreign, state models that fight Vue's reactivity, and patterns that exist to solve React problems Vue never had.

Akaza UI starts from the other direction.

## Vue already has the answer

React components pass render functions and children as props because that's how React composes UI. Vue has a better primitive for this: **slots**.

Slots are Vue's native mechanism for injecting content and receiving state from a parent. They're typed, scoped, and understood by every Vue developer. The idiomatic Vue answer to "how does the parent control what renders inside the component?" is a scoped slot — not a sub-component tree.

Akaza UI leans into that completely. `#trigger`, `#header`, `#body`, `#footer` — named slots that expose state and actions directly, keeping templates flat and readable.

## The `ui` prop over sub-components

In React headless libraries, you style a component by wrapping each internal element in a sub-component:

```jsx
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="overlay" />
    <Dialog.Content className="content">…</Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

This works in React, but in Vue it produces unnecessary boilerplate — you're writing components to hold class names.

Akaza UI replaces this with the `ui` prop: a plain object where each key targets a named structural part. The component handles the markup; you inject the classes.

```vue
<Dialog :ui="{
  overlay: 'fixed inset-0 bg-black/50',
  content: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl',
}">
```

## Unstyled means zero opinion

Even "minimal" default visual styles create specificity battles. Akaza UI ships only the CSS required for correct behavior — animations, positioning, focus management. Nothing visual.

Every element exposes semantic hooks so you can reach it however you prefer:

- `class="akaza-[component]-[part]"` for CSS targeting
- `data-akaza-state` for state-driven styles (`open`, `checked`, `disabled`…)
- `data-akaza-side` for floating element positioning
- the `ui` prop for inline class injection

Your design, your CSS, your call.

## Accessibility is infrastructure, not a feature

Focus management, ARIA roles, keyboard navigation, and screen reader support aren't optional add-ons. They're part of what "component" means. Every Akaza UI primitive implements the WAI-ARIA authoring practices for its pattern — so you don't have to think about it.

## Core principles

- **Don't fight the framework** — APIs align with Vue's slot system, `v-model`, and reactivity model
- **Flat templates over nested trees** — named scoped slots keep markup readable
- **Structure, not style** — behavior is the product; appearance is yours
- **Accessibility by default** — correct ARIA, focus, and keyboard behavior, always
- **Clarity over cleverness** — fewer abstractions, more predictable behavior

Akaza UI is not a design system. It is Vue-native UI infrastructure.
