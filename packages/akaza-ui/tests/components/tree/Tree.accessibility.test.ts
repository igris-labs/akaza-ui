import type { TreeController, TreeKey, TreeProps } from "@/components/tree";
import { within } from "@testing-library/vue";
import { checkPattern } from "@ui-sdk/core/testing";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Tree } from "@/components/tree";

interface Item {
  id: TreeKey;
  label: string;
  children?: Item[];
  lazy?: boolean;
  disabled?: boolean;
  slot?: string;
}

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

const nested: Item[] = [
  { id: "src", label: "Source", children: [
    { id: "components", label: "Components", children: [{ id: 1, label: "Button.vue" }] },
    { id: "utils", label: "Utilities" },
  ] },
  { id: "package", label: "Package.json" },
];

function renderTree(props: Partial<TreeProps<Item>> = {}, slots = {}) {
  const wrapper = mount(Tree<Item>, {
    attachTo: document.body,
    props: {
      items: nested, itemKey: "id", defaultExpanded: ["src", "components"],
      ariaLabel: "Project files", transition: false, ...props,
    },
    slots,
  });
  mounted.push(wrapper);
  return wrapper;
}

function row(wrapper: ReturnType<typeof renderTree>, name: string) {
  return within(wrapper.element as HTMLElement).getByRole("treeitem", { name, exact: true });
}

async function press(element: HTMLElement, key: string) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  await nextTick();
  await nextTick();
  return event;
}

function expectOneTabStop(wrapper: ReturnType<typeof renderTree>, name: string) {
  expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
  expect(row(wrapper, name).tabIndex).toBe(0);
}

