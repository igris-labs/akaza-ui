import type { AkazaChangeEventDetails } from "@/types";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Editable } from "@/components/editable";

const calls = vi.hoisted(() => ({ start: vi.fn(), end: vi.fn(), cancel: vi.fn(), bindInput: vi.fn() }));
vi.mock("@ui-sdk/core", async (importOriginal) => {
  const sdk = await importOriginal<typeof import("@ui-sdk/core")>();
  return { ...sdk, createInlineEdit: (...args: Parameters<typeof sdk.createInlineEdit>) => {
    const edit = sdk.createInlineEdit(...args);
    for (const method of ["start", "end", "cancel", "bindInput"] as const) {
      const original = edit[method];
      Object.assign(edit, { [method]: (...values: never[]) => {
        calls[method](...values);
        return (original as (...values: never[]) => unknown)(...values);
      } });
    }
    return edit;
  } };
});

const wrappers: Array<{ unmount: () => void }> = [];
function track<T extends { unmount: () => void }>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}
async function settle() {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
}
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.replaceChildren();
  vi.clearAllMocks();
});

describe("editable SDK ownership", () => {
  it("uses real SDK start/end/cancel without binding SDK focus or adding activation keys", async () => {
    const wrapper = track(mount(Editable, { attachTo: document.body, props: {
      modelValue: "Original", activationMode: "click", submitMode: "none", selectOnFocus: false,
    } }));
    for (const key of ["F2", "x"]) await wrapper.get(".akaza-editable-preview").trigger("keydown", { key });
    expect(calls.start).not.toHaveBeenCalled();
    await wrapper.get(".akaza-editable-preview").trigger("click");
    await settle();
    expect(calls.start).toHaveBeenCalledOnce();
    const input = wrapper.get<HTMLInputElement>(".akaza-editable-input");
    expect(document.activeElement).toBe(input.element);
    expect(input.element.selectionStart).toBe(input.element.selectionEnd);
    await input.setValue("Changed");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(calls.end).toHaveBeenCalledOnce();
    expect(calls.start).toHaveBeenLastCalledWith("value", expect.objectContaining({ text: "Changed" }));
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Changed");
    await wrapper.get(".akaza-editable-edit").trigger("click");
    await wrapper.get(".akaza-editable-cancel").trigger("click");
    expect(calls.cancel).toHaveBeenCalledOnce();
    expect(calls.bindInput).not.toHaveBeenCalled();
    expect(wrapper.emitted("state-change")?.map(event => event[0])).toEqual(["edit", "submit", "edit", "cancel"]);
  });

  it.each(["Original", "Changed"])("keeps repeated value/submit/cancel vetoes open for %s", async (text) => {
    let blocked = "value-change";
    const events: string[] = [];
    const handlers = Object.fromEntries(["value-change", "submit", "cancel"].map(name => [
      name === "value-change" ? "onValueChange" : name === "submit" ? "onSubmit" : "onCancel",
      (_value: string, details: AkazaChangeEventDetails) => {
        events.push(name);
        if (blocked === name) details.cancel();
      },
    ]));
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", startWithEditMode: true, submitMode: "enter", ...handlers,
    } }));
    await wrapper.get(".akaza-editable-input").setValue(text);
    const submit = () => wrapper.get(".akaza-editable-input").trigger("keydown", { key: "Enter" });
    await submit();
    await submit();
    expect(events).toEqual(["value-change", "value-change"]);
    blocked = "submit";
    await submit();
    await submit();
    expect(events.slice(2)).toEqual(["value-change", "submit", "value-change", "submit"]);
    blocked = "cancel";
    await wrapper.get(".akaza-editable-input").trigger("keydown", { key: "Escape" });
    expect(calls.cancel).not.toHaveBeenCalled();
    expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe(text);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("state-change")).toBeUndefined();
    blocked = "";
    await submit();
    expect(wrapper.get(".akaza-editable-preview").text()).toBe(text);
    expect(wrapper.emitted("submit")).toHaveLength(3);
    expect(wrapper.emitted("state-change")?.map(event => event[0])).toEqual(["submit"]);
  });

  it("restores rejected DOM drafts and snapshots only accepted text", async () => {
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", startWithEditMode: true,
      onDraftChange: (value: string, details: AkazaChangeEventDetails) => { if (value === "Rejected") details.cancel(); },
    } }));
    await wrapper.get(".akaza-editable-input").setValue("Accepted");
    await wrapper.get(".akaza-editable-input").setValue("Rejected");
    expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("Accepted");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Accepted");
    expect(calls.start).toHaveBeenLastCalledWith("value", expect.objectContaining({ text: "Accepted" }));
  });

  it("preserves exact native event, custom reason, and flat exposed methods", async () => {
    const order: string[] = [];
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", activationMode: "none",
      onValueChange: () => order.push("value"), onSubmit: () => order.push("submit"),
      "onUpdate:modelValue": () => order.push("model"), onStateChange: () => order.push("state"),
    } }));
    const api = wrapper.vm as unknown as { edit: (event?: Event) => void; submit: (event?: Event, reason?: string) => boolean; cancel: () => void; focus: () => void };
    expect(api.submit()).toBe(false);
    const event = new MouseEvent("click");
    api.edit(event);
    await nextTick();
    await wrapper.get(".akaza-editable-input").setValue("New");
    order.length = 0;
    expect(api.submit(event, "custom-reason")).toBe(true);
    expect(order).toEqual(["value", "submit", "model", "state"]);
    for (const name of ["value-change", "submit"]) {
      expect(wrapper.emitted(name)?.[0]).toEqual(["New", expect.objectContaining({ reason: "custom-reason", event })]);
    }
    expect(wrapper.emitted("state-change")?.[0]).toEqual(["edit", expect.objectContaining({ reason: "trigger", event })]);
    expect(wrapper.emitted("state-change")?.[1]).toEqual(["submit", expect.objectContaining({ reason: "custom-reason", event })]);
    await nextTick();
    api.edit();
    await nextTick();
    api.cancel();
    expect(wrapper.emitted("cancel")?.[0]?.[1]).toMatchObject({ reason: "programmatic" });
  });

  it("never substitutes refused or stale controlled values for the Vue model", async () => {
    const value = ref("Parent");
    const accept = ref(false);
    const updates = vi.fn((next: string | null) => { if (accept.value) value.value = next ?? ""; });
    const wrapper = track(mount(defineComponent({ setup: () => () => h(Editable, {
      modelValue: value.value, "onUpdate:modelValue": updates, startWithEditMode: true,
    }) })));
    const component = wrapper.getComponent(Editable);
    await wrapper.get(".akaza-editable-input").setValue("Refused");
    value.value = "External during edit";
    await nextTick();
    expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("Refused");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(updates).toHaveBeenLastCalledWith("Refused");
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("External during edit");
    await wrapper.get(".akaza-editable-edit").trigger("click");
    expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("External during edit");
    value.value = "Late parent";
    await nextTick();
    await wrapper.get(".akaza-editable-cancel").trigger("click");
    expect(component.emitted("cancel")?.[0]?.[0]).toBe("Late parent");
    await wrapper.get(".akaza-editable-edit").trigger("click");
    accept.value = true;
    await wrapper.get(".akaza-editable-input").setValue("Accepted later");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(value.value).toBe("Accepted later");
  });

  it.each([false, true])("resets the SDK session and draft without submission (initial editing %s)", async (initialEditing) => {
    const wrapper = track(mount(defineComponent({
      setup: () => ({ value: ref<string | null>(null) }),
      components: { Editable },
      template: `<form><Editable v-model="value" name="title" :start-with-edit-mode="${initialEditing}" activation-mode="click" /></form>`,
    }), { attachTo: document.body }));
    const component = wrapper.getComponent(Editable);
    if (!initialEditing) await wrapper.get(".akaza-editable-edit").trigger("click");
    await wrapper.get(".akaza-editable-input").setValue("Saved");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    await wrapper.get(".akaza-editable-edit").trigger("click");
    await wrapper.get(".akaza-editable-input").setValue("Pending");
    const form = wrapper.get<HTMLFormElement>("form").element;
    const prevent = (event: Event) => event.preventDefault();
    form.addEventListener("reset", prevent);
    form.reset();
    await settle();
    expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("Pending");
    form.removeEventListener("reset", prevent);
    form.reset();
    await settle();
    expect(wrapper.vm.value).toBeNull();
    expect(new FormData(form).get("title")).toBe("");
    expect(component.attributes("data-akaza-state")).toBe(initialEditing ? "editing" : "preview");
    if (initialEditing) expect(wrapper.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("");
    else await wrapper.get(".akaza-editable-edit").trigger("click");
    await wrapper.get(".akaza-editable-input").setValue("After reset");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(wrapper.vm.value).toBe("After reset");
    expect(component.emitted("submit")).toHaveLength(2);
  });

  it("validates empty unchanged drafts before finishing and submits only committed form values", async () => {
    const wrapper = track(mount(defineComponent({
      components: { Editable },
      template: `<form><Editable name="title" required start-with-edit-mode aria-label="Title" /></form>`,
    }), { attachTo: document.body }));
    const component = wrapper.getComponent(Editable);
    await wrapper.get(".akaza-editable-submit").trigger("click");
    await settle();
    expect(component.attributes("data-akaza-state")).toBe("editing");
    expect(component.attributes("data-akaza-invalid")).toBe("true");
    expect(component.emitted("value-change")).toBeUndefined();
    expect(document.activeElement).toBe(wrapper.get(".akaza-editable-input").element);
    await wrapper.get(".akaza-editable-input").setValue("Draft");
    const form = wrapper.get<HTMLFormElement>("form").element;
    expect(new FormData(form).get("title")).toBe("");
    await wrapper.get(".akaza-editable-submit").trigger("click");
    expect(new FormData(form).get("title")).toBe("Draft");
    expect(component.attributes("data-akaza-invalid")).toBeUndefined();
  });

  it.each(["disabled", "readOnly"] as const)("blocks submission after %s changes, but still permits cancellation", async (prop) => {
    const wrapper = track(mount(Editable, { props: { modelValue: "Value", startWithEditMode: true, name: "title" } }));
    await wrapper.get(".akaza-editable-input").setValue("Draft");
    await wrapper.setProps({ [prop]: true });
    const api = wrapper.vm as unknown as { submit: () => boolean; cancel: () => void; edit: () => void };
    expect(api.submit()).toBe(false);
    expect(calls.end).not.toHaveBeenCalled();
    api.cancel();
    await nextTick();
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Value");
    api.edit();
    await nextTick();
    expect(wrapper.find(".akaza-editable-input").exists()).toBe(false);
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it.each(["focus", "click", "dblclick", "none"] as const)("preserves %s activation", async (activationMode) => {
    const wrapper = track(mount(Editable, { props: { modelValue: "Value", activationMode } }));
    for (const type of ["focus", "click", "dblclick"]) {
      if (type === activationMode) continue;
      await wrapper.get(".akaza-editable-preview").trigger(type);
      expect(wrapper.attributes("data-akaza-state")).toBe("preview");
    }
    if (activationMode === "none") await wrapper.get(".akaza-editable-edit").trigger("click");
    else await wrapper.get(".akaza-editable-preview").trigger(activationMode);
    expect(wrapper.attributes("data-akaza-state")).toBe("editing");
  });

  it.each(["none", "blur", "enter", "both"] as const)("preserves %s submission and external versus internal focusout", async (submitMode) => {
    const wrapper = track(mount(Editable, { props: { modelValue: "Value", startWithEditMode: true, submitMode } }));
    await wrapper.get(".akaza-editable-input").setValue("Draft");
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    wrapper.get(".akaza-editable-input").element.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(wrapper.emitted("submit")).toBeUndefined();
    await wrapper.trigger("focusout", { relatedTarget: wrapper.get(".akaza-editable-submit").element });
    expect(wrapper.emitted("submit")).toBeUndefined();
    await wrapper.trigger("focusout", { relatedTarget: null });
    if (submitMode === "blur" || submitMode === "both") {
      expect(wrapper.emitted("submit")?.[0]?.[1]).toMatchObject({ reason: "blur" });
    } else {
      expect(wrapper.emitted("submit")).toBeUndefined();
      await wrapper.get(".akaza-editable-input").trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("submit")?.length ?? 0).toBe(submitMode === "enter" ? 1 : 0);
    }
  });

  it("does not restore focus after external blur, cancel, submit, or unmount", async () => {
    const other = document.createElement("button");
    document.body.append(other);
    const wrapper = track(mount(Editable, { attachTo: document.body, props: {
      modelValue: "Value", startWithEditMode: true, submitMode: "both",
    } }));
    await settle();
    other.focus();
    await settle();
    expect(wrapper.attributes("data-akaza-state")).toBe("preview");
    expect(document.activeElement).toBe(other);
    await wrapper.get(".akaza-editable-edit").trigger("click");
    await wrapper.get(".akaza-editable-cancel").trigger("click");
    other.focus();
    await settle();
    expect(document.activeElement).toBe(other);
    await wrapper.get(".akaza-editable-edit").trigger("click");
    wrapper.unmount();
    other.focus();
    await settle();
    expect(document.activeElement).toBe(other);
    expect(calls.bindInput).not.toHaveBeenCalled();
  });

  it("preserves first-pointer selection, pointer cancellation and later native caret placement", async () => {
    const wrapper = track(mount(Editable, { attachTo: document.body, props: {
      modelValue: "Select this", startWithEditMode: true, selectOnFocus: true, submitMode: "none",
    } }));
    await settle();
    const input = wrapper.get<HTMLInputElement>(".akaza-editable-input");
    input.element.blur();
    await settle();
    await input.trigger("pointerdown");
    input.element.focus();
    input.element.setSelectionRange(3, 3);
    await input.trigger("pointerup");
    expect([input.element.selectionStart, input.element.selectionEnd]).toEqual([0, 11]);
    await input.trigger("pointerdown");
    input.element.setSelectionRange(2, 2);
    await input.trigger("pointerup");
    expect([input.element.selectionStart, input.element.selectionEnd]).toEqual([2, 2]);
    input.element.blur();
    await settle();
    await input.trigger("pointerdown");
    await input.trigger("pointercancel");
    input.element.setSelectionRange(4, 4);
    await input.trigger("pointerup");
    expect([input.element.selectionStart, input.element.selectionEnd]).toEqual([4, 4]);
    const api = wrapper.vm as unknown as { focus: () => void };
    api.focus();
    await settle();
    expect(document.activeElement).toBe(input.element);
  });
});
