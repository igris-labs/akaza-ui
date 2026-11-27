import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import type { DataTableColumn, DataTableController, DataTableProps, DataTableRowKey } from "@/components/data-table";
import type { AkazaChangeEventDetails } from "@/types";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { DataTable } from "@/components/data-table";

interface Row {
  id: DataTableRowKey;
  name: string;
  children?: Row[];
}

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
  isPrimary = true;
  constructor(type: string, init: PointerEventInit) {
    super(type, init);
    this.pointerId = init.pointerId ?? 16;
    this.pointerType = init.pointerType ?? "mouse";
  }
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

function frame() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach(callback => callback(16));
}

function render(props: Partial<DataTableProps<Row>> & Record<string, unknown> = {}) {
  const wrapper = mount(DataTable<Row>, {
    attachTo: document.body,
    props: { data, columns, rowKey: "id", columnResize: true, columnReorder: true, rowReorder: true, ...props },
  });
  wrappers.push(wrapper);
  wrapper.findAll(".akaza-data-table-row").forEach((row, index) => {
    row.element.getBoundingClientRect = () => new DOMRect(0, index * 40, 340, 40);
  });
  wrapper.findAll("th[data-akaza-column]").forEach((column, index) => {
    column.element.getBoundingClientRect = () => new DOMRect(index * 100, 0, 100, 40);
  });
  return wrapper;
}

function pointer(target: EventTarget, type: string, x = 0, options: { y?: number; id?: number; button?: number; pointerType?: string } = {}) {
  const event = new TestPointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: options.button ?? 0,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: x,
    clientY: options.y ?? 0,
    pointerId: options.id ?? 16,
    pointerType: options.pointerType ?? "mouse",
  });
  (target === window ? document : target).dispatchEvent(event);
  return event;
}

function resize(wrapper: VueWrapper, column = "name") {
  return wrapper.get(`th[data-akaza-column='${column}'] .akaza-data-table-resize-handle`);
}

function rowHandles(wrapper: VueWrapper) {
  return wrapper.findAll(".akaza-data-table-reorder-handle");
}

function columnHandle(wrapper: VueWrapper, column = "name") {
  return wrapper.get(`th[data-akaza-column='${column}'] .akaza-data-table-column-reorder-handle`);
}

function values(wrapper: VueWrapper, event: string) {
  return wrapper.emitted(event)?.map(args => args[0]);
}

function rowNames(wrapper: VueWrapper) {
  return wrapper.findAll("tbody td[data-akaza-column='name']").map(cell => cell.text());
}

async function dropOn(handle: DOMWrapper<Element>, target: Element) {
  const rect = target.getBoundingClientRect();
  pointer(handle.element, "pointerdown", 150);
  pointer(window, "pointermove", rect.left, { y: rect.top + rect.height });
  const event = pointer(window, "pointerup", rect.left, { y: rect.top + rect.height });
  await nextTick();
  return event;
}

