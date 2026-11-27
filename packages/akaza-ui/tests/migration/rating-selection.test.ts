import { checkPattern } from "@ui-sdk/core/testing";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Rating } from "@/components/rating";
import { ToggleGroup } from "@/components/toggle-group";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "skip", label: "Disabled", disabled: true }];

describe("sdk Rating focus", () => {
  it("passes the radio pattern with both arrow pairs and explicit Home/End", async () => {
    const value = ref(2);
    const wrapper = track(mount(defineComponent({
      setup: () => () => h(Rating, { modelValue: value.value, "onUpdate:modelValue": next => { value.value = next; } }),
    }), { attachTo: document.body }));
    await nextTick();
    await checkPattern(wrapper.element, "radio-group");
    const radios = wrapper.findAll<HTMLButtonElement>('[role="radio"]');
    radios.at(-1)!.element.focus();
    await radios.at(-1)!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(radios[0]!.element);
    expect(value.value).toBe(1);
    await radios[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(radios.at(-1)!.element);
    expect(value.value).toBe(5);
    expect(wrapper.findAll('[role="radio"][tabindex="0"]')).toHaveLength(1);
  });

  it("keeps fractional RTL movement, native event details, and no-wrap boundaries", async () => {
    const wrapper = track(mount(Rating, { props: { modelValue: 2.5, step: 0.5, dir: "rtl", loop: false }, attachTo: document.body }));
    const radio = (value: number) => wrapper.get<HTMLButtonElement>(`[role="radio"][data-akaza-value="${value}"]`);
    wrapper.findAll<HTMLButtonElement>('[role="radio"]').forEach(item => { item.element.style.direction = "rtl"; });
    radio(2.5).element.focus();
    await radio(2.5).trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(radio(3).element);
    const [value, details] = wrapper.emitted("value-change")![0]!;
    expect(value).toBe(3);
    expect(details).toMatchObject({ reason: "keyboard", event: expect.any(KeyboardEvent) });
    await radio(3).trigger("keydown", { key: "Home" });
    await radio(0.5).trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement).toBe(radio(0.5).element);
    await radio(0.5).trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(radio(5).element);
  });

  it("keeps read-only and canceled values while focus moves; external values stay authoritative", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Rating, {
      props: { modelValue: 2, readOnly: true, "onUpdate:modelValue": vi.fn(), onValueChange: cancel }, attachTo: document.body,
    }));
    const radios = wrapper.findAll<HTMLButtonElement>('[role="radio"]');
    radios[1]!.element.focus();
    await radios[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(radios[2]!.element);
    expect(cancel).not.toHaveBeenCalled();
    await wrapper.setProps({ readOnly: false });
    await radios[2]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(radios[3]!.element);
    expect(radios[1]!.attributes("aria-checked")).toBe("true");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ onValueChange: undefined });
    await radios[3]!.trigger("click");
    expect(radios[1]!.attributes("aria-checked")).toBe("true");
    await wrapper.setProps({ modelValue: 5 });
    expect(radios[4]!.attributes("aria-checked")).toBe("true");
  });

  it("reconciles dynamic grids and disabled tab stops without stealing external focus", async () => {
    const wrapper = track(mount(Rating, { props: { modelValue: 4.5, step: 0.5 }, attachTo: document.body }));
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    await wrapper.setProps({ length: 3, step: 1 });
    expect(wrapper.findAll('[role="radio"][tabindex="0"]')).toHaveLength(1);
    expect(wrapper.get('[role="radio"][tabindex="0"]').attributes("data-akaza-value")).toBe("3");
    expect(document.activeElement).toBe(outside);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.findAll('[role="radio"][tabindex="0"]')).toHaveLength(0);
    await wrapper.setProps({ disabled: false });
    expect(wrapper.findAll('[role="radio"][tabindex="0"]')).toHaveLength(1);
  });

  it("can retry a canceled boundary selection without moving focus again", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Rating, { props: { modelValue: 3, loop: false, onValueChange: cancel }, attachTo: document.body }));
    const radios = wrapper.findAll<HTMLButtonElement>('[role="radio"]');
    radios[2]!.element.focus();
    await radios[2]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(radios[0]!.element);
    await wrapper.setProps({ onValueChange: undefined });
    await radios[0]!.trigger("keydown", { key: "Home" });
    expect(radios[0]!.attributes("aria-checked")).toBe("true");
  });

  it("ignores IME, prevented events, and modifier chords", async () => {
    const wrapper = track(mount(Rating, { props: { modelValue: 2, clearable: true }, attachTo: document.body }));
    const radio = wrapper.get<HTMLButtonElement>('[role="radio"][data-akaza-value="2"]');
    radio.element.focus();
    for (const key of ["ArrowRight", "Home", "End", " ", "Enter"]) {
      for (const guard of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
        await radio.trigger("keydown", { key, ...guard });
      }
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      event.preventDefault();
      radio.element.dispatchEvent(event);
    }
    expect(document.activeElement).toBe(radio.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("keeps clear, hover cancellation, form submission, and reset behavior", async () => {
    const value = ref(2.5);
    const wrapper = track(mount(defineComponent({
      setup: () => () => h("form", h(Rating, {
        modelValue: value.value, "onUpdate:modelValue": next => { value.value = next; },
        step: 0.5, name: "rating", clearable: true, hoverable: true, onHoverChange: (_value, details) => details.cancel(),
      })),
    }), { attachTo: document.body }));
    const form = wrapper.get<HTMLFormElement>("form");
    const rating = wrapper.getComponent(Rating);
    await rating.get('[data-akaza-value="5"][role="radio"]').trigger("mouseenter");
    expect(rating.findAll(".akaza-rating-item")[4]!.attributes("data-akaza-state")).toBe("inactive");
    const radio = rating.get<HTMLButtonElement>('[data-akaza-value="2.5"][role="radio"]');
    radio.element.focus();
    await radio.trigger("keydown", { key: " " });
    expect(value.value).toBe(0);
    expect(new FormData(form.element).get("rating")).toBe("");
    form.element.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toBe(2.5);
    expect(new FormData(form.element).get("rating")).toBe("2.5");
    expect(rating.get('[role="radio"][tabindex="0"]').attributes("data-akaza-value")).toBe("2.5");
    await radio.trigger("keydown", { key: "Enter" });
    expect(value.value).toBe(0);
  });
});

describe("sdk ToggleGroup selection", () => {
  it("does not retain a rejected controlled request or canceled change", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(ToggleGroup, { props: {
      options, type: "multiple", modelValue: ["a"], "onUpdate:modelValue": vi.fn(), onValueChange: cancel,
    } }));
    const beta = wrapper.findAll("button")[1]!;
    await beta.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ onValueChange: undefined });
    await beta.trigger("click");
    await beta.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[["a", "b"]], [["a", "b"]]]);
    expect(beta.attributes("aria-pressed")).toBe("false");
    await wrapper.setProps({ modelValue: ["b"] });
    await beta.trigger("click");
    expect(wrapper.emitted("update:modelValue")!.at(-1)).toEqual([[]]);
  });

  it("preserves required/allowEmpty policy and unchanged single requests", async () => {
    const wrapper = track(mount(ToggleGroup, { props: { options, modelValue: "a", allowEmpty: false } }));
    const alpha = wrapper.findAll("button")[0]!;
    await alpha.trigger("click");
    expect(wrapper.emitted("value-change")![0]![0]).toBe("a");
    await wrapper.setProps({ required: true, allowEmpty: true });
    await alpha.trigger("click");
    expect(wrapper.emitted("value-change")).toHaveLength(1);
    await wrapper.setProps({ required: false });
    await alpha.trigger("click");
    expect(wrapper.emitted("update:modelValue")!.at(-1)).toEqual([""]);
    await wrapper.setProps({ type: "multiple", modelValue: ["a"], required: true });
    await alpha.trigger("click");
    expect(wrapper.emitted("value-change")).toHaveLength(2);
  });

  it("retains unknown and disabled selected values, current option order, and native form reset", async () => {
    const value = ref(["unknown", "skip", "a"]);
    const wrapper = track(mount(defineComponent({
      setup: () => () => h("form", h(ToggleGroup, {
        options, type: "multiple", modelValue: value.value, name: "choice",
        "onUpdate:modelValue": next => { value.value = next as string[]; },
      })),
    }), { attachTo: document.body }));
    const form = wrapper.get<HTMLFormElement>("form");
    const group = wrapper.getComponent(ToggleGroup);
    await group.findAll("button")[1]!.trigger("click");
    expect(value.value).toEqual(["unknown", "skip", "a", "b"]);
    expect(new FormData(form.element).getAll("choice")).toEqual(value.value);
    await group.findAll("button")[2]!.trigger("click");
    expect(value.value).toEqual(["unknown", "skip", "a", "b"]);
    form.element.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toEqual(["unknown", "skip", "a"]);
    await group.findAll("button")[0]!.trigger("click");
    expect(value.value).toEqual(["unknown", "skip"]);
  });

  it("uses current custom keys after reorder and keeps instances independent", async () => {
    const items = [{ id: "a", title: "Alpha" }, { id: "b", title: "Beta" }];
    const wrapper = track(mount(ToggleGroup, { props: { options: items, valueKey: "id", labelKey: "title", modelValue: "a" } }));
    const second = track(mount(ToggleGroup, { props: { options, modelValue: "a" } }));
    await wrapper.setProps({ options: [...items].reverse() });
    await wrapper.findAll("button")[0]!.trigger("click");
    expect(wrapper.emitted("value-change")![0]![0]).toBe("b");
    expect(second.findAll("button")[0]!.attributes("aria-pressed")).toBe("true");
    expect(second.emitted("value-change")).toBeUndefined();
  });

  it("preserves programmatic slot actions and blocks disabled fieldsets", async () => {
    const wrapper = track(mount(ToggleGroup, { props: { options, modelValue: "a" }, slots: {
      item: '<template #default="{ label, select }"><span @click.stop="select">{{ label }}</span></template>',
    } }));
    await wrapper.findAll("span")[1]!.trigger("click");
    expect(wrapper.emitted("value-change")![0]![1]).toMatchObject({ reason: "programmatic" });
    const disabled = track(mount(defineComponent({
      render: () => h("fieldset", { disabled: true }, [h(ToggleGroup, { options, modelValue: "a" }), h(Rating, { modelValue: 2 })]),
    }), { attachTo: document.body }));
    for (const button of disabled.findAll("button")) await button.trigger("click");
    expect(disabled.getComponent(ToggleGroup).emitted("value-change")).toBeUndefined();
    expect(disabled.getComponent(Rating).emitted("value-change")).toBeUndefined();
  });
});
