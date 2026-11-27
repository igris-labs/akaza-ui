import type { VueWrapper } from "@vue/test-utils";
import type { DataTableColumn, DataTableProps, DataTableRowKey } from "@/components/data-table";
import type { AkazaChangeEventDetails } from "@/types";
import { reorderMessage } from "@ui-sdk/core";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { DataTable } from "@/components/data-table";

interface Row { id: DataTableRowKey; name: string; children?: Row[] }
const data: Row[] = [{ id: 1, name: "Ada" }, { id: "1", name: "Grace" }, { id: "c", name: "Lin" }];
const columns: DataTableColumn<Row>[] = [
  { id: "order", type: "reorder", size: 40, resizable: false, reorderable: false },
  { accessor: "name", header: "Name", size: 150, minSize: 100, maxSize: 200 },
  { id: "extra", header: "Extra", size: 150, minSize: 100, maxSize: 200 },
];
const wrappers: VueWrapper[] = [];
let frames: Map<number, FrameRequestCallback>;
let frameId = 0;

class TestPointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  isPrimary: boolean;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 21;
    this.pointerType = init.pointerType ?? "mouse";
    this.isPrimary = init.isPrimary ?? true;
  }
}

function pointer(target: EventTarget, type: string, x = 0, y = 0, init: PointerEventInit = {}) {
  const event = new TestPointerEvent(type, {
    bubbles: true, cancelable: true, button: 0, buttons: type === "pointerup" ? 0 : 1,
    clientX: x, clientY: y, ...init,
  });
  target.dispatchEvent(event);
  return event;
}

function render(props: Partial<DataTableProps<Row>> & Record<string, unknown> = {}) {
  const wrapper = mount(DataTable<Row>, {
    attachTo: document.body,
    props: { data, columns, rowKey: "id", rowReorder: true, columnReorder: true, columnResize: true, ...props },
  });
  wrappers.push(wrapper);
  geometry(wrapper);
  return wrapper;
}

function geometry(wrapper: VueWrapper) {
  wrapper.findAll(".akaza-data-table-row").forEach((row, index) => {
    row.element.getBoundingClientRect = () => new DOMRect(0, index * 40, 340, 40);
  });
  wrapper.findAll("th[data-akaza-column]").forEach((column, index) => {
    const x = wrapper.attributes("dir") === "rtl" ? (2 - index) * 100 : index * 100;
    column.element.getBoundingClientRect = () => new DOMRect(x, 0, 100, 40);
  });
}

function rowHandle(wrapper: VueWrapper, index = 0) { return wrapper.findAll(".akaza-data-table-reorder-handle")[index]!; }
function columnHandle(wrapper: VueWrapper) { return wrapper.get("th[data-akaza-column='name'] .akaza-data-table-column-reorder-handle"); }
function resize(wrapper: VueWrapper) { return wrapper.get("th[data-akaza-column='name'] .akaza-data-table-resize-handle"); }
function names(wrapper: VueWrapper) { return wrapper.findAll("tbody td[data-akaza-column='name']").map(cell => cell.text()); }
function values(wrapper: VueWrapper, event: string) { return wrapper.emitted(event)?.map(args => args[0]); }
async function frame() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach(callback => callback(16));
  await nextTick();
}
async function moveRow(wrapper: VueWrapper, key = "ArrowDown", index = 0) {
  const handle = rowHandle(wrapper, index);
  await handle.trigger("keydown", { key: " " });
  await handle.trigger("keydown", { key });
  await handle.trigger("keydown", { key: "Enter" });
}