async function reorderKey(handle: DOMWrapper<Element>, key: string) {
  await handle.trigger("keydown", { key: " " });
  await handle.trigger("keydown", { key });
  await handle.trigger("keydown", { key: "Enter" });
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("batch 16 DataTable resize contracts updated for SDK adoption", () => {
  it("samples moves by frame with original events, rounding before bounds", () => {
    const change = vi.fn();
    const wrapper = render({ onColumnSizingChange: change });
    pointer(resize(wrapper).element, "pointerdown", 100);
    const first = pointer(window, "pointermove", 110.5);
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    frame();
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 161 }]);
    const second = pointer(window, "pointermove", 300);
    frame();
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 161 }, { name: 200 }]);
    expect(change.mock.calls.map(call => call[1])).toEqual([
      expect.objectContaining({ reason: "resize", event: first }),
      expect.objectContaining({ reason: "resize", event: second }),
    ]);
    pointer(window, "pointerup", 300);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it("commits update=end once using release coordinates rather than the last move", () => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 125.5);
    pointer(window, "pointermove", 130);
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    const release = pointer(window, "pointerup", 195);
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 200 }]);
    expect(wrapper.emitted("column-sizing-change")?.[0]?.[1]).toMatchObject({ reason: "resize", event: release });
  });

  it("cancels update=end without committing and clears tracking", () => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 120);
    pointer(window, "pointercancel", 120);
    pointer(window, "pointermove", 190);
    pointer(window, "pointerup", 190);
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
  });

  it("keeps the no-movement update=end resize request and ignores unrelated pointers", () => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 180, { id: 99 });
    pointer(window, "pointerup", 180, { id: 99 });
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    pointer(window, "pointerup", 100);
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 150 }]);
  });

  it.each(["touch", "pen"])("uses the same resize callback stages for synthetic %s pointers", (pointerType) => {
    const wrapper = render({ columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 0, { pointerType });
    pointer(window, "pointermove", 25, { pointerType });
    expect(wrapper.emitted("column-sizing-change")).toBeUndefined();
    const event = pointer(window, "pointerup", 25, { pointerType });
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 175 }]);
    expect(wrapper.emitted("column-sizing-change")?.[0]?.[1]).toMatchObject({ event });
  });

  it("honors each canceled move before a later accepted move in the same session", () => {
    const change = vi.fn((_value, details: AkazaChangeEventDetails) => {
      if (change.mock.calls.length === 1) details.cancel();
    });
    const wrapper = render({ onColumnSizingChange: change });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 110);
    frame();
    expect(wrapper.emitted("update:columnSizing")).toBeUndefined();
    pointer(window, "pointermove", 125);
    pointer(window, "pointerup", 125);
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 175 }]);
  });

  it("does not show a refused controlled resize and retries from the accepted width", async () => {
    const update = vi.fn();
    const wrapper = render({ columnSizing: { name: 150 }, "onUpdate:columnSizing": update });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 125);
    pointer(window, "pointerup", 125);
    await nextTick();
    expect(update).toHaveBeenCalledWith({ name: 175 });
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
    await resize(wrapper).trigger("keydown", { key: "ArrowLeft" });
    expect(update).toHaveBeenLastCalledWith({ name: 140 });
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
  });

  it("preserves RTL pointer bounds and fractional keyboard step rounding, Home and double click", async () => {
    const wrapper = render({ dir: "rtl", columnResize: { keyboardStep: 2.5 } });
    pointer(resize(wrapper).element, "pointerdown", 100);
    pointer(window, "pointermove", 200);
    pointer(window, "pointerup", 200);
    await nextTick();
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("100");
    await resize(wrapper).trigger("keydown", { key: "ArrowLeft" });
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("103");
    await resize(wrapper).trigger("keydown", { key: "ArrowRight" });
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("101");
    await resize(wrapper).trigger("keydown", { key: "Home" });
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
    await resize(wrapper).trigger("keydown", { key: "ArrowLeft" });
    await resize(wrapper).trigger("dblclick");
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
  });

  it("uses the fallback keyboard step and preserves bounded fit resizing total width", async () => {
    const wrapper = render({ columnResize: { behavior: "fit", keyboardStep: Number.NaN } });
    await resize(wrapper).trigger("keydown", { key: "ArrowRight" });
    expect(values(wrapper, "update:columnSizing")).toEqual([{ name: 160, extra: 140 }]);
    pointer(resize(wrapper).element, "pointerdown", 0);
    pointer(window, "pointermove", 500);
    pointer(window, "pointerup", 500);
    await nextTick();
    expect(values(wrapper, "update:columnSizing")?.at(-1)).toEqual({ name: 200, extra: 100 });
    expect(wrapper.get("table").attributes("style")).toContain("width: 340px");
  });

  it("suppresses the SDK click after resizing", () => {
    const clicked = vi.fn();
    const wrapper = render({ onClick: clicked });
    const handle = resize(wrapper).element;
    pointer(handle, "pointerdown", 0);
    pointer(window, "pointermove", 20);
    pointer(window, "pointerup", 20);
    handle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(clicked).not.toHaveBeenCalled();
  });

  it("ignores secondary-button resize presses and disposes active resize on unmount", () => {
    const change = vi.fn();
    const wrapper = render({ onColumnSizingChange: change, columnResize: { update: "end" } });
    pointer(resize(wrapper).element, "pointerdown", 0, { button: 2 });
    pointer(window, "pointermove", 20);
    pointer(window, "pointerup", 20);
    expect(change).not.toHaveBeenCalled();
    pointer(resize(wrapper).element, "pointerdown", 0);
    pointer(window, "pointermove", 20);
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    pointer(window, "pointerup", 20);
    pointer(window, "pointercancel", 20);
    expect(change).not.toHaveBeenCalled();
  });
});

