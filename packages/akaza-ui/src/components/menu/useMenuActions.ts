import type { MenuItem } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { createChangeDetails } from "../../utils/changeEvent";

interface MenuActionOptions {
  closeOnSelect: () => boolean;
  radioValues: () => Record<string, string> | undefined;
  close: (reason: string, event?: Event) => void;
  onSelect: (item: MenuItem, details: AkazaChangeEventDetails) => void;
  onCheckChange: (item: MenuItem, checked: boolean, details: AkazaChangeEventDetails) => void;
  onRadioChange: (group: string, value: string, details: AkazaChangeEventDetails) => void;
  onRadioValuesChange: (values: Record<string, string>) => void;
}

export function normalizeMenuItems(raw?: MenuItem[] | MenuItem[][]): MenuItem[][] {
  if (!raw?.length) return [];
  return Array.isArray(raw[0]) ? raw as MenuItem[][] : [raw as MenuItem[]];
}

export function getMenuItemValue(item: MenuItem): string {
  return (item.value ?? item.label ?? "") as string;
}

/** Shared item actions; each menu root retains its own opening/focus policy. */
export function useMenuActions(options: MenuActionOptions) {
  function onItemSelect(item: MenuItem, event: Event) {
    if (item.disabled) return;
    const change = createChangeDetails("select", event);
    options.onSelect(item, change.details);
    if (change.canceled()) return;
    item.onSelect?.();
    if (options.closeOnSelect()) options.close("select", event);
  }
  function onCheckboxSelect(item: MenuItem, event: Event) {
    if (item.disabled) return;
    const next = !item.checked;
    const change = createChangeDetails("select", event);
    options.onCheckChange(item, next, change.details);
    if (!change.canceled()) item.onUpdateChecked?.(next);
  }
  function isRadioChecked(item: MenuItem): boolean {
    return options.radioValues()?.[item.radioGroup ?? ""] === item.value;
  }
  function onRadioSelect(item: MenuItem, event: Event) {
    if (item.disabled) return;
    const group = item.radioGroup ?? "";
    const value = (item.value ?? "") as string;
    const change = createChangeDetails("select", event);
    options.onRadioChange(group, value, change.details);
    if (change.canceled()) return;
    const values = options.radioValues();
    if (values) options.onRadioValuesChange({ ...values, [group]: value });
  }
  return { onItemSelect, onCheckboxSelect, onRadioSelect, isRadioChecked };
}
