## Component Roadmap

### Shipped

| Component    | Notes                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| Button       | `disabled`, `loading`, `focusableWhenDisabled`, `aria-disabled`, `as` prop |
| Separator    | Semantic `<hr>`, `role="separator"`, horizontal/vertical orientation       |
| Avatar       | Image with fallback slot on load error, `aria-label`                       |
| Tooltip      | trigger + content slots, `role="tooltip"`, auto-positioning, delay         |
| Popover      | trigger + content slots, close on outside click / Escape                   |
| Dialog       | `role="dialog"`, `aria-modal`, focus trap, Teleport to body                |
| Alert Dialog | Extends Dialog; `role="alertdialog"`, requires explicit confirm/cancel     |
| Drawer       | Side-anchored Dialog variant (top/right/bottom/left), focus trap           |
| Menu         | trigger + content slots, items-based API, roving focus                     |
| Tabs         | `role="tablist"`, arrow key nav, animated indicator, items-based API       |
| Checkbox     | `aria-checked`, indeterminate state, `data-checked`                        |
| Radio Group  | `role="radiogroup"`, roving tabindex, items-based API                      |
| Switch       | `role="switch"`, `aria-checked`, `data-checked`                            |
| Toggle       | Single on/off button, `aria-pressed`, `data-pressed`                       |
| Progress     | `role="progressbar"`, determinate + indeterminate states                   |
| Collapsible  | Single trigger/content toggle, `aria-expanded`, animated height            |
| Accordion    | Single/multiple open items, `role="region"`, arrow key nav                 |

### Planned — Forms & Controls

| Component      | Notes                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Field          | Label + input association, error/description slots, `aria-describedby` |
| Fieldset       | Groups related fields with `<fieldset>` + `<legend>`                   |
| Form           | Validation state container, submit handling                            |
| Input          | Text input, `aria-invalid`, `data-invalid`, integrates with Field      |
| Checkbox Group | Manages multiple checkboxes, `role="group"`                            |
| Select         | `role="listbox"`, keyboard nav, `aria-selected`                        |
| Number Field   | Increment/decrement, `role="spinbutton"`, min/max/step                 |
| Slider         | `role="slider"`, `aria-valuenow/min/max`, keyboard step                |
| Toggle Group   | Single or multiple selection, `role="group"`, roving focus             |
| Meter          | `role="meter"`, `aria-valuenow/min/max`, read-only gauge               |

### Planned — Complex Patterns

| Component       | Notes                                                               |
| --------------- | ------------------------------------------------------------------- |
| Context Menu    | Right-click triggered Menu, positions at pointer                    |
| Navigation Menu | Top-level nav with flyout submenus, `role="navigation"`             |
| Menubar         | Horizontal menu strip, `role="menubar"`, arrow key nav across menus |
| Toolbar         | `role="toolbar"`, roving focus across buttons and controls          |
| Scroll Area     | Custom scrollbar, keyboard scrollable, cross-browser consistent     |
| Combobox        | Input + listbox, `aria-autocomplete`, `aria-activedescendant`       |
| Autocomplete    | Extends Combobox with async suggestion loading                      |
| Toast           | `role="status"` / `role="alert"`, auto-dismiss, queue management    |
| Preview Card    | Hover-triggered rich content card (link previews, user cards)       |
