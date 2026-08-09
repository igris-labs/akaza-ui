import { beforeEach, describe, expect, it, vi } from "vitest";
import module from "@/nuxt";

const mocks = vi.hoisted(() => ({
  addComponent: vi.fn(),
}));

vi.mock("@nuxt/kit", () => ({
  addComponent: mocks.addComponent,
  defineNuxtModule: (definition: unknown) => definition,
}));

beforeEach(() => mocks.addComponent.mockClear());

describe("nuxt module", () => {
  it("registers package CSS and every public component export", () => {
    const nuxt = { options: { css: [] as string[] } };
    const setup = (module as unknown as {
      setup: (options: Record<string, unknown>, nuxt: typeof nuxt) => void;
    }).setup;

    setup({}, nuxt);

    expect(nuxt.options.css).toEqual(["akaza-ui/dist/akaza-ui.css"]);
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "OverlayProvider", export: "OverlayProvider", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Listbox", export: "Listbox", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "PinInput", export: "PinInput", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "TagsInput", export: "TagsInput", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Editable", export: "Editable", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Rating", export: "Rating", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Stepper", export: "Stepper", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Pagination", export: "Pagination", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "Calendar", export: "Calendar", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "DateField", export: "DateField", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "DateRangeField", export: "DateRangeField", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "DateRangePicker", export: "DateRangePicker", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "MonthPicker", export: "MonthPicker", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "MonthRangePicker", export: "MonthRangePicker", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "TimeField", export: "TimeField", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "TimeRangeField", export: "TimeRangeField", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "YearPicker", export: "YearPicker", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledWith({ name: "YearRangePicker", export: "YearRangePicker", filePath: "akaza-ui" });
    expect(mocks.addComponent).toHaveBeenCalledTimes(52);
  });
});
