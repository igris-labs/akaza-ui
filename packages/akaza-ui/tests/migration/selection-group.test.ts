import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useSelectionGroup } from "@/composables/internal/sdk/useSelectionGroup";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()));

describe("sdk selection action boundary", () => {
  it("reads the current Vue value and never commits refused or canceled requests", async () => {
    const value = ref(["a"]);
    const change = vi.fn<(value: string[], reason: string, event?: Event) => boolean>(() => false);
    const wrapper = mount(defineComponent({
      setup() {
        const selection = useSelectionGroup({
          value: () => value.value,
          order: () => ["a", "b", "skip"],
          multiple: () => true,
          disabled: key => key === "skip",
          change,
        });
        return () => h("button", { onClick: event => selection.select("b", true, "trigger", event) }, "Toggle");
      },
    }));
    mounted.push(wrapper);
    await wrapper.trigger("click");
    expect(change.mock.calls[0]?.[0]).toEqual(["a", "b"]);
    await wrapper.trigger("click");
    expect(change.mock.calls[1]?.[0]).toEqual(["a", "b"]);
    value.value = ["b"];
    await wrapper.trigger("click");
    expect(change.mock.calls[2]?.[0]).toEqual([]);
    expect(change.mock.calls[2]?.[1]).toBe("trigger");
    expect(change.mock.calls[2]?.[2]).toBeInstanceOf(MouseEvent);
  });

  it("suppresses unchanged choices and excludes disabled or missing keys", async () => {
    const change = vi.fn<(value: string[], reason: string, event?: Event) => boolean>(() => true);
    const wrapper = mount(defineComponent({
      setup() {
        const selection = useSelectionGroup({
          value: () => ["a"], order: () => ["a", "b", "skip"], multiple: () => false,
          disabled: key => key === "skip", change,
        });
        return () => h("div", ["a", "b", "skip", "missing"].map(key => h("button", {
          onClick: () => selection.select(key, false, "programmatic"),
        }, key)));
      },
    }));
    mounted.push(wrapper);
    const buttons = wrapper.findAll("button");
    for (const button of buttons) await button.trigger("click");
    expect(change.mock.calls.map(call => call[0])).toEqual([["b"]]);
  });
});