describe("tree accessibility", () => {
  it.each([false, true])("checks default nested markup, expanded child=%s, against only the proven beta.17 mismatches", async (expandedChild) => {
    const wrapper = renderTree({ defaultExpanded: expandedChild ? ["src", "components"] : ["src"] });
    await nextTick();
    const source = row(wrapper, "Source");
    const child = row(wrapper, "Components");
    // Tree.sdk-pattern.test.ts proves these exact failures on independent nested APG markup.
    const problems = [
      `checkPattern found ${expandedChild ? "2 problems" : "1 problem"} with the tree pattern:`,
      '- button "›": is a button inside a tree, which owns only treeitem elements (APG tree view).',
    ];
    if (expandedChild) problems.push(`- div#${child.id}[role=treeitem]: ArrowLeft on a child should move focus to its parent, div#${source.id}[role=treeitem] (APG tree view).`);
    await expect(checkPattern(wrapper.element, "tree")).rejects.toThrow(new Error(problems.join("\n")));
  });

  it("names default rows from their labels, not toggle, indicator, action or status text", async () => {
    const wrapper = renderTree({}, {
      indicator: () => "Selected",
      trailing: () => h("button", { type: "button", tabindex: -1 }, "Rename"),
    });
    for (const name of ["Source", "Components", "Button.vue", "Utilities", "Package.json"]) {
      const item = row(wrapper, name);
      const labelId = item.getAttribute("aria-labelledby")!;
      expect(document.getElementById(labelId)?.closest('[role="treeitem"]')).toBe(item);
    }
    expect(within(wrapper.element as HTMLElement).getByRole("button", { name: "Collapse Source" }).tabIndex).toBe(-1);
    expectOneTabStop(wrapper, "Source");
    const components = row(wrapper, "Components");
    components.focus();
    await press(components, "s");
    expect(document.activeElement).toBe(row(wrapper, "Source"));
    expectOneTabStop(wrapper, "Source");
  });

  it("keeps APG expand/child/collapse/parent keys and typed selection on realistic nested rows", async () => {
    const wrapper = renderTree({ defaultExpanded: [] });
    const source = row(wrapper, "Source");
    source.focus();
    await press(source, "ArrowRight");
    expect(document.activeElement).toBe(source);
    expect(source.getAttribute("aria-expanded")).toBe("true");
    await press(source, "ArrowRight");
    const components = row(wrapper, "Components");
    expect(document.activeElement).toBe(components);
    await press(components, "ArrowRight");
    expect(document.activeElement).toBe(components);
    await press(components, "ArrowRight");
    const button = row(wrapper, "Button.vue");
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute("aria-expanded")).toBe(false);
    await press(button, " ");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(1);
    await press(button, "ArrowLeft");
    expect(document.activeElement).toBe(components);
    await press(components, "ArrowLeft");
    expect(document.activeElement).toBe(components);
    expect(components.getAttribute("aria-expanded")).toBe("false");
    await press(components, "ArrowLeft");
    expect(document.activeElement).toBe(source);
    await press(source, "End");
    expect(document.activeElement).toBe(row(wrapper, "Package.json"));
    await press(row(wrapper, "Package.json"), "ArrowUp");
    expect(document.activeElement).toBe(row(wrapper, "Utilities"));
    await press(row(wrapper, "Utilities"), "ArrowDown");
    await press(row(wrapper, "Package.json"), "Home");
    expect(document.activeElement).toBe(source);
    expectOneTabStop(wrapper, "Source");
    await press(source, "Enter");
    expect(wrapper.emitted("activate")?.at(-1)?.[0]).toEqual(nested[0]);
  });

  it("keeps lazy names stable while busy, then exposes loaded sibling metadata and recovery", async () => {
    const wrapper = renderTree({
      items: [{ id: "remote", label: "Remote", lazy: true }],
      defaultExpanded: [], hasChildren: item => !!item.lazy,
    });
    const remote = row(wrapper, "Remote");
    remote.focus();
    await press(remote, "ArrowRight");
    await wrapper.setProps({ loadingKeys: ["remote"] });
    expect(remote.getAttribute("aria-busy")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toBe("Loading Remote...");
    expect(row(wrapper, "Remote")).toBe(remote);
    await wrapper.setProps({
      loadingKeys: [],
      items: [{ id: "remote", label: "Remote", lazy: true, children: [
        { id: 1, label: "Numeric child" }, { id: "1", label: "String child" },
      ] }],
    });
    expect(remote.hasAttribute("aria-busy")).toBe(false);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    await press(remote, "ArrowRight");
    const numeric = row(wrapper, "Numeric child");
    expect(document.activeElement).toBe(numeric);
    expect(["aria-level", "aria-posinset", "aria-setsize"].map(attr => numeric.getAttribute(attr))).toEqual(["2", "1", "2"]);
    await press(numeric, " ");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(1);
    await press(numeric, "ArrowDown");
    const string = row(wrapper, "String child");
    await press(string, "Enter");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe("1");
    await wrapper.setProps({ items: [{ id: "remote", label: "Remote", lazy: true }] });
    await vi.waitFor(() => expect(document.activeElement).toBe(remote));
    expectOneTabStop(wrapper, "Remote");
  });

  it("uses visible label-slot content and labelKey for full item replacements", () => {
    const wrapper = renderTree({ items: [
      { id: "default", label: "Data name" },
      { id: "custom", label: "Custom accessible name", slot: "custom" },
    ] }, {
      "label": () => h("span", "Visible name"),
      "item-custom": () => [h("button", { type: "button", tabindex: -1 }, "Action"), h("span", "Custom accessible name")],
    });
    expect(row(wrapper, "Visible name").hasAttribute("aria-label")).toBe(false);
    expect(row(wrapper, "Custom accessible name").hasAttribute("aria-labelledby")).toBe(false);
  });

  it.each(["Enter", " ", "ArrowDown", "Home", "a"])("leaves native input %s keys and form data slot-owned", async (key) => {
    const wrapper = renderTree({}, {
      trailing: () => h("input", { name: "filename", value: "draft", "aria-label": "Filename" }),
    });
    const input = wrapper.get<HTMLInputElement>("input").element;
    input.focus();
    const event = await press(input, key);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("draft");
    expect(wrapper.emitted("focus-change")).toBeUndefined();
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(wrapper.emitted("activate")).toBeUndefined();
    const form = document.createElement("form");
    wrapper.element.before(form);
    form.append(wrapper.element);
    expect(new FormData(form).get("filename")).toBe("draft");
    form.remove();
  });

  it("leaves generated toggle activation native while preserving click expansion and focus", async () => {
    const wrapper = renderTree({ defaultExpanded: [] });
    const toggle = wrapper.get<HTMLButtonElement>("button");
    toggle.element.focus();
    const event = await press(toggle.element, "Enter");
    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(wrapper.emitted("activate")).toBeUndefined();
    await toggle.trigger("click");
    expect(row(wrapper, "Source").getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(row(wrapper, "Source"));
    expectOneTabStop(wrapper, "Source");
  });

  it("keeps a named keyboard entry point across offscreen selection, distant keys and manual virtual scrolling", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Results", children: Array.from({ length: 100 }, (_, index) => ({
        id: index, label: `Result ${index}`, disabled: index === 98,
      })) }],
      defaultExpanded: ["root"], defaultValue: 99,
      virtualize: { height: 60, itemHeight: 20, overscan: 1 },
    });
    const viewport = wrapper.get<HTMLElement>('[role="tree"]').element;
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 60 });
    viewport.scrollTo = (options: ScrollToOptions) => {
      viewport.scrollTop = options.top ?? 0;
      viewport.dispatchEvent(new Event("scroll"));
    };
    await nextTick();
    expectOneTabStop(wrapper, "Results");
    row(wrapper, "Results").focus();
    await press(row(wrapper, "Results"), "End");
    const last = row(wrapper, "Result 99");
    expect(document.activeElement).toBe(last);
    expect(["aria-level", "aria-posinset", "aria-setsize"].map(attr => last.getAttribute(attr))).toEqual(["2", "100", "100"]);
    expect(last.getAttribute("aria-selected")).toBe("true");
    expectOneTabStop(wrapper, "Result 99");
    expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(10);
    await press(last, "ArrowUp");
    expect(document.activeElement).toBe(row(wrapper, "Result 97"));
    await press(row(wrapper, "Result 97"), "ArrowDown");
    await press(row(wrapper, "Result 99"), "Home");
    const rootId = row(wrapper, "Results").id;
    viewport.scrollTop = 800;
    viewport.dispatchEvent(new Event("scroll"));
    await nextTick();
    await nextTick();
    expect(viewport.scrollTop).toBe(800);
    expect(wrapper.findAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1);
    const entry = wrapper.get<HTMLElement>('[role="treeitem"][tabindex="0"]').element;
    expect(entry.getAttribute("aria-level")).toBe("2");
    entry.focus();
    await press(entry, "Home");
    expect(document.activeElement).toBe(row(wrapper, "Results"));
    expect(row(wrapper, "Results").id).toBe(rootId);
    const tree = (wrapper.vm as unknown as { tree: TreeController<Item> }).tree;
    expect(tree.selectedKeys.value).toBe(99);
  });
});
