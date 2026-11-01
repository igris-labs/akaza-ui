import type { MenuItem } from "@/components/menu";
import type { AkazaChangeEventDetails } from "@/types";
import { describe, expect, it, vi } from "vitest";
import { getMenuItemValue, normalizeMenuItems, useMenuActions } from "@/components/menu/useMenuActions";

describe("shared menu actions", () => {
  function fixture() {
    const options = {
      closeOnSelect: () => true,
      radioValues: (): Record<string, string> | undefined => ({ theme: "light" }),
      close: vi.fn(),
      onSelect: vi.fn<(item: MenuItem, details: AkazaChangeEventDetails) => void>(),
      onCheckChange: vi.fn<(item: MenuItem, checked: boolean, details: AkazaChangeEventDetails) => void>(),
      onRadioChange: vi.fn<(group: string, value: string, details: AkazaChangeEventDetails) => void>(),
      onRadioValuesChange: vi.fn(),
    };
    return { options, ...useMenuActions(options) };
  }

  it("normalizes flat/grouped items without copying item identity", () => {
    const items = [{ label: "Open" }];
    expect(normalizeMenuItems()).toEqual([]);
    expect(normalizeMenuItems(items)[0]).toBe(items);
    const groups = [items];
    expect(normalizeMenuItems(groups)).toBe(groups);
    expect(getMenuItemValue({ value: "", label: "Fallback" })).toBe("");
    expect(getMenuItemValue({ label: "Open" })).toBe("Open");
  });

  it("emits before callbacks and respects live close policy", () => {
    const { options, onItemSelect } = fixture();
    const event = new Event("click");
    const callback = vi.fn(() => expect(options.onSelect).toHaveBeenCalled());
    onItemSelect({ label: "Open", onSelect: callback }, event);
    expect(callback).toHaveBeenCalledOnce();
    expect(options.close).toHaveBeenCalledWith("select", event);
    options.closeOnSelect = () => false;
    onItemSelect({ label: "Keep open" }, event);
    expect(options.close).toHaveBeenCalledOnce();
  });

  it("honors cancellation for normal, checkbox, and radio actions", () => {
    const { options, onItemSelect, onCheckboxSelect, onRadioSelect } = fixture();
    options.onSelect.mockImplementation((_item, details) => details.cancel());
    options.onCheckChange.mockImplementation((_item, _checked, details) => details.cancel());
    options.onRadioChange.mockImplementation((_group, _value, details) => details.cancel());
    const callback = vi.fn();
    const checked = vi.fn();
    const event = new Event("click");
    onItemSelect({ onSelect: callback }, event);
    onCheckboxSelect({ checked: false, onUpdateChecked: checked }, event);
    onRadioSelect({ radioGroup: "theme", value: "dark" }, event);
    expect(callback).not.toHaveBeenCalled();
    expect(checked).not.toHaveBeenCalled();
    expect(options.close).not.toHaveBeenCalled();
    expect(options.onRadioValuesChange).not.toHaveBeenCalled();
  });

  it("never activates disabled items or mutates radio props", () => {
    const { options, onItemSelect, onCheckboxSelect, onRadioSelect, isRadioChecked } = fixture();
    const values = Object.freeze({ theme: "light" });
    options.radioValues = () => values;
    const event = new Event("click");
    onItemSelect({ disabled: true }, event);
    onCheckboxSelect({ disabled: true }, event);
    onRadioSelect({ disabled: true }, event);
    expect(options.onSelect).not.toHaveBeenCalled();
    expect(options.onCheckChange).not.toHaveBeenCalled();
    expect(options.onRadioChange).not.toHaveBeenCalled();
    expect(isRadioChecked({ radioGroup: "theme", value: "light" })).toBe(true);
    onRadioSelect({ radioGroup: "theme", value: "dark" }, event);
    expect(options.onRadioValuesChange).toHaveBeenCalledWith({ theme: "dark" });
    expect(values.theme).toBe("light");
    options.radioValues = () => undefined;
    onRadioSelect({ value: "dark" }, event);
    expect(options.onRadioValuesChange).toHaveBeenCalledOnce();
  });
});
