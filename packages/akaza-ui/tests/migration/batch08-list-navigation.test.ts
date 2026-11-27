import type { AkazaChangeEventDetails } from "@/types";
import { checkPattern } from "@ui-sdk/core/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Combobox } from "@/components/combobox";
import { Select } from "@/components/select";

const mounted: Array<{ unmount: () => void }> = [];
const hosts: HTMLElement[] = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  hosts.splice(0).forEach(host => host.remove());
  vi.restoreAllMocks();
});

const options = [
  { type: "label" as const, label: "Group" },
  { value: "a", label: "Alpha" },
  { value: "skip", label: "Disabled", disabled: true },
  { type: "separator" as const },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];
type Kind = "select" | "search" | "combobox";

function setup(kind: Kind, props: Record<string, unknown> = {}) {
  const host = document.createElement("fieldset");
  document.body.append(host);
  hosts.push(host);
  const common = { options, ariaLabel: "Choice", ...props };
  const wrapper = kind === "combobox"
    ? mount(Combobox, { attachTo: host, props: common })
    : mount(Select, { attachTo: host, props: { ...common, autocomplete: kind === "search" } });
  mounted.push(wrapper);
  const control = () => wrapper.get(kind === "search" ? '[role="searchbox"]' : '[role="combobox"]');
  const highlighted = () => wrapper.find('[data-akaza-highlighted="true"]').text();
  const key = async (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    control().element.dispatchEvent(event);
    await flushPromises();
    return event;
  };
  const open = async () => {
    if (kind === "combobox") await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
    else await wrapper.get('[role="combobox"]').trigger("click");
    await flushPromises();
  };
  return { wrapper, host, control, highlighted, key, open };
}

