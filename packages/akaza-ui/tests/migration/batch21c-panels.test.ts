import type { PanelBinding } from "@ui-sdk/core";
import { bindPanel } from "@ui-sdk/core";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Accordion } from "@/components/accordion";
import { Collapsible } from "@/components/collapsible";
import "./panel-motion";

vi.mock("@ui-sdk/core", async (original) => {
  const sdk = await original<typeof import("@ui-sdk/core")>();
  return { ...sdk, bindPanel: vi.fn(sdk.bindPanel) };
});

const mounted: Array<{ unmount: () => void }> = [];

function holdAnimation(element: HTMLElement) {
  const computedStyle = window.getComputedStyle.bind(window);
  // jsdom cannot compute pseudo-element styles; keep the real element's CSS timing.
  vi.spyOn(window, "getComputedStyle").mockImplementation(target => computedStyle(target));
  element.style.transition = "height 0.5s";
  element.style.transitionDuration = "0.5s";
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => { finish = resolve; });
  const animation = {
    finished,
    playState: "running",
    effect: { getComputedTiming: () => ({ endTime: 500 }) },
  } as unknown as Animation;
  vi.spyOn(element, "getAnimations").mockReturnValue([animation]);
  return finish;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(async () => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  await vi.runAllTimersAsync();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.mocked(bindPanel).mockClear();
  document.body.replaceChildren();
});

describe.each(["accordion", "collapsible"] as const)("%s public SDK panel owner", kind => {
  function render(open = false, unmountOnHide = false) {
    const wrapper = kind === "accordion"
      ? mount(Accordion, {
          props: { items: [{ value: "a", label: "Alpha", slot: "named" }], modelValue: open ? "a" : "", unmountOnHide, collapsible: true },
          slots: { named: ({ value, isOpen }) => h("input", { "aria-label": "Draft", "data-value": value, "data-open": isOpen }) },
          attachTo: document.body,
        })
      : mount(Collapsible, {
          props: { modelValue: open, unmountOnHide },
          slots: { trigger: "Details", content: ({ isOpen }) => h("input", { "aria-label": "Draft", "data-open": isOpen }) },
          attachTo: document.body,
        });
    mounted.push(wrapper);
    return {
      wrapper,
      panel: wrapper.get<HTMLElement>("[role=region]"),
      trigger: wrapper.get<HTMLButtonElement>("button"),
      setOpen: async (value: boolean) => {
        await wrapper.setProps({ modelValue: kind === "accordion" ? (value ? "a" : "") : value });
      },
    };
  }

  it("binds once, sizes real CSS variables, and keeps default closed descendants inaccessible", async () => {
    const { wrapper, panel, trigger, setOpen } = render();
    expect(bindPanel).toHaveBeenCalledOnce();
    expect(vi.mocked(bindPanel).mock.calls[0]![0]).toBe(panel.element);
    expect(panel.attributes()).toMatchObject({ hidden: "", "aria-hidden": "true" });
    expect(panel.attributes("inert")).toBeDefined();
    const binding = vi.mocked(bindPanel).mock.calls[0]![1];
    expect(binding.trigger()).toBe(trigger.element);
    expect(binding.isFindable()).toBe(false);
    const input = wrapper.get<HTMLInputElement>("input").element;
    input.value = "kept";
    await setOpen(true);
    await vi.runAllTimersAsync();
    expect(panel.attributes("hidden")).toBeUndefined();
    expect(panel.attributes("inert")).toBeUndefined();
    expect(panel.attributes("aria-hidden")).toBeUndefined();
    expect(panel.element.style.getPropertyValue(`--akaza-${kind}-content-height`)).toBe("auto");
    expect(panel.element.style.getPropertyValue(`--akaza-${kind}-content-width`)).toBe("auto");
    await setOpen(false);
    await vi.runAllTimersAsync();
    expect(panel.attributes()).toMatchObject({ hidden: "", "aria-hidden": "true" });
    expect(panel.attributes("inert")).toBeDefined();
    expect(panel.element.style.getPropertyValue(`--akaza-${kind}-content-height`)).toBe("0px");
    expect(wrapper.get("input").element).toBe(input);
    expect(input.value).toBe("kept");
    expect(bindPanel).toHaveBeenCalledOnce();
  });

  it("returns focused descendants to their own trigger before hiding or removing content", async () => {
    const { wrapper, trigger, panel, setOpen } = render(true, true);
    const input = wrapper.get<HTMLInputElement>("input").element;
    input.focus();
    await setOpen(false);
    expect(document.activeElement).toBe(trigger.element);
    expect(panel.attributes("inert")).toBeDefined();
    await vi.runAllTimersAsync();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(panel.attributes("hidden")).toBeDefined();
  });

  it("lets only SDK callbacks hide and remove slots, and disposes the subscription", async () => {
    let binding!: PanelBinding;
    const cleanup = vi.fn();
    let notify!: () => void;
    vi.mocked(bindPanel).mockImplementationOnce((_element, options) => {
      binding = options;
      const stop = options.subscribe(() => { notify(); });
      return () => { stop(); cleanup(); };
    });
    notify = vi.fn();
    const { wrapper, panel, setOpen } = render(true, true);
    await setOpen(false);
    await vi.runAllTimersAsync();
    expect(notify).toHaveBeenCalledOnce();
    expect(binding.isExiting()).toBe(true);
    expect(wrapper.find("input").exists()).toBe(true);
    expect(panel.attributes("hidden")).toBeUndefined();
    binding.size(panel.element, "0px", "0px");
    await nextTick();
    expect(panel.attributes("inert")).toBeDefined();
    binding.settled(false);
    await nextTick();
    expect(panel.attributes("hidden")).toBeDefined();
    expect(wrapper.find("input").exists()).toBe(true);
    binding.exited();
    await nextTick();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(binding.isExiting()).toBe(false);
    wrapper.unmount();
    mounted.pop();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps exiting content through user CSS animation completion and cancels stale exits on reopen", async () => {
    const { wrapper, panel, setOpen } = render(true, true);
    const input = wrapper.get("input").element;
    const finish = holdAnimation(panel.element);
    await setOpen(false);
    await vi.advanceTimersByTimeAsync(30);
    expect(panel.attributes("data-ending-style")).toBeDefined();
    expect(panel.attributes("hidden")).toBeUndefined();
    expect(wrapper.get("input").element).toBe(input);
    await setOpen(true);
    finish();
    await vi.runAllTimersAsync();
    expect(wrapper.get("input").element).toBe(input);
    expect(panel.attributes("hidden")).toBeUndefined();
    expect(panel.attributes("inert")).toBeUndefined();
    expect(panel.attributes("data-ending-style")).toBeUndefined();
    expect(panel.attributes("data-akaza-state")).toBe("open");
    vi.mocked(panel.element.getAnimations).mockReturnValue([]);
    await setOpen(false);
    await vi.runAllTimersAsync();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(panel.attributes("hidden")).toBeDefined();
  });

  it("removes slots on actual animation completion, not a local close timer", async () => {
    const { wrapper, panel, setOpen } = render(true, true);
    const finish = holdAnimation(panel.element);
    await setOpen(false);
    await vi.advanceTimersByTimeAsync(80);
    expect(wrapper.find("input").exists()).toBe(true);
    expect(panel.attributes("hidden")).toBeUndefined();
    finish();
    await vi.advanceTimersByTimeAsync(1);
    expect(wrapper.find("input").exists()).toBe(false);
    expect(panel.attributes("hidden")).toBeDefined();
    expect(panel.attributes("inert")).toBeDefined();
  });

  it("cancels pending SDK animation work when the component unmounts", async () => {
    const { wrapper, panel, setOpen } = render(true, true);
    const finish = holdAnimation(panel.element);
    await setOpen(false);
    await vi.advanceTimersByTimeAsync(30);
    const style = panel.element.style.cssText;
    wrapper.unmount();
    mounted.pop();
    expect(vi.getTimerCount()).toBe(0);
    finish();
    await vi.runAllTimersAsync();
    expect(panel.element.style.cssText).toBe(style);
    expect(panel.element.isConnected).toBe(false);
  });

  it("reacts to unmountOnHide changes without rebinding or changing open state", async () => {
    const { wrapper, setOpen } = render();
    await wrapper.setProps({ unmountOnHide: true });
    expect(wrapper.find("input").exists()).toBe(false);
    await setOpen(true);
    await vi.runAllTimersAsync();
    expect(wrapper.get("input").attributes("data-open")).toBe("true");
    await wrapper.setProps({ unmountOnHide: false });
    const input = wrapper.get("input").element;
    await setOpen(false);
    await vi.runAllTimersAsync();
    expect(wrapper.get("input").element).toBe(input);
    expect(bindPanel).toHaveBeenCalledOnce();
  });
});

