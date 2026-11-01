import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import DocsDemo from "../../../../docs/app/components/examples/color-picker/Demo.vue";
import PlaygroundDemo from "../../../../playground/src/sections/color-picker/ColorPickerSection.vue";

enableAutoUnmount(afterEach);

describe("color popover examples", () => {
  it.each([["docs", DocsDemo], ["playground", PlaygroundDemo]] as const)("renders the %s picker in the popup and lets Escape dismiss after a draft reset", async (_name, component) => {
    const wrapper = mount(component, { attachTo: document.body });
    const trigger = wrapper.findAll("button").find(button => button.text() === "Choose color")!;
    await trigger.trigger("click");
    await flushPromises();
    const popup = document.querySelector(".akaza-popover-content .akaza-color-picker");
    expect(popup).not.toBeNull();
    const input = popup!.querySelector<HTMLInputElement>(".akaza-color-field-input")!;
    input.value = "#";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flushPromises();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(input.value).not.toBe("#");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.querySelector(".akaza-popover-content")).toBeNull();
  });
});