for (const kind of ["select", "search", "combobox"] as const) {
  describe(`batch 08 ${kind} navigation`, () => {
    it("skips structural/disabled rows in both directions, wraps, and keeps selection separate", async () => {
      const { wrapper, control, highlighted, key, open } = setup(kind);
      await open();
      expect(highlighted()).toContain("Alpha");
      (control().element as HTMLElement).focus();
      expect((await key("ArrowDown")).defaultPrevented).toBe(true);
      expect(highlighted()).toContain("Beta");
      await key("ArrowUp");
      expect(highlighted()).toContain("Alpha");
      await key("ArrowUp");
      expect(highlighted()).toContain("Charlie");
      await key("ArrowDown");
      expect(highlighted()).toContain("Alpha");
      await key("End");
      expect(highlighted()).toContain("Charlie");
      await key("Home");
      expect(highlighted()).toContain("Alpha");
      expect(document.activeElement).toBe(control().element);
      expect(control().attributes("aria-activedescendant")).toBe(wrapper.get('[data-akaza-highlighted="true"]').attributes("id"));
      expect(wrapper.emitted("value-change")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await key("Enter");
      expect(wrapper.emitted("value-change")).toHaveLength(1);
      expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe("a");
      expect(wrapper.emitted("value-change")?.[0]?.[1]).toMatchObject({ reason: "select", event: expect.any(KeyboardEvent) });
    });

    it("respects no-wrap boundaries and current loop changes", async () => {
      const { wrapper, highlighted, key, open } = setup(kind, { loop: false });
      await open();
      await key("ArrowUp");
      expect(highlighted()).toContain("Alpha");
      await key("End");
      await key("ArrowDown");
      expect(highlighted()).toContain("Charlie");
      await wrapper.setProps({ loop: true });
      await key("ArrowDown");
      expect(highlighted()).toContain("Alpha");
    });

    it("preserves accepted highlight through reordered/replaced options and removes invalid targets", async () => {
      const { wrapper, control, highlighted, key, open } = setup(kind);
      await open();
      await key("ArrowDown");
      const beta = wrapper.get('[data-akaza-highlighted="true"]').element;
      await wrapper.setProps({ options: [options[4]!, options[5]!, options[1]!] });
      expect(highlighted()).toContain("Beta");
      expect(wrapper.get('[data-akaza-highlighted="true"]').element).toBe(beta);
      await key("ArrowDown");
      expect(highlighted()).toContain("Charlie");
      await wrapper.setProps({ options: [{ value: "new", label: "New result" }] });
      expect(highlighted()).toContain("New result");
      await wrapper.setProps({ options: [{ value: "new", label: "New result", disabled: true }] });
      expect(control().attributes("aria-activedescendant")).toBeUndefined();
      await key("End");
      await key("Enter");
      expect(wrapper.emitted("value-change")).toBeUndefined();
      await wrapper.setProps({ options: [] });
      await key("Home");
      expect(control().attributes("aria-activedescendant")).toBeUndefined();
      await wrapper.setProps({ options });
      await key("ArrowDown");
      expect(highlighted()).toContain("Beta");
    });

    it("does not navigate or select while loading, then reads fresh results", async () => {
      const { wrapper, control, highlighted, key, open } = setup(kind, { loading: true });
      await open();
      for (const value of ["ArrowDown", "ArrowUp", "Home", "End", "Enter"]) await key(value);
      expect(control().attributes("aria-activedescendant")).toBeUndefined();
      expect(wrapper.emitted("value-change")).toBeUndefined();
      await wrapper.setProps({ options: [{ value: "fresh", label: "Fresh" }], loading: false });
      await key("Home");
      expect(highlighted()).toContain("Fresh");
    });

    it("ignores IME, keyCode 229, modifiers, prevented and unsupported keys", async () => {
      const { wrapper, control, highlighted, key, open } = setup(kind);
      await open();
      for (const init of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
        for (const value of ["ArrowDown", "End", "Enter"]) {
          expect((await key(value, init)).defaultPrevented).toBe(false);
          expect(highlighted()).toContain("Alpha");
        }
      }
      const prevented = new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true });
      prevented.preventDefault();
      control().element.dispatchEvent(prevented);
      await flushPromises();
      expect(highlighted()).toContain("Alpha");
      for (const value of ["PageDown", "PageUp", "ArrowLeft", "ArrowRight"]) expect((await key(value)).defaultPrevented).toBe(false);
      expect(wrapper.emitted("value-change")).toBeUndefined();
      expect(wrapper.emitted("open-change")).toHaveLength(1);
    });

    it("ignores native disabled fieldsets and disabled prop changes", async () => {
      const { wrapper, host, highlighted, key, open } = setup(kind);
      await open();
      host.disabled = true;
      for (const value of ["ArrowDown", "Home", "End", "Enter"]) expect((await key(value)).defaultPrevented).toBe(false);
      expect(highlighted()).toContain("Alpha");
      await wrapper.get('[data-akaza-highlighted="true"]').trigger("click");
      expect(wrapper.emitted("value-change")).toBeUndefined();
      host.disabled = false;
      await wrapper.setProps({ disabled: true });
      await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
      expect(wrapper.get('[role="combobox"]').attributes("aria-expanded")).toBe("false");
    });

    it("cancels a selection without advancing the next navigation snapshot", async () => {
      const { wrapper, highlighted, key, open } = setup(kind, {
        onValueChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel(),
      });
      await open();
      await key("ArrowDown");
      await key("Enter");
      expect(highlighted()).toContain("Beta");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await key("ArrowUp");
      expect(highlighted()).toContain("Alpha");
    });

    it("bounds scroll effects to the owning viewport", async () => {
      const { wrapper, control, key, open } = setup(kind);
      await open();
      const prefix = kind === "combobox" ? "combobox" : "select";
      const viewport = wrapper.get(`.akaza-${prefix}-viewport`).element as HTMLElement;
      const beta = wrapper.findAll('[role="option"]')[2]!.element as HTMLElement;
      vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({ top: 100, bottom: 150, left: 0, right: 100 } as DOMRect);
      vi.spyOn(beta, "getBoundingClientRect").mockReturnValue({ top: 160, bottom: 180, left: 0, right: 100 } as DOMRect);
      Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 50 });
      Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 100 });
      const nativeScroll = vi.fn();
      Object.defineProperty(beta, "scrollIntoView", { configurable: true, value: nativeScroll });
      const pageScroll = document.documentElement.scrollTop;
      (control().element as HTMLElement).focus();
      await key("ArrowDown");
      expect(viewport.scrollTop).toBe(30);
      expect(document.documentElement.scrollTop).toBe(pageScroll);
      expect(nativeScroll).not.toHaveBeenCalled();
    });
  });
}