it("keeps Accordion panel instances keyed across reorder, independent close, and removal", async () => {
  const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
  const wrapper = mount(Accordion, {
    props: { items, type: "multiple", modelValue: ["a", "b"], unmountOnHide: true },
    slots: { content: ({ value }) => h("input", { "aria-label": `Draft ${value}` }) },
    attachTo: document.body,
  });
  mounted.push(wrapper);
  const panels = wrapper.findAll<HTMLElement>("[role=region]");
  const inputs = wrapper.findAll<HTMLInputElement>("input");
  const finish = holdAnimation(panels[0]!.element);
  inputs[0]!.element.focus();
  await wrapper.setProps({ modelValue: ["b"] });
  expect(document.activeElement).toBe(wrapper.findAll("button")[0]!.element);
  await wrapper.setProps({ items: [...items].reverse() });
  expect(wrapper.findAll("[role=region]").map(panel => panel.element)).toEqual([panels[1]!.element, panels[0]!.element]);
  expect(bindPanel).toHaveBeenCalledTimes(2);
  await wrapper.setProps({ items: [items[1]!] });
  finish();
  await vi.runAllTimersAsync();
  expect(wrapper.get("input").element).toBe(inputs[1]!.element);
  expect(wrapper.get("[role=region]").attributes("hidden")).toBeUndefined();
  expect(wrapper.emitted("value-change")).toBeUndefined();
});
