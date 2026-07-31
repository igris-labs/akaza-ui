## Component Roadmap

### Shipped

| Component                    | Notes                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| Button                       | `disabled`, `loading`, `focusableWhenDisabled`, `aria-disabled`, `as` prop |
| Separator                    | Semantic `<hr>`, `role="separator"`, horizontal/vertical orientation       |
| Avatar                       | Image with fallback slot on load error, `aria-label`                       |
| Tooltip                      | trigger + content slots, `role="tooltip"`, auto-positioning, delay         |
| Popover                      | trigger + content slots, close on outside click / Escape                   |
| Dialog                       | `role="dialog"`, `aria-modal`, focus trap, Teleport to body                |
| Alert Dialog                 | Extends Dialog; `role="alertdialog"`, requires explicit confirm/cancel     |
| Drawer                       | Side-anchored Dialog variant (top/right/bottom/left), focus trap           |
| Menu                         | trigger + content slots, items-based API, roving focus                     |
| Context Menu                 | Right-click triggered Menu, positions at pointer                           |
| Menubar                      | Horizontal menu strip, `role="menubar"`, arrow key nav across menus        |
| Navigation Menu              | Top-level nav with flyout submenus, semantic `nav` root                    |
| Toolbar                      | `role="toolbar"`, roving focus across buttons and controls                 |
| Tabs                         | `role="tablist"`, arrow key nav, animated indicator, items-based API       |
| Checkbox                     | `aria-checked`, indeterminate state, `data-akaza-state`                    |
| Radio Group                  | `role="radiogroup"`, roving tabindex, items-based API                      |
| Switch                       | `role="switch"`, `aria-checked`, `data-akaza-state`                        |
| Toggle                       | Single on/off button, `aria-pressed`, `data-akaza-state`                   |
| Progress                     | `role="progressbar"`, determinate + indeterminate states                   |
| Collapsible                  | Single trigger/content toggle, `aria-expanded`, animated height            |
| Accordion                    | Single/multiple open items, `role="region"`, arrow key nav                 |
| Field                        | Label + input association, description/error wiring                        |
| Fieldset                     | Native fieldset/legend wrapper for related controls                        |
| Form                         | Submit details, `FormData`, native validity state                          |
| Input                        | Text input with Field integration and invalid state attrs                  |
| Checkbox Group               | Manages multiple checkboxes with items API and form submission             |
| Select                       | `role="listbox"`, keyboard nav, typeahead, autocomplete filtering          |
| Listbox                      | Standalone single/multiple selection, filtering, range select, virtualization |
| Combobox                     | Input + listbox, `aria-autocomplete`, `aria-activedescendant`              |
| Pin / OTP Input              | Multi-cell fixed-length input, paste distribution, OTP and form metadata   |
| Tags Input                   | Tokenized values, keyboard editing, validation, paste, and form submission |
| Number Field                 | Increment/decrement, `role="spinbutton"`, min/max/step                     |
| Slider                       | `role="slider"`, `aria-valuenow/min/max`, pointer and keyboard step        |
| Toggle Group                 | Single or multiple selection, `role="group"`, roving focus                 |
| Meter                        | `role="meter"`, `aria-valuenow/min/max`, read-only gauge                   |
| OverlayProvider / useOverlay | Programmatic overlay provider + composable                                 |
| Toast                        | `role="status"` / `role="alert"`, auto-dismiss, queue management           |
| Hover Preview Card           | Hover-triggered rich content card for links, users, and entities           |
| Editable                     | Inline text editing with preview, draft, submit, cancel, and forms         |
| Rating                       | Fractional radio-group rating input with hover and keyboard support        |
| Stepper                      | Linear/non-linear multi-step navigation with panels and roving focus       |
| Pagination                   | Page ranges, ellipses, boundary controls, links, and cancelable changes    |

### Planned — Date & Time Primitives

| Component          | Notes                                                   |
| ------------------ | ------------------------------------------------------- |
| Calendar           | Single-date calendar grid with keyboard navigation      |
| Range Calendar     | Date-range calendar grid                                |
| Date Field         | Segmented date input                                    |
| Date Picker        | Date Field + Calendar + Popover composition             |
| Date Range Field   | Segmented date-range input                              |
| Date Range Picker  | Date Range Field + Range Calendar + Popover composition |
| Month Picker       | Month selection grid                                    |
| Month Range Picker | Month-range selection grid                              |
| Year Picker        | Year selection grid                                     |
| Year Range Picker  | Year-range selection grid                               |
| Time Field         | Segmented time input                                    |
| Time Range Field   | Segmented time-range input                              |

### Planned — Color Primitives

| Component           | Notes                                   |
| ------------------- | --------------------------------------- |
| Color Field         | Text/segmented color input              |
| Color Area          | 2D saturation/brightness selection area |
| Color Slider        | Hue, alpha, or channel slider           |
| Color Swatch        | Readonly color preview                  |
| Color Swatch Picker | Selectable swatch group                 |

### Planned — Layout & Utility Primitives

| Component       | Notes                                                           |
| --------------- | --------------------------------------------------------------- |
| Aspect Ratio    | Fixed-ratio layout wrapper                                      |
| Splitter        | Resizable panel group                                           |
| Tree            | Hierarchical tree view with keyboard navigation                 |
| Visually Hidden | Accessible hidden content utility                               |
| Label           | Standalone label primitive for non-Field usage                  |
| Scroll Area     | Custom scrollbar, keyboard scrollable, cross-browser consistent |

### Covered Aliases

| External name | Akaza equivalent / decision     |
| ------------- | ------------------------------- |
| HoverCard     | Tracked as `Hover Preview Card` |
| ScrollArea    | Tracked as `Scroll Area`        |
| ToggleGroup   | Covered by `Toggle Group`       |
