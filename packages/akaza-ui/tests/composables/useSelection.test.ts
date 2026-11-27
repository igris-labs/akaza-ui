import type { UseSelectionOptions, UseSelectionReturn } from "akaza-ui";
import { mount } from "@vue/test-utils";
import { useSelection } from "akaza-ui";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

const items = [{ key: "a" }, { key: "b", disabled: true }, { key: "c" }, { key: "d" }];
let unmount: (() => void) | undefined;

function setup(options: Partial<UseSelectionOptions> = {}) {
  let selection!: UseSelectionReturn;
  const wrapper = mount(defineComponent({
    setup() {
      selection = useSelection({ items, ...options });
      return () => null;
    },
  }));
  unmount = () => wrapper.unmount();
  return selection;
}

afterEach(() => {
  unmount?.();
  unmount = undefined;
});

describe("useSelection", () => {
  it("selects one item by default and ignores disabled or unknown keys", () => {
    const onChange = vi.fn();
    const { selectedKeys, select, selectRange, toggle } = setup({ onChange });
    select("a");
    expect(selectedKeys.value).toEqual(["a"]);
    select("b");
    toggle("unknown");
    selectRange("a", "d");
    expect(selectedKeys.value).toEqual(["a"]);
    expect(onChange).toHaveBeenCalledTimes(1);
    toggle("c");
    expect(selectedKeys.value).toEqual(["c"]);
    toggle("c");
    expect(selectedKeys.value).toEqual([]);
  });

  it("keeps the shared model current and replaces ranges in the latest item order", () => {
    const model = ref(["d"]);
    const order = ref(items);
    const multiple = ref(true);
    const selection = setup({ items: order, model, multiple });
    selection.toggle("c");
    expect(model.value).toEqual(["d", "c"]);
    selection.selectRange("c", "a");
    expect(model.value).toEqual(["a", "c"]);
    expect(selection.isSelected("b")).toBe(false);
    selection.selectRange("b", "d");
    expect(model.value).toEqual(["a", "c"]);
    order.value = [items[0]!, items[3]!, items[2]!];
    selection.selectRange("a", "c");
    expect(model.value).toEqual(["a", "d", "c"]);
    model.value = ["d"];
    expect(selection.selectedKeys.value).toEqual(["d"]);
    multiple.value = false;
    selection.toggle("c");
    expect(model.value).toEqual(["c"]);
  });

  it("forwards cancellation and the original event for selection actions", () => {
    const model = ref(["a"]);
    const reasons: string[] = [];
    const event = new MouseEvent("click");
    const { select, toggle, selectRange, clear } = setup({
      model,
      multiple: true,
      onChange(_keys, details) {
        expect(details.event).toBe(event);
        reasons.push(details.reason);
        details.cancel();
      },
    });
    select("c", event);
    toggle("a", event);
    selectRange("a", "d", event);
    clear(event);
    expect(model.value).toEqual(["a"]);
    expect(reasons).toEqual(["select", "toggle", "range", "clear"]);
  });
});