beforeEach(() => {
  frames = new Map();
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const getStyle = window.getComputedStyle.bind(window);
  // jsdom does not inherit direction from the table's root like a browser does.
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
    const style = getStyle(element);
    Object.defineProperty(style, "direction", { value: element.closest("[dir]")?.getAttribute("dir") ?? "ltr" });
    return style;
  });
});
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("sdk DataTable gestures", () => {
  it("samples resize once per frame and uses actual release coordinates", async () => {
    const wrapper = render();
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(document, "pointermove", 110.5);
    pointer(document, "pointermove", 125);
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    await frame();
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 175 }]);
    const release = pointer(document, "pointerup", 140);
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 175 }, { name: 190 }]);
    expect(wrapper.emitted("column-sizing-change")?.at(-1)?.[1]).toMatchObject({ reason: "resize", event: release });
  });

  it("flushes pending live resize but does not duplicate an unchanged release", () => {
    const wrapper = render();
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(document, "pointermove", 125);
    pointer(document, "pointerup", 125);
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 175 }]);
  });

  it.each(["mouse", "pen", "touch"])("commits end-only %s resize once using pointerup, not the last move", async (pointerType) => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 100, 0, { pointerType });
    pointer(document, "pointermove", 120, 0, { pointerType });
    await frame();
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    const release = pointer(document, "pointerup", 145, 0, { pointerType });
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 195 }]);
    expect(wrapper.emitted("column-sizing-change")?.[0]?.[1]).toMatchObject({ event: release });
  });

  it.each(["pointercancel", "Escape"])("cancels end-only resize on %s without a commit", async (ending) => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(document, "pointermove", 125);
    await frame();
    if (ending === "Escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    else pointer(document, ending, 125);
    pointer(document, "pointerup", 150);
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
  });

  it("honors resize cancellation, controlled refusal, bounds, RTL and fit math", async () => {
    const canceled = render({ onColumnSizingChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel() });
    pointer(resize(canceled).element, "pointerdown", 100);
    pointer(document, "pointerup", 145);
    expect(canceled.emitted("update:columnSizing")).toBeUndefined();
    const refused = render({ columnSizing: { name: 150 }, "onUpdate:columnSizing": vi.fn() });
    pointer(resize(refused).element, "pointerdown", 100);
    pointer(document, "pointerup", 145);
    await nextTick();
    expect(resize(refused).attributes("aria-valuenow")).toBe("150");
    const rtl = render({ dir: "rtl", columnResize: { behavior: "fit" } });
    pointer(resize(rtl).element, "pointerdown", 100);
    pointer(document, "pointerup", -500);
    expect(values(rtl, "update:columnSizing")).toEqual([{ name: 200, extra: 100 }]);
  });

  it("keeps below-threshold boundary crossing a click, not a reorder", async () => {
    const clicked = vi.fn();
    const wrapper = render({ onClick: clicked });
    const handle = columnHandle(wrapper).element;
    pointer(handle, "pointerdown", 249);
    pointer(document, "pointermove", 250);
    pointer(document, "pointerup", 250);
    handle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await nextTick();
    expect(wrapper.emitted("column-order-change")).toBeUndefined();
    expect(clicked).toHaveBeenCalledOnce();
  });

  it("preserves accepted DOM order during a draft and commits actual pointerup with distinct stable keys", async () => {
    const wrapper = render();
    const handle = rowHandle(wrapper).element;
    pointer(handle, "pointerdown", 0, 20);
    pointer(document, "pointermove", 0, 65);
    await frame();
    expect(names(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    expect(rowHandle(wrapper).attributes("aria-pressed")).toBe("true");
    expect(wrapper.findAll("[data-akaza-drop-target]")).toHaveLength(1);
    const release = pointer(document, "pointerup", 0, 110);
    await nextTick();
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", "c", 1]]);
    expect(wrapper.emitted("row-order-change")?.[0]?.[1]).toMatchObject({ reason: "reorder", event: release });
    expect(names(wrapper)).toEqual(["Grace", "Lin", "Ada"]);
    expect(rowHandle(wrapper, 2).element).toBe(handle);
    expect(wrapper.findAll("[data-akaza-grabbed]")).toHaveLength(0);
  });

  it("does not reorder a press without threshold pickup, even if release coordinates differ", () => {
    const wrapper = render();
    pointer(rowHandle(wrapper).element, "pointerdown", 0, 20);
    pointer(document, "pointerup", 0, 110);
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
  });

  it.each(["pointercancel", "Escape"])("cancels reorder with %s and ignores foreign pointers", async (ending) => {
    const wrapper = render();
    pointer(rowHandle(wrapper).element, "pointerdown", 0, 20);
    pointer(document, "pointermove", 0, 110, { pointerId: 99 });
    pointer(document, "pointerup", 0, 110, { pointerId: 99 });
    pointer(rowHandle(wrapper, 1).element, "pointerdown", 0, 60, { pointerId: 99 });
    pointer(document, "pointermove", 0, 110);
    await frame();
    if (ending === "Escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    else pointer(document, ending, 0, 110);
    pointer(document, "pointerup", 0, 110);
    await nextTick();
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    expect(names(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    expect(wrapper.findAll("[data-akaza-grabbed]")).toHaveLength(0);
  });

  it("drops keyboard requests only after pickup, supports Home/End, cancels Tab/Escape", async () => {
    const wrapper = render();
    const handle = rowHandle(wrapper);
    await handle.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    await handle.trigger("keydown", { key: " " });
    await handle.trigger("keydown", { key: "End" });
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    await handle.trigger("keydown", { key: "Enter" });
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", "c", 1]]);
    await moveRow(wrapper, "Home", 2);
    expect(values(wrapper, "update:rowOrder")?.at(-1)).toEqual([1, "1", "c"]);
    for (const key of ["Tab", "Escape"]) {
      await handle.trigger("keydown", { key: " " });
      await handle.trigger("keydown", { key: "ArrowDown" });
      await handle.trigger("keydown", { key });
      expect(handle.attributes("aria-pressed")).toBe("false");
    }
    expect(wrapper.emitted("row-order-change")).toHaveLength(2);
  });

  it("clears canceled and refused controlled drafts before the next request", async () => {
    const canceled = render({ onRowOrderChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel() });
    await moveRow(canceled);
    expect(canceled.emitted("update:rowOrder")).toBeUndefined();
    expect(names(canceled)).toEqual(["Ada", "Grace", "Lin"]);
    const update = vi.fn();
    const refused = render({ rowOrder: [1, "1", "c"], "onUpdate:rowOrder": update });
    await moveRow(refused);
    await moveRow(refused);
    expect(update.mock.calls.map(call => call[0])).toEqual([["1", 1, "c"], ["1", 1, "c"]]);
    expect(names(refused)).toEqual(["Ada", "Grace", "Lin"]);
    expect(rowHandle(refused).attributes("aria-pressed")).toBe("false");
  });

  it("keeps filtered, paged and server-page moves in the full supplied order", async () => {
    const filtered = render({ filters: { name: "a" } });
    await moveRow(filtered);
    expect(values(filtered, "update:rowOrder")).toEqual([["1", 1, "c"]]);
    const paged = render({ data: [...data, { id: "d", name: "Dee" }], paginate: true, pagination: { page: 2, pageSize: 2 } });
    await moveRow(paged);
    expect(values(paged, "update:rowOrder")).toEqual([[1, "1", "d", "c"]]);
    const server = render({ data: [data[2]!, { id: "d", name: "Dee" }], manualPagination: true, rowCount: 50 });
    await moveRow(server);
    expect(values(server, "update:rowOrder")).toEqual([["d", "c"]]);
  });

  it("preserves sorted and nested restrictions and selection-independent pickup", async () => {
    const sorted = render({ sorting: [{ id: "name", direction: "ascending" }] });
    await moveRow(sorted);
    expect(sorted.emitted("row-order-change")).toBeUndefined();
    const nested = render({ data: [{ id: 1, name: "Ada", children: [{ id: 2, name: "Child" }] }, data[2]!], getSubRows: row => row.children, expanded: [1] });
    expect(rowHandle(nested, 1).attributes("disabled")).toBeDefined();
    await moveRow(nested, "End");
    expect(values(nested, "update:rowOrder")).toEqual([["c", 1]]);
    const disabledSelection = render({ isRowSelectable: () => false });
    await moveRow(disabledSelection);
    expect(values(disabledSelection, "update:rowOrder")).toEqual([["1", 1, "c"]]);
  });

  it("cancels stale drafts when sorting, visible rows or reorder enablement changes", async () => {
    for (const changed of [{ sorting: [{ id: "name", direction: "ascending" as const }], manualSorting: true }, { data: data.slice(1) }, { rowReorder: false }]) {
      const wrapper = render();
      pointer(rowHandle(wrapper).element, "pointerdown", 0, 20);
      pointer(document, "pointermove", 0, 110);
      await frame();
      await wrapper.setProps(changed);
      pointer(document, "pointerup", 0, 110);
      expect(wrapper.emitted("row-order-change")).toBeUndefined();
    }
  });

  it("keeps leaf-only column pickup, locked destinations and RTL keyboard direction", async () => {
    const wrapper = render({ dir: "rtl" });
    const handle = columnHandle(wrapper);
    await handle.trigger("keydown", { key: " " });
    await handle.trigger("keydown", { key: "ArrowRight" });
    await handle.trigger("keydown", { key: "Enter" });
    expect(values(wrapper, "update:columnOrder")).toEqual([["name", "order", "extra"]]);
    expect(wrapper.find("th[data-akaza-column='order'] .akaza-data-table-column-reorder-handle").exists()).toBe(false);
  });

  it("renders no handles when reorder features are off and binds only leaf group targets", async () => {
    const off = render({ rowReorder: false, columnReorder: false });
    expect(off.find(".akaza-data-table-column-reorder-handle").exists()).toBe(false);
    expect(off.find(".akaza-data-table-reorder-handle").exists()).toBe(false);
    const grouped = render({ columns: [{ id: "identity", header: "Identity", children: columns }] });
    expect(grouped.find("th[data-akaza-column='identity'] .akaza-data-table-column-reorder-handle").exists()).toBe(false);
    const handle = columnHandle(grouped);
    await handle.trigger("keydown", { key: " " });
    await handle.trigger("keydown", { key: "ArrowRight" });
    await handle.trigger("keydown", { key: "Enter" });
    expect(values(grouped, "update:columnOrder")).toEqual([["order", "extra", "name"]]);
  });

  it.each(["ltr", "rtl"] as const)("uses %s column midpoints and the actual release destination", async (dir) => {
    const wrapper = render({ dir });
    const handle = columnHandle(wrapper).element;
    pointer(handle, "pointerdown", 150, 20);
    pointer(document, "pointermove", dir === "rtl" ? 40 : 260, 20);
    await frame();
    const release = pointer(document, "pointerup", dir === "rtl" ? 260 : 40, 20);
    await nextTick();
    expect(values(wrapper, "update:columnOrder")).toEqual([["name", "order", "extra"]]);
    expect(wrapper.emitted("column-order-change")?.[0]?.[1]).toMatchObject({ event: release });
  });

  it("suppresses only the click after a real resize/reorder drag", () => {
    for (const kind of ["resize", "reorder"] as const) {
      const clicked = vi.fn();
      const wrapper = render({ onClick: clicked });
      const handle = kind === "resize" ? resize(wrapper).element : columnHandle(wrapper).element;
      pointer(handle, "pointerdown", 100);
      pointer(document, "pointermove", 200);
      pointer(document, "pointerup", 200);
      const click = new MouseEvent("click", { bubbles: true, cancelable: true });
      handle.dispatchEvent(click);
      expect(clicked).not.toHaveBeenCalled();
      expect(click.defaultPrevented).toBe(true);
      handle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      expect(clicked).toHaveBeenCalledOnce();
    }
  });

  it("keeps keyed form contents and focus, without stealing unrelated focus", async () => {
    const wrapper = render();
    const handle = rowHandle(wrapper).element as HTMLButtonElement;
    const input = document.createElement("input");
    input.value = "unsaved";
    handle.closest("td")!.append(input);
    handle.focus();
    await moveRow(wrapper);
    await frame();
    expect(document.activeElement).toBe(handle);
    expect(input.value).toBe("unsaved");
    expect(input.isConnected).toBe(true);
    expect(wrapper.findAll("button").every(button => button.attributes("type") === "button")).toBe(true);
    input.focus();
    await moveRow(wrapper);
    await frame();
    expect(document.activeElement).toBe(input);
  });

  it("does not duplicate SDK reorder announcements in the result region", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = render({ labels: { reorderRow: index => `Announced row ${index + 1}` } });
      await moveRow(wrapper);
      await vi.advanceTimersByTimeAsync(1000);
      expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
      const text = [...document.body.querySelectorAll("[aria-live='assertive']")].map(region => region.textContent).join(" ");
      expect(text).toContain(reorderMessage({ type: "drop", key: "unused", label: "Announced row 1", count: 1, position: 2, total: 3 }));
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not announce a successful drop when the consumer cancels it", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = render({
        labels: { reorderRow: index => `Canceled row ${index + 1}` },
        onRowOrderChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel(),
      });
      await moveRow(wrapper);
      await vi.advanceTimersByTimeAsync(1000);
      const text = [...document.body.querySelectorAll("[aria-live='assertive']")].map(region => region.textContent).join(" ");
      expect(text).not.toContain(reorderMessage({ type: "drop", key: "unused", label: "Canceled row 1", count: 1, position: 2, total: 3 }));
    } finally {
      vi.useRealTimers();
    }
  });

  it("silently cleans active gestures on unmount and rejects non-primary presses", async () => {
    const wrapper = render({ columnResize: { update: "end" } });
    for (const init of [{ button: 1 }, { button: 2 }, { isPrimary: false }]) {
      pointer(resize(wrapper).element, "pointerdown", 100, 0, init);
      pointer(document, "pointerup", 140);
      pointer(rowHandle(wrapper).element, "pointerdown", 0, 20, init);
      pointer(document, "pointermove", 0, 110);
      pointer(document, "pointerup", 0, 110);
    }
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(document, "pointermove", 140);
    await frame();
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    pointer(document, "pointerup", 140);
    await frame();
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
  });
});