for (const kind of ["search", "combobox"] as const) {
  it(`batch 08 ${kind} retains highlight when search is canceled or rejected`, async () => {
    const { wrapper, highlighted, key, open, control } = setup(kind, {
      search: "",
      "onUpdate:search": () => {},
    });
    await open();
    await key("ArrowDown");
    await control().setValue("Char");
    expect(highlighted()).toContain("Beta");
    expect((control().element as HTMLInputElement).value).toBe("");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(4);
    await wrapper.setProps({ onSearchChange: (_value: string, details: AkazaChangeEventDetails) => details.cancel() });
    await control().setValue("Al");
    expect(highlighted()).toContain("Beta");
    await wrapper.setProps({ search: "Char" });
    expect(highlighted()).toContain("Charlie");
    await key("Home");
    expect(highlighted()).toContain("Charlie");
    await key("Enter");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe("c");
  });

  it(`batch 08 ${kind} accepts controlled search after the parent renders`, async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const search = ref("");
        return () => h(kind === "combobox" ? Combobox : Select, {
          options, ariaLabel: "Choices", autocomplete: true, open: kind === "search", search: search.value,
          "onUpdate:search": (next: string) => { search.value = next; },
        });
      },
    }), { attachTo: document.body });
    mounted.push(wrapper);
    await flushPromises();
    const input = wrapper.get(kind === "combobox" ? '[role="combobox"]' : '[role="searchbox"]');
    await input.setValue("Char");
    await flushPromises();
    expect((input.element as HTMLInputElement).value).toBe("Char");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    expect(wrapper.get('[data-akaza-highlighted="true"]').text()).toContain("Charlie");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.findComponent(kind === "combobox" ? Combobox : Select).emitted("value-change")?.[0]?.[0]).toBe("c");
  });
}

for (const kind of ["select", "combobox"] as const) {
  it(`batch 08 ${kind} does not highlight or scroll after canceled/rejected opening`, async () => {
    const { wrapper } = setup(kind, { open: false, "onUpdate:open": () => {} });
    const control = wrapper.get('[role="combobox"]');
    for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Enter"]) await control.trigger("keydown", { key });
    await flushPromises();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(control.attributes("aria-activedescendant")).toBeUndefined();
    await wrapper.setProps({ onOpenChange: (_open: boolean, details: AkazaChangeEventDetails) => details.cancel() });
    await control.trigger("keydown", { key: "ArrowDown" });
    await wrapper.setProps({ open: true });
    await flushPromises();
    expect(wrapper.get('[data-akaza-highlighted="true"]').text()).toContain("Alpha");
  });

  it(`batch 08 ${kind} preserves native values and accepted/canceled reset`, async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const value = ref("a");
        return () => h("form", [h(kind === "select" ? Select : Combobox, {
          options, ariaLabel: "Choices", name: "choice", multiple: false, modelValue: value.value,
          "onUpdate:modelValue": (next: unknown) => { value.value = next as string; },
        })]);
      },
    }), { attachTo: document.body });
    mounted.push(wrapper);
    const control = wrapper.get('[role="combobox"]');
    await control.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    await control.trigger("keydown", { key: "End" });
    await control.trigger("keydown", { key: "Enter" });
    await flushPromises();
    const form = wrapper.get("form").element as HTMLFormElement;
    expect(new FormData(form).get("choice")).toBe("c");
    const cancelReset = (event: Event) => event.preventDefault();
    form.addEventListener("reset", cancelReset);
    form.reset();
    await flushPromises();
    expect(new FormData(form).get("choice")).toBe("c");
    form.removeEventListener("reset", cancelReset);
    form.reset();
    await flushPromises();
    expect(new FormData(form).get("choice")).toBe("a");
    expect(control.attributes("aria-expanded")).toBe("false");
    expect(control.attributes("aria-activedescendant")).toBeUndefined();
  });

  it(`batch 08 ${kind} passes the rendered combobox pattern checker`, async () => {
    const { wrapper, open } = setup(kind);
    await open();
    await checkPattern(wrapper.element as HTMLElement, "combobox");
  });

  it(`batch 08 ${kind} retains accepted highlight when a controlled close is refused`, async () => {
    const { wrapper, key, highlighted } = setup(kind, { open: true, "onUpdate:open": () => {} });
    await flushPromises();
    await key("ArrowDown");
    await key("Escape");
    expect(wrapper.get('[role="combobox"]').attributes("aria-expanded")).toBe("true");
    expect(highlighted()).toContain("Beta");
    await key("ArrowDown");
    expect(highlighted()).toContain("Charlie");
  });
}

