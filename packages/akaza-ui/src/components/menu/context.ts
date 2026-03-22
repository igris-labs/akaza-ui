import type { InjectionKey, Slots } from "vue";
import type { MenuItem, MenuUi } from ".";

export interface MenuContext {
  ui: MenuUi | undefined;
  radioValues: Record<string, string> | undefined;
  closeMenu: (reason: string, event?: Event) => void;
  onItemSelect: (item: MenuItem, event: Event) => void;
  onCheckboxSelect: (item: MenuItem, event: Event) => void;
  onRadioSelect: (item: MenuItem, event: Event) => void;
  isRadioChecked: (item: MenuItem) => boolean;
  getItemValue: (item: MenuItem) => string;
  normalizeItems: (raw?: MenuItem[] | MenuItem[][]) => MenuItem[][];
  closeOnSelect: boolean;
  /** Root Menu's slots — forwarded so recursive panels can render custom item templates. */
  rootSlots: Slots;
}

export const MENU_CONTEXT_KEY: InjectionKey<MenuContext> = Symbol("MenuContext");
