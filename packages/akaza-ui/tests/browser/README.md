# Browser accessibility coverage

The production playground is the browser fixture. It verifies the installed package surface rather than test-only component wrappers.

| Component group                                                             | Keyboard          | Mouse           | Touch                | Semantics / axe |
| --------------------------------------------------------------------------- | ----------------- | --------------- | -------------------- | --------------- |
| Button, Input, Pin Input, Tags Input, Editable                              | Yes               | Yes             | Native/tap           | Yes             |
| Checkbox, Checkbox Group, Radio Group, Switch, Toggle, Toggle Group, Rating | Yes               | Yes             | Yes                  | Yes             |
| Select, Listbox, Combobox, Number Field, Slider, Calendar, Date Field, Date Range Field/Picker | Yes | Yes | Yes | Yes |
| Collapsible, Accordion, Tabs, Stepper, Pagination                           | Yes               | Yes             | Yes                  | Yes             |
| Menu, Context Menu, Navigation Menu, Menubar, Toolbar                       | Yes               | Yes             | Tap where applicable | Yes             |
| Tooltip, Hover Preview Card                                                 | Focus alternative | Hover           | No hover dependency  | Yes             |
| Popover, Dialog, Alert Dialog, Drawer, Toast, Overlay                       | Yes               | Yes             | Yes                  | Yes             |
| Avatar, Separator, Progress, Meter, Field, Fieldset, Form, Overlay Provider | Not interactive   | Not interactive | Not interactive      | Yes             |

Chromium runs the full interaction and axe suites. Firefox and WebKit run desktop interactions. Pixel and iPhone projects run touch interactions. Context Menu long press runs on mobile Chromium because Playwright WebKit exposes trusted taps but no trusted long-press gesture API; iPhone still covers every conventional tap path.