describe("batch 16 DataTable reorder contracts updated for SDK adoption", () => {
  it("uses thresholded geometry, commits on release and preserves number/string keys", async () => {
    const wrapper = render();
    pointer(rowHandles(wrapper)[0]!.element, "pointerdown", 0);
    pointer(window, "pointermove", 0, { y: 65 });
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    const release = pointer(window, "pointerup", 0, { y: 65 });
    await Promise.resolve();
    await nextTick();
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", 1, "c"]]);
    expect(wrapper.emitted("row-order-change")?.[0]?.[1]).toMatchObject({ reason: "reorder", event: release });
    expect(rowNames(wrapper)).toEqual(["Grace", "Ada", "Lin"]);
    expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
    pointer(window, "pointerup", 1);
    expect(wrapper.emitted("row-order-change")).toHaveLength(1);
    expect(wrapper.findAll("[aria-live]")).toHaveLength(1);
  });

  it("cancels pointer reorder without callbacks and ignores foreign pointers", async () => {
    const wrapper = render();
    pointer(rowHandles(wrapper)[0]!.element, "pointerdown");
    pointer(window, "pointermove", 1, { id: 99 });
    pointer(window, "pointerup", 1, { id: 99 });
    pointer(window, "pointermove", 0, { y: 65 });
    pointer(window, "pointercancel", 1);
    pointer(window, "pointerup", 1);
    await nextTick();
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
  });

  it("does not reorder a press with no moves", async () => {
    const wrapper = render();
    pointer(rowHandles(wrapper)[0]!.element, "pointerdown");
    pointer(window, "pointerup", 100);
    await nextTick();
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
  });

  it("honors drop cancellation without a model update or success announcement", async () => {
    const canceled = vi.fn((_value, details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = render({ onRowOrderChange: canceled });
    await dropOn(rowHandles(wrapper)[0]!, wrapper.findAll(".akaza-data-table-row")[1]!.element);
    expect(canceled).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:rowOrder")).toBeUndefined();
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
  });

  it("does not render refused controlled drops or retain a draft for the next action", async () => {
    const update = vi.fn();
    const wrapper = render({ rowOrder: [1, "1", "c"], "onUpdate:rowOrder": update });
    await dropOn(rowHandles(wrapper)[0]!, wrapper.findAll(".akaza-data-table-row")[1]!.element);
    expect(update).toHaveBeenCalledWith(["1", 1, "c"]);
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(update).toHaveBeenLastCalledWith(["1", 1, "c"]);
    expect(update).toHaveBeenCalledTimes(2);
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
  });

  it("keeps focus on a refused controlled handle and never steals unrelated focus", async () => {
    const wrapper = render({ rowOrder: [1, "1", "c"], "onUpdate:rowOrder": vi.fn() });
    const handle = rowHandles(wrapper)[0]!.element as HTMLButtonElement;
    handle.focus();
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(document.activeElement).toBe(handle);
    const outside = document.createElement("button");
    document.body.append(outside);
    try {
      outside.focus();
      await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });

  it("reorders staged keyboard drafts in both row directions", async () => {
    const wrapper = render();
    await rowHandles(wrapper)[0]!.trigger("keydown", { key: " " });
    await rowHandles(wrapper)[0]!.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", 1, "c"]]);
    await reorderKey(rowHandles(wrapper)[1]!, "ArrowUp");
    expect(values(wrapper, "update:rowOrder")?.at(-1)).toEqual([1, "1", "c"]);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowUp");
    expect(wrapper.emitted("row-order-change")).toHaveLength(2);
  });

  it("preserves RTL column moves, leaf-only handles, locked source columns and canceled columns", async () => {
    const canceled = vi.fn((_value, details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = render({ dir: "rtl", onColumnOrderChange: canceled });
    expect(wrapper.find("th[data-akaza-column='order'] .akaza-data-table-column-reorder-handle").exists()).toBe(false);
    await reorderKey(columnHandle(wrapper), "ArrowLeft");
    expect(canceled).toHaveBeenCalledWith(["order", "extra", "name"], expect.objectContaining({ reason: "reorder" }));
    expect(wrapper.emitted("update:columnOrder")).toBeUndefined();
    await wrapper.setProps({ onColumnOrderChange: undefined });
    await reorderKey(columnHandle(wrapper), "ArrowRight");
    expect(values(wrapper, "update:columnOrder")).toEqual([["name", "order", "extra"]]);
  });

  it("drops columns onto locked targets without changing their pickup restriction", async () => {
    const wrapper = render();
    const event = await dropOn(columnHandle(wrapper), wrapper.get("th[data-akaza-column='order']").element);
    expect(values(wrapper, "update:columnOrder")).toEqual([["name", "order", "extra"]]);
    expect(wrapper.emitted("column-order-change")?.[0]?.[1]).toMatchObject({ reason: "reorder", event });
    expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
  });

  it("moves filtered rows in full supplied order rather than dropping hidden keys", async () => {
    const wrapper = render({ filters: { name: "a" } });
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace"]);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", 1, "c"]]);
  });

  it("moves paged rows in full supplied order and server rows only in the supplied page", async () => {
    const fourth = { id: "d", name: "Dee" };
    const wrapper = render({ data: [...data, fourth], paginate: true, pagination: { page: 2, pageSize: 2 } });
    expect(rowNames(wrapper)).toEqual(["Lin", "Dee"]);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(values(wrapper, "update:rowOrder")).toEqual([[1, "1", "d", "c"]]);
    const server = render({ data: [data[2]!, fourth], manualPagination: true, rowCount: 50 });
    await reorderKey(rowHandles(server)[0]!, "ArrowDown");
    expect(values(server, "update:rowOrder")).toEqual([["d", "c"]]);
  });

  it("blocks sorted and nested rows, and group resize/reorder handles", async () => {
    const sorted = render({ sorting: [{ id: "name", direction: "ascending" }] });
    expect(rowHandles(sorted).every(handle => (handle.element as HTMLButtonElement).disabled)).toBe(true);
    await reorderKey(rowHandles(sorted)[0]!, "ArrowDown");
    expect(sorted.emitted("row-order-change")).toBeUndefined();
    const nested = render({
      data: [{ id: "parent", name: "Parent", children: [{ id: "child", name: "Child" }] }, data[2]!],
      getSubRows: (row: Row) => row.children,
      expanded: ["parent"],
      columns: [{ id: "identity", header: "Identity", children: columns }],
    });
    expect(rowHandles(nested)[1]!.attributes("disabled")).toBeDefined();
    expect(nested.find("th[data-akaza-column='identity'] .akaza-data-table-resize-handle").exists()).toBe(false);
    expect(nested.find("th[data-akaza-column='identity'] .akaza-data-table-column-reorder-handle").exists()).toBe(false);
  });

  it("rechecks sorted restrictions at release rather than committing a stale drag", async () => {
    const wrapper = render();
    pointer(rowHandles(wrapper)[0]!.element, "pointerdown");
    pointer(window, "pointermove", 0, { y: 65 });
    await wrapper.setProps({ sorting: [{ id: "name", direction: "ascending" }], manualSorting: true });
    pointer(window, "pointerup", 1);
    await nextTick();
    expect(wrapper.emitted("row-order-change")).toBeUndefined();
    expect(wrapper.get(".akaza-data-table-live-region").text()).toBe("3 results");
  });

  it("does not reinterpret selection-disabled rows as reorder-disabled rows", async () => {
    const wrapper = render({ isRowSelectable: () => false });
    expect(wrapper.get(".akaza-data-table-row").attributes("data-akaza-disabled")).toBe("true");
    expect((rowHandles(wrapper)[0]!.element as HTMLButtonElement).disabled).toBe(false);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    expect(values(wrapper, "update:rowOrder")).toEqual([["1", 1, "c"]]);
  });

  it("cleans active reorder on unmount without a late callback", () => {
    const change = vi.fn();
    const wrapper = render({ onRowOrderChange: change });
    pointer(rowHandles(wrapper)[0]!.element, "pointerdown");
    pointer(window, "pointermove", 0, { y: 65 });
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    pointer(window, "pointerup", 1);
    expect(change).not.toHaveBeenCalled();
  });

  it("keeps form controls non-submitting and leaves the existing reset transaction cancelable", async () => {
    const canceled = vi.fn((details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = render({ onResetChange: canceled });
    expect(wrapper.findAll("button").every(button => button.attributes("type") === "button")).toBe(true);
    await reorderKey(rowHandles(wrapper)[0]!, "ArrowDown");
    await resize(wrapper).trigger("keydown", { key: "ArrowRight" });
    const { table } = wrapper.vm as unknown as { table: DataTableController<Row> };
    expect(table.reset()).toBe(false);
    expect(table.rowOrder.value).toEqual(["1", 1, "c"]);
    expect(table.columnSizing.value).toEqual({ name: 160 });
    await wrapper.setProps({ onResetChange: undefined });
    expect(table.reset()).toBe(true);
    await nextTick();
    expect(rowNames(wrapper)).toEqual(["Ada", "Grace", "Lin"]);
    expect(resize(wrapper).attributes("aria-valuenow")).toBe("150");
  });
});
