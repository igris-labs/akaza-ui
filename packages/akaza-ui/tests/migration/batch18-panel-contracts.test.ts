import { checkPattern } from "@ui-sdk/core/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, onMounted, onUnmounted, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Accordion } from "@/components/accordion";
import { Collapsible } from "@/components/collapsible";
import "./panel-motion";

const mounted: Array<{ unmount: () => void }> = [];
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.replaceChildren();
});

const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
const ui = { root: "custom-root", trigger: "custom-trigger", icon: "custom-icon", contentWrapper: "custom-wrapper", contentInner: "custom-inner", content: "custom-body" };

describe.each(["accordion", "collapsible"] as const)("%s retained panel lifecycle", kind => {
  function renderPanel(unmountOnHide = false) {
    const mounts = vi.fn();
    const unmounts = vi.fn();
    const Body = defineComponent({
      setup() {
        onMounted(mounts);
        onUnmounted(unmounts);
        return () => h("input", { name: "draft", value: "initial" });
      },
    });
    const wrapper = track(kind === "accordion"
      ? mount(Accordion, {
          props: { items: [items[0]!], collapsible: true, unmountOnHide, ui },
          attrs: { class: "consumer-root" },
          slots: { content: () => h(Body) },
          attachTo: document.body,
        })
      : mount(Collapsible, {
          props: { unmountOnHide, ui },
          attrs: { class: "consumer-root" },
          slots: { trigger: "Details", content: () => h(Body) },
          attachTo: document.body,
        }));
    return { wrapper, mounts, unmounts };
  }

  it("retains wrappers and draft DOM while SDK sizes and hides closed panels", async () => {
    const { wrapper, mounts, unmounts } = renderPanel();
    const panel = wrapper.get<HTMLElement>("[role=region]");
    const trigger = wrapper.get("button");
    const input = wrapper.get<HTMLInputElement>("input");
    expect(mounts).toHaveBeenCalledOnce();
    expect(panel.attributes("aria-hidden")).toBe("true");
    expect(panel.attributes()).toHaveProperty("inert");
    expect(panel.attributes()).toHaveProperty("hidden");
    expect(panel.element.style.getPropertyValue(`--akaza-${kind}-content-height`)).toBe("0px");
    expect(panel.element.style.getPropertyValue(`--akaza-${kind}-content-width`)).toBe("0px");
    expect(panel.attributes("data-slot")).toBeUndefined();
    expect(panel.attributes("id")).toBe(trigger.attributes("aria-controls"));
    expect(wrapper.classes()).toEqual(expect.arrayContaining([`akaza-${kind}`, "custom-root", "consumer-root"]));
    expect(trigger.classes()).toContain("custom-trigger");
    expect(panel.classes()).toContain("custom-wrapper");
    expect(wrapper.find(`.akaza-${kind}-content-inner.custom-inner`).exists()).toBe(true);
    expect(wrapper.find(`.akaza-${kind}-content-body.custom-body`).exists()).toBe(true);
    expect(wrapper.find(`.akaza-${kind}-icon.custom-icon`).exists()).toBe(true);
    input.element.value = "draft";
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(panel.attributes("aria-hidden")).toBeUndefined();
    expect(panel.attributes("inert")).toBeUndefined();
    await trigger.trigger("click");
    expect(panel.attributes("data-akaza-state")).toBe("closed");
    expect(wrapper.get("[role=region]").element).toBe(panel.element);
    expect(wrapper.get("input").element).toBe(input.element);
    expect(input.element.value).toBe("draft");
    expect(unmounts).not.toHaveBeenCalled();
  });

  it("unmounts only slot content after SDK exit and remounts it on reopen", async () => {
    const { wrapper, mounts, unmounts } = renderPanel(true);
    const panel = wrapper.get("[role=region]").element;
    const inner = panel.firstElementChild;
    expect(wrapper.find("input").exists()).toBe(false);
    expect(mounts).not.toHaveBeenCalled();
    await wrapper.get("button").trigger("click");
    expect(mounts).toHaveBeenCalledOnce();
    const input = wrapper.get("input").element;
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(unmounts).toHaveBeenCalledOnce();
    expect(wrapper.get("[role=region]").element).toBe(panel);
    expect(panel.firstElementChild).toBe(inner);
    await wrapper.get("button").trigger("click");
    expect(mounts).toHaveBeenCalledTimes(2);
    expect(wrapper.get("input").element).not.toBe(input);
  });

  it("preserves native slot form values and reset without panel state changes", async () => {
    const View = defineComponent({
      setup() {
        return () => h("form", [kind === "accordion"
          ? h(Accordion, { items: [items[0]!] }, { content: () => h("input", { name: "draft", value: "initial" }) })
          : h(Collapsible, {}, { content: () => h("input", { name: "draft", value: "initial" }) })]);
      },
    });
    const wrapper = track(mount(View, { attachTo: document.body }));
    const form = wrapper.get<HTMLFormElement>("form").element;
    const input = wrapper.get<HTMLInputElement>("input").element;
    input.value = "edited";
    expect(new FormData(form).getAll("draft")).toEqual(["edited"]);
    form.addEventListener("reset", event => event.preventDefault(), { once: true });
    form.reset();
    expect(input.value).toBe("edited");
    form.reset();
    expect(input.value).toBe("initial");
    await nextTick();
    expect(wrapper.get("button").attributes("aria-expanded")).toBe("false");
  });

  it("does not steal outside focus across rapid external open/close updates", async () => {
    const open = ref(false);
    const View = defineComponent({
      setup: () => () => h("div", [h("input", { class: "outside" }), kind === "accordion"
        ? h(Accordion, { items: [items[0]!], modelValue: open.value ? "a" : "" })
        : h(Collapsible, { modelValue: open.value })]),
    });
    const wrapper = track(mount(View, { attachTo: document.body }));
    const outside = wrapper.get<HTMLInputElement>(".outside").element;
    outside.focus();
    for (const value of [true, false, true, false]) {
      open.value = value;
      await nextTick();
      expect(document.activeElement).toBe(outside);
      expect(wrapper.get("button").attributes("aria-expanded")).toBe(String(value));
    }
  });
});

