import type { Component } from "vue";
import { CalendarDate } from "@internationalized/date";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Combobox } from "@/components/combobox";
import { DateField } from "@/components/date-field";
import { DateRangePicker } from "@/components/date-range-picker";
import { Select } from "@/components/select";

enableAutoUnmount(afterEach);
afterEach(() => { document.body.innerHTML = ""; });

const options = [{ label: "Alpha", value: "a" }, { label: "Beta", value: "b" }];
const families = [
  { name: "select", component: Select, model: "open", change: "onOpenChange", props: { options, autocomplete: true }, trigger: ".akaza-select-trigger", content: ".akaza-select-content", focus: ".akaza-select-search-input", role: undefined },
  { name: "combobox", component: Combobox, model: "open", change: "onOpenChange", props: { options }, trigger: ".akaza-combobox-input", content: ".akaza-combobox-content", focus: ".akaza-combobox-input", role: "listbox" },
  { name: "date-field", component: DateField, model: "calendarOpen", change: "onCalendarOpenChange", props: { showCalendar: true, calendarTeleport: false, placeholder: new CalendarDate(2026, 8, 12) }, trigger: ".akaza-date-field-calendar-trigger", content: ".akaza-date-field-calendar-content", focus: ".akaza-calendar-cell-trigger[tabindex='0']", role: "dialog" },
  { name: "date-range-picker", component: DateRangePicker, model: "open", change: "onOpenChange", props: { teleport: false, placeholder: new CalendarDate(2026, 8, 12) }, trigger: ".akaza-date-range-picker-trigger", content: ".akaza-date-range-picker-content", focus: ".akaza-calendar-cell-trigger[tabindex='0']", role: "dialog" },
] as const;

describe.each(families)("$name popup ownership", (family) => {
  it.each(["canceled", "refused"])("retains accepted focus and interactive content after a %s Escape close", async (policy) => {
    const change = vi.fn((_open, details) => { if (policy === "canceled") details.cancel(); });
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: {
        ...family.props,
        ariaLabel: "Project",
        [family.model]: true,
        [`onUpdate:${family.model}`]: () => {},
        [family.change]: change,
      },
    });
    await flushPromises();
    const owner = wrapper.get<HTMLElement>(family.focus).element;
    owner.focus();
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    await flushPromises();
    expect(change).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "escape", event }));
    expect(wrapper.get(family.trigger).attributes("aria-expanded")).toBe("true");
    expect(wrapper.get(family.content).attributes("inert")).toBeUndefined();
    expect(document.activeElement).toBe(owner);
    expect(wrapper.get(family.content).attributes("role")).toBe(family.role);
    expect(wrapper.emitted(`update:${family.model}`)?.length ?? 0).toBe(policy === "canceled" ? 0 : 1);
  });

  it("returns focus only after an accepted Escape close", async () => {
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: {
        ...family.props,
        ariaLabel: "Project",
        [family.model]: true,
        [`onUpdate:${family.model}`]: (open: boolean) => wrapper.setProps({ [family.model]: open }),
      },
    });
    await flushPromises();
    wrapper.get<HTMLElement>(family.focus).element.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(wrapper.get(family.trigger).attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(family.content).exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get(family.trigger).element);
  });

  it("keeps outside-control focus after an accepted outside press", async () => {
    const outside = document.createElement("button");
    outside.textContent = "Next";
    document.body.append(outside);
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: {
        ...family.props,
        ariaLabel: "Project",
        [family.model]: true,
        [`onUpdate:${family.model}`]: (open: boolean) => wrapper.setProps({ [family.model]: open }),
      },
    });
    await flushPromises();
    outside.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    outside.focus();
    await flushPromises();
    expect(wrapper.get(family.trigger).attributes("aria-expanded")).toBe("false");
    const change = wrapper.emitted(family.model === "calendarOpen" ? "calendar-open-change" : "open-change");
    expect(change?.[0]?.[1]).toMatchObject({ reason: "outside-click" });
    expect(document.activeElement).toBe(outside);
  });

  it("routes one native trigger event through the cancelable request", async () => {
    const change = vi.fn((_open, details) => details.cancel());
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: { ...family.props, ariaLabel: "Project", [family.change]: change },
    });
    const trigger = wrapper.get(family.trigger);
    await trigger.trigger("click");
    await nextTick();
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0]?.[0]).toBe(true);
    expect(change.mock.calls[0]?.[1]).toMatchObject({ reason: "trigger", event: expect.any(MouseEvent) });
    expect(wrapper.find(family.content).exists()).toBe(false);
  });

  it("waits for delayed controlled acceptance before returning focus", async () => {
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: {
        ...family.props,
        ariaLabel: "Project",
        [family.model]: true,
        [`onUpdate:${family.model}`]: () => {},
      },
    });
    await flushPromises();
    const owner = wrapper.get<HTMLElement>(family.focus).element;
    owner.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(document.activeElement).toBe(owner);
    expect(wrapper.get(family.content).attributes("inert")).toBeUndefined();
    await wrapper.setProps({ [family.model]: false });
    await flushPromises();
    expect(document.activeElement).toBe(wrapper.get(family.trigger).element);
  });
});

describe.each([
  { component: Select, name: "select", trigger: ".akaza-select-trigger", content: ".akaza-select-content" },
  { component: Combobox, name: "combobox", trigger: ".akaza-combobox-input", content: ".akaza-combobox-content" },
])("$name field engine", (family) => {
  it("moves one active descendant per arrow without moving native focus or selecting", async () => {
    const wrapper = mount(family.component as Component, {
      attachTo: document.body,
      props: { options, open: true, ariaLabel: "Project" },
    });
    await flushPromises();
    const trigger = wrapper.get<HTMLElement>(family.trigger);
    trigger.element.focus();
    const first = trigger.attributes("aria-activedescendant");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    const second = trigger.attributes("aria-activedescendant");
    expect(second).not.toBe(first);
    expect(wrapper.get(`#${second}`).text()).toContain("Beta");
    await trigger.trigger("keydown", { key: "ArrowUp" });
    expect(trigger.attributes("aria-activedescendant")).toBe(first);
    expect(document.activeElement).toBe(trigger.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("keeps all accepted multiple values in native form submission while open", async () => {
    const wrapper = mount(defineComponent({
      components: { FieldPopup: family.component },
      setup: () => ({ value: ref(["a", "b"]), options }),
      template: '<form><FieldPopup v-model="value" :options="options" multiple :open="true" name="project" aria-label="Project" /></form>',
    }), { attachTo: document.body });
    await flushPromises();
    expect(new FormData(wrapper.get("form").element).getAll("project")).toEqual(["a", "b"]);
    await wrapper.get(family.content).findAll('[role="option"]')[0]!.trigger("click");
    await flushPromises();
    expect(new FormData(wrapper.get("form").element).getAll("project")).toEqual(["b"]);
    expect(wrapper.get(family.trigger).attributes("aria-expanded")).toBe("true");
  });
});
