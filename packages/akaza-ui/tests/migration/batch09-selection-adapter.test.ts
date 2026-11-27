import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { Select } from "@/components/select";
import { useCollectionSelection } from "@/composables/internal/sdk/useCollectionSelection";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()));

function setup<Value>(value: () => Value[], equals: (a: Value, b: Value) => boolean = Object.is) {
  const change = vi.fn<(value: Value[], reason: string, event?: Event) => boolean>(() => false);
  let selection!: ReturnType<typeof useCollectionSelection<Value>>;
  mounted.push(mount(defineComponent({
    setup() {
      selection = useCollectionSelection({ value, equals, change });
      return () => h("div");
    },
  })));
  return { selection, change };
}

describe("batch 09 action-local selection keys", () => {
  it("preserves typed identity, duplicate and unknown selected values on toggles", () => {
    let value: Array<string | number> = [1, "ghost", "ghost"];
    const { selection, change } = setup(() => value);
    selection.select("1", true, "select");
    expect(change.mock.lastCall?.[0]).toEqual([1, "ghost", "ghost", "1"]);
    value = [1, "1", "1", "ghost"];
    selection.select("1", true, "select");
    expect(change.mock.lastCall?.[0]).toEqual([1, "ghost"]);
  });

  it("preserves comparator identity, original references and repeated single choices", () => {
    const old = { id: 1, label: "old" };
    const next = { id: 1, label: "new" };
    const other = { id: 2, label: "retained" };
    const { selection, change } = setup(() => [old, other], (a, b) => a.id === b.id);
    selection.select(next, true, "select");
    expect(change.mock.lastCall?.[0]).toEqual([other]);
    expect(change.mock.lastCall?.[0][0]).toBe(other);
    selection.select(next, false, "programmatic");
    expect(change.mock.lastCall?.[0][0]).toBe(next);
    const single = setup(() => [old], (a, b) => a.id === b.id);
    single.selection.select(next, false, "select");
    single.selection.select(next, false, "select");
    expect(single.change).toHaveBeenCalledTimes(2);
    expect(single.change.mock.lastCall?.[0][0]).toBe(next);
  });

  it("replaces ranges in either direction, skips disabled, preserves repeated option values", () => {
    const { selection, change } = setup(() => ["disabled", "offscreen"]);
    const items = ["a", "skip", "b", "b", "c"].map(value => ({ value, disabled: value === "skip" }));
    const event = new KeyboardEvent("keydown", { key: "ArrowDown", shiftKey: true });
    selection.replaceRange(items, 0, 3, "range", event);
    expect(change.mock.lastCall).toEqual([["a", "b", "b"], "range", event]);
    selection.replaceRange(items, 4, 2, "range");
    expect(change.mock.lastCall?.[0]).toEqual(["b", "b", "c"]);
    selection.replaceRange(items, 1, 4, "range");
    expect(change.mock.lastCall?.[0]).toEqual(["b", "b", "c"]);
  });

  it("reads current controlled values after rejection, cancellation and external replacement", () => {
    let value = ["a"];
    const { selection, change } = setup(() => value);
    const event = new MouseEvent("click");
    expect(selection.select("b", true, "select", event)).toBe(false);
    expect(selection.select("b", true, "select", event)).toBe(false);
    expect(change.mock.calls.map(call => call[0])).toEqual([["a", "b"], ["a", "b"]]);
    value = ["b"];
    change.mockImplementation(() => true);
    expect(selection.select("b", true, "select", event)).toBe(true);
    expect(change.mock.lastCall).toEqual([[], "select", event]);
  });
});

it("batch 09 Select keeps accepted open content interactive when a controlled parent refuses close", async () => {
  const wrapper = mount(Select, {
    props: {
      open: true,
      "onUpdate:open": vi.fn(),
      options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
      ariaLabel: "Choice",
    },
  });
  mounted.push(wrapper);
  await wrapper.get('[role="combobox"]').trigger("keydown", { key: "Escape" });
  expect(wrapper.get('[role="combobox"]').attributes("aria-expanded")).toBe("true");
  expect(wrapper.get(".akaza-select-content").attributes("inert")).toBeUndefined();
  await wrapper.get('[role="combobox"]').trigger("keydown", { key: "End" });
  expect(wrapper.get('[data-akaza-highlighted="true"]').text()).toContain("Beta");
});

it("batch 09 Select keeps portal Tab native when close is refused and closes normally when uncontrolled", async () => {
  const wrapper = mount(Select, { props: {
    open: true, "onUpdate:open": vi.fn(), teleport: "body", autocomplete: true,
    options: [{ value: "a", label: "Alpha" }], ariaLabel: "Choice",
  } });
  mounted.push(wrapper);
  const content = document.querySelector<HTMLElement>(".akaza-select-content")!;
  const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  content.querySelector("input")!.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(content.hasAttribute("inert")).toBe(false);
  const uncontrolled = mount(Select, { props: { options: [{ value: "a" }], ariaLabel: "Local" } });
  mounted.push(uncontrolled);
  await uncontrolled.get('[role="combobox"]').trigger("click");
  expect(uncontrolled.get('[role="combobox"]').attributes("aria-expanded")).toBe("true");
  await uncontrolled.get('[role="combobox"]').trigger("keydown", { key: "Escape" });
  expect(uncontrolled.get('[role="combobox"]').attributes("aria-expanded")).toBe("false");
});
