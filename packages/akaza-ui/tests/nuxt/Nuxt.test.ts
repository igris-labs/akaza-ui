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
    expect(mocks.addComponent).toHaveBeenCalledTimes(42);
  });
});