it("rejects canceled and refused Accordion updates without changing panel presence", async () => {
  const cancel = vi.fn((_value, details) => details.cancel());
  const update = vi.fn();
  const wrapper = track(mount(Accordion, {
    props: { items, modelValue: "a", collapsible: true, unmountOnHide: true, onValueChange: cancel, "onUpdate:modelValue": update },
    slots: { content: ({ value }) => h("input", { "data-panel": value }) },
  }));
  const triggers = wrapper.findAll("button");
  await triggers[1]!.trigger("click");
  expect(cancel).toHaveBeenCalledOnce();
  expect(cancel.mock.calls[0]![1].reason).toBe("trigger");
  expect(cancel.mock.calls[0]![1].event).toBeInstanceOf(MouseEvent);
  expect(update).not.toHaveBeenCalled();
  await wrapper.setProps({ onValueChange: vi.fn() });
  await triggers[1]!.trigger("click");
  expect(update).toHaveBeenCalledExactlyOnceWith("b");
  expect(triggers.map(trigger => trigger.attributes("aria-expanded"))).toEqual(["true", "false"]);
  expect(wrapper.findAll("input").map(input => input.attributes("data-panel"))).toEqual(["a"]);
  await wrapper.setProps({ modelValue: "b" });
  await flushPromises();
  expect(wrapper.findAll("input").map(input => input.attributes("data-panel"))).toEqual(["b"]);
});

it("keeps multiple Accordion panels' native Tab stops and disabled policy", async () => {
  const wrapper = track(mount(Accordion, {
    props: { items: [...items, { value: "disabled", label: "Disabled", disabled: true }], type: "multiple" },
    attachTo: document.body,
  }));
  const triggers = wrapper.findAll<HTMLButtonElement>("button");
  await triggers[0]!.trigger("click");
  await triggers[1]!.trigger("click");
  expect(triggers.map(trigger => trigger.attributes("aria-expanded"))).toEqual(["true", "true", "false"]);
  expect(triggers[2]!.element.disabled).toBe(true);
  triggers[0]!.element.focus();
  await triggers[0]!.trigger("keydown", { key: "ArrowDown" });
  expect(document.activeElement).toBe(triggers[1]!.element);
  await triggers[1]!.trigger("keydown", { key: "ArrowUp" });
  expect(document.activeElement).toBe(triggers[0]!.element);
  expect(triggers.slice(0, 2).map(trigger => trigger.element.tabIndex)).toEqual([0, 0]);
  expect(wrapper.emitted("value-change")).toHaveLength(2);
  await wrapper.setProps({ disabled: true });
  expect(triggers.every(trigger => trigger.element.disabled)).toBe(true);
});

