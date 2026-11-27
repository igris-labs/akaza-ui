import type { StepperValue } from "@/components/stepper";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Stepper } from "@/components/stepper";
import { Toolbar } from "@/components/toolbar";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

describe("sdk toolbar focus", () => {
  it("crosses groups, skips disabled commands and inputs, but reaches focusable disabled commands", async () => {
    const disabled = vi.fn();
    const wrapper = track(mount(Toolbar, {
      props: {
        items: [
          { value: "a", label: "Alpha" },
          { value: "skip", label: "Skip", disabled: true },
          { type: "input", label: "Query", value: "query" },
          { type: "group", label: "Actions", children: [
            { value: "off", label: "Unavailable", disabled: true, focusableWhenDisabled: true, onSelect: disabled },
            { value: "b", label: "Beta" },
          ] },
          { type: "link", value: "help", label: "Help", href: "#help" },
        ],
      },
      attachTo: document.body,
    }));
    const buttons = wrapper.findAll("button");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[2]!.element);
    expect(buttons[2]!.attributes("aria-disabled")).toBe("true");
    await buttons[2]!.trigger("click");
    expect(disabled).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")).toBeUndefined();
    await buttons[2]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[3]!.element);
    await buttons[3]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(wrapper.get("a").element);
    const input = wrapper.get("input");
    input.element.focus();
    await input.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(input.element);
  });

  it("keeps command cancellation, native input cancellation and keyboard modifiers separate", async () => {
    const action = vi.fn();
    const update = vi.fn();
    const wrapper = track(mount(Toolbar, {
      props: {
        items: [{ value: "a", label: "Alpha", onSelect: action }, { value: "b", label: "Beta" },
          { type: "input", label: "Query", inputValue: "accepted", onUpdateValue: update }],
        onSelect: (_item, details) => details.cancel(),
        onInputChange: (_item, _value, details) => details.cancel(),
      },
      attachTo: document.body,
    }));
    const first = wrapper.findAll("button")[0]!;
    first.element.focus();
    for (const modifiers of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
      await first.trigger("keydown", { key: "ArrowRight", ...modifiers });
      expect(document.activeElement).toBe(first.element);
    }
    await first.trigger("click");
    expect(action).not.toHaveBeenCalled();
    await wrapper.get("input").setValue("rejected");
    expect(update).not.toHaveBeenCalled();
    expect(wrapper.get<HTMLInputElement>("input").element.value).toBe("accepted");
  });

  it("retains a stable remembered command through reorder and removes disabled tab stops", async () => {
    const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
    const wrapper = track(mount(Toolbar, { props: { items }, attachTo: document.body }));
    const beta = wrapper.findAll("button")[1]!;
    beta.element.focus();
    await wrapper.setProps({ items: [...items].reverse() });
    expect(wrapper.findAll("button")[0]!.attributes("tabindex")).toBe("0");
    expect(document.activeElement).toBe(beta.element);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(0);
    await wrapper.setProps({ disabled: false, items: [items[0]!] });
    expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(1);
  });
});

describe("sdk stepper focus", () => {
  const items = [
    { value: 0, title: "Number zero" },
    { value: "0", title: "String zero" },
    { value: 2, title: "Disabled", disabled: true },
    { value: "review", title: "Review" },
  ];

  it("preserves numeric and string keys without conflating selection and manual focus", async () => {
    const wrapper = track(mount(Stepper, { props: { items, modelValue: 0, linear: false }, attachTo: document.body }));
    const buttons = wrapper.findAll(".akaza-stepper-trigger");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]!.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    await buttons[1]!.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe("0");
    await buttons[1]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(buttons[3]!.element);
    await buttons[3]!.trigger("keydown", { key: " " });
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toBe("review");
    expect(wrapper.emitted("complete")).toHaveLength(1);
  });

  it("keeps automatic activation cancelable with original event and reason", async () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Stepper, {
      props: { items, modelValue: 0, activationMode: "automatic", linear: false, onValueChange: cancel },
      attachTo: document.body,
    }));
    const buttons = wrapper.findAll(".akaza-stepper-trigger");
    buttons[0]!.element.focus();
    buttons[0]!.element.dispatchEvent(event);
    await nextTick();
    expect(document.activeElement).toBe(buttons[1]!.element);
    expect(cancel).toHaveBeenCalledWith("0", expect.objectContaining({ reason: "keyboard", event }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(buttons[0]!.attributes("aria-current")).toBe("step");
  });

  it("keeps linear next/previous rules and moves the tab stop without stealing control focus", async () => {
    const value = ref<StepperValue>(0);
    const wrapper = track(mount(defineComponent({
      render: () => h(Stepper, { items, modelValue: value.value, "onUpdate:modelValue": next => { value.value = next; }, showControls: true }),
    }), { attachTo: document.body }));
    const stepper = wrapper.getComponent(Stepper);
    expect(stepper.vm.goToStep("review")).toBe(false);
    const next = wrapper.get<HTMLButtonElement>(".akaza-stepper-next");
    next.element.focus();
    await next.trigger("click");
    expect(value.value).toBe("0");
    expect(document.activeElement).toBe(next.element);
    expect(wrapper.findAll('.akaza-stepper-trigger[tabindex="0"]')[0]!.text()).toContain("String zero");
    expect(stepper.vm.nextStep()).toBe(true);
    await nextTick();
    expect(value.value).toBe("review");
    expect(stepper.vm.hasNext()).toBe(false);
    expect(stepper.vm.prevStep()).toBe(true);
    await nextTick();
    expect(value.value).toBe("0");
  });

  it("keeps a valid stop when a focused step becomes locked or is removed", async () => {
    const wrapper = track(mount(Stepper, { props: { items, modelValue: 0, linear: false }, attachTo: document.body }));
    const buttons = wrapper.findAll(".akaza-stepper-trigger");
    buttons[3]!.element.focus();
    await nextTick();
    await wrapper.setProps({ linear: true });
    expect(wrapper.findAll('.akaza-stepper-trigger[tabindex="0"]')).toHaveLength(1);
    expect(wrapper.findAll('.akaza-stepper-trigger[tabindex="0"]')[0]!.text()).toContain("Number zero");
    await wrapper.setProps({ items: [] });
    expect(wrapper.findAll(".akaza-stepper-trigger")).toHaveLength(0);
    expect(wrapper.attributes("data-akaza-state")).toBe("empty");
  });

  it("ignores composed and modified navigation without advancing the flow", async () => {
    const wrapper = track(mount(Stepper, { props: { items, modelValue: 0, linear: false, activationMode: "automatic" }, attachTo: document.body }));
    const first = wrapper.get<HTMLButtonElement>(".akaza-stepper-trigger");
    first.element.focus();
    for (const extra of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      await first.trigger("keydown", { key: "ArrowRight", ...extra });
      expect(document.activeElement).toBe(first.element);
    }
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });
});