it("batch 08 Select preserves selected-on-open, edge-on-open and standalone typeahead targets", async () => {
  const { wrapper, key, highlighted, open } = setup("select", { modelValue: "b" });
  await open();
  expect(highlighted()).toContain("Beta");
  await key("Escape");
  await key("End");
  expect(highlighted()).toContain("Charlie");
  await key("Escape");
  await key("Home");
  expect(highlighted()).toContain("Alpha");
  await key("Escape");
  await key("c");
  expect(highlighted()).toContain("Charlie");
  expect(wrapper.emitted("value-change")).toBeUndefined();
});

it("batch 08 Combobox uses custom object equality without changing slot identity", async () => {
  const { wrapper, key, open, highlighted } = setup("combobox", {
    options: [{ value: { id: 1 }, label: "One" }, { value: { id: 2 }, label: "Two" }],
    isEqual: (left: { id: number }, right: { id: number }) => left.id === right.id,
    serializeValue: (value: { id: number }) => String(value.id),
  });
  await open();
  await key("ArrowDown");
  const two = wrapper.get('[data-akaza-highlighted="true"]').element;
  await wrapper.setProps({ options: [{ value: { id: 2 }, label: "Two updated" }, { value: { id: 1 }, label: "One" }] });
  expect(highlighted()).toContain("Two updated");
  expect(wrapper.get('[data-akaza-highlighted="true"]').element).toBe(two);
  await key("ArrowDown");
  expect(highlighted()).toContain("One");
});

it("batch 08 Combobox read-only state blocks navigation without changing the accepted highlight", async () => {
  const { wrapper, key, highlighted } = setup("combobox", { open: true, readOnly: true });
  await flushPromises();
  for (const value of ["ArrowDown", "ArrowUp", "Home", "End", "Enter"]) expect((await key(value)).defaultPrevented).toBe(false);
  expect(highlighted()).toContain("Alpha");
  expect(wrapper.emitted("value-change")).toBeUndefined();
});

it("batch 08 Select Space activates once and Shift arrows only change highlight", async () => {
  const { wrapper, key, highlighted, open } = setup("select", { multiple: true });
  await open();
  await key("ArrowDown", { shiftKey: true });
  expect(highlighted()).toContain("Beta");
  expect(wrapper.emitted("value-change")).toBeUndefined();
  await key(" ");
  expect(wrapper.emitted("value-change")).toHaveLength(1);
  expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["b"]);
});

it("batch 08 Select discards a pending edge-on-open request on unmount", async () => {
  const { wrapper } = setup("select");
  wrapper.get('[role="combobox"]').element.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
  wrapper.unmount();
  mounted.splice(mounted.indexOf(wrapper), 1);
  await flushPromises();
  expect(document.querySelector('[role="listbox"]')).toBeNull();
});

it("batch 08 keeps initially open navigation SSR markup stable through hydration", async () => {
  const render = () => h("div", [
    h(Select, { options, open: true, modelValue: "b", ariaLabel: "Select" }),
    h(Combobox, { options, open: true, ariaLabel: "Combobox", openOnFocus: false }),
  ]);
  const html = await renderToString(createSSRApp({ render }));
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);
  const warning = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  const app = createSSRApp({ render });
  app.mount(host);
  mounted.push(app);
  await flushPromises();
  expect(warning).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  const controls = host.querySelectorAll('[role="combobox"]');
  for (const control of controls) {
    const id = control.getAttribute("aria-activedescendant");
    expect(id).toBeTruthy();
    expect(host.querySelector(`[id="${id}"]`)).not.toBeNull();
    control.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
  }
  await flushPromises();
  expect(host.querySelectorAll('[data-akaza-highlighted="true"]')).toHaveLength(2);
});