it("preserves Collapsible cancellation, controlled rejection, custom reasons and native action events", async () => {
  const cancel = vi.fn((_value, details) => details.cancel());
  const update = vi.fn();
  const wrapper = track(mount(Collapsible, {
    props: { modelValue: true, unmountOnHide: true, onOpenChange: cancel, "onUpdate:modelValue": update },
    slots: { trigger: "Details", content: '<input name="kept">' },
  }));
  const panel = wrapper.get("[role=region]");
  const event = new MouseEvent("click");
  wrapper.vm.close(event);
  await nextTick();
  expect(cancel.mock.calls[0]![1]).toMatchObject({ reason: "trigger", event });
  expect(update).not.toHaveBeenCalled();
  expect(wrapper.find("input").exists()).toBe(true);
  const change = vi.fn();
  await wrapper.setProps({ onOpenChange: change });
  wrapper.vm.close("dismiss", event);
  await nextTick();
  expect(change).toHaveBeenCalledOnce();
  expect(change.mock.calls[0]![1]).toMatchObject({ reason: "dismiss", event });
  expect(update).toHaveBeenCalledExactlyOnceWith(false);
  expect(panel.attributes("data-akaza-state")).toBe("open");
  await wrapper.setProps({ modelValue: false });
  await flushPromises();
  expect(wrapper.find("input").exists()).toBe(false);
  expect(panel.attributes()).toHaveProperty("inert");
  wrapper.vm.open();
  await nextTick();
  expect(change.mock.calls[1]![1].reason).toBe("programmatic");
});

it("blocks disabled Collapsible opening but permits programmatic closing", async () => {
  const change = vi.fn();
  const wrapper = track(mount(Collapsible, { props: { disabled: true, onOpenChange: change } }));
  wrapper.vm.open();
  wrapper.vm.toggle();
  expect(change).not.toHaveBeenCalled();
  await wrapper.setProps({ modelValue: true });
  wrapper.vm.close();
  await nextTick();
  expect(change).toHaveBeenCalledOnce();
  expect(change.mock.calls[0]![0]).toBe(false);
});

it("retains the SDK accordion pattern on the existing Vue-owned panel markup", async () => {
  const wrapper = track(mount(Accordion, { props: { items, collapsible: true }, attachTo: document.body }));
  await nextTick();
  await checkPattern(wrapper.element, "accordion");
  expect(wrapper.find("[data-slot]").exists()).toBe(false);
});

it.each([false, true])("hydrates retained/unmounted panel bodies with unmountOnHide=%s", async unmountOnHide => {
  const View = defineComponent({
    setup() {
      const open = ref(false);
      return () => h("div", [
        h(Accordion, {
          items: [items[0]!], unmountOnHide, modelValue: open.value ? "a" : "", collapsible: true,
          "onUpdate:modelValue": value => { open.value = value === "a"; },
        }, { content: () => h("input", { name: "accordion", value: "draft" }) }),
        h(Collapsible, {
          unmountOnHide, modelValue: open.value,
          "onUpdate:modelValue": value => { open.value = value; },
        }, { trigger: () => "Details", content: () => h("input", { name: "collapsible", value: "draft" }) }),
      ]);
    },
  });
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  const panels = [...root.querySelectorAll("[role=region]")];
  const app = createSSRApp(View);
  const warn = vi.fn();
  app.config.warnHandler = warn;
  try {
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelectorAll("input")).toHaveLength(unmountOnHide ? 0 : 2);
    const triggers = root.querySelectorAll<HTMLButtonElement>("button");
    triggers[0]!.click();
    await nextTick();
    expect(root.querySelectorAll("input")).toHaveLength(2);
    expect([...root.querySelectorAll("[role=region]")]).toEqual(panels);
    triggers[1]!.click();
    await nextTick();
    await flushPromises();
    expect(root.querySelectorAll("input")).toHaveLength(unmountOnHide ? 0 : 2);
    expect(root.querySelectorAll("[role=region][inert][aria-hidden=true]")).toHaveLength(2);
    expect(root.querySelectorAll("[role=region][hidden]")).toHaveLength(2);
    expect(root.querySelector("[data-slot], [data-starting-style], [data-ending-style]")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  } finally {
    app.unmount();
    root.remove();
  }
});
