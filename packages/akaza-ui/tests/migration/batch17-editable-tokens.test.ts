import { createInlineEdit, definePrimitive } from "@ui-sdk/core";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Editable } from "@/components/editable";
import { PinInput } from "@/components/pin-input";
import { TagsInput } from "@/components/tags-input";

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
});

const session = definePrimitive({
  name: "akaza-batch17-inline-edit-proof",
  options: { commit: "callback" },
  state: (_options: { commit: () => boolean }) => ({ editing: null as string | null }),
  api: context => ({ edit: createInlineEdit(context, {
    key: "editing",
    value: () => "Original",
    commit: () => context.options().commit(),
  }) }),
  slots: () => ({}),
});

describe("batch 17 public inline-edit compatibility evidence", () => {
  it("skips unchanged commits, unlike Akaza's cancelable unchanged submit", async () => {
    const commit = vi.fn(() => false);
    const instance = session({ id: "batch17-proof", commit });
    const input = document.createElement("input");
    document.body.append(input);
    instance.api.edit.start("title");
    const unbind = instance.api.edit.bindInput(input);
    try {
      await settle();
      expect(input.value).toBe("Original");
      expect(instance.api.edit.end("enter-key")).toBe(true);
      expect(commit).not.toHaveBeenCalled();
      expect(instance.get().editing).toBeNull();
    } finally {
      unbind();
      instance.destroy();
    }
  });

  it("can reject changed commits but exposes no cancel callback", async () => {
    const commit = vi.fn(() => false);
    const instance = session({ id: "batch17-rejected", commit });
    const input = document.createElement("input");
    document.body.append(input);
    instance.api.edit.start("title");
    const unbind = instance.api.edit.bindInput(input);
    try {
      await settle();
      input.value = "Changed";
      expect(instance.api.edit.end("enter-key")).toBe(false);
      expect(commit).toHaveBeenCalledOnce();
      expect(instance.get().editing).toBe("title");
      instance.api.edit.cancel();
      expect(instance.get().editing).toBeNull();
      expect(commit).toHaveBeenCalledOnce();
    } finally {
      unbind();
      instance.destroy();
    }
  });
});

describe("batch 17 Editable contracts", () => {
  it("keeps unchanged submit cancelable and preserves event identity/reasons", async () => {
    const submit = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", startWithEditMode: true, submitMode: "enter", onSubmit: submit,
    } }));
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    wrapper.get(".akaza-editable-input").element.dispatchEvent(event);
    await settle();
    expect(submit).toHaveBeenCalledWith("Original", expect.objectContaining({ reason: "enter", event }));
    expect(wrapper.emitted("value-change")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.attributes("data-akaza-state")).toBe("editing");
  });

  it("rejects draft and cancel requests without losing the accepted draft", async () => {
    const draftChange = vi.fn((_value, details) => details.cancel());
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", startWithEditMode: true, onDraftChange: draftChange, onCancel: cancel,
    } }));
    const input = wrapper.get(".akaza-editable-input");
    await input.setValue("Rejected");
    expect((input.element as HTMLInputElement).value).toBe("Original");
    await input.trigger("keydown", { key: "Escape" });
    expect(cancel).toHaveBeenCalledWith("Original", expect.objectContaining({ reason: "trigger" }));
    expect(wrapper.attributes("data-akaza-state")).toBe("editing");
  });

  it.each([{ isComposing: true }, { keyCode: 229 }])("ignores composing Enter/Escape: %o", async (guard) => {
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Original", startWithEditMode: true, submitMode: "both",
    } }));
    const input = wrapper.get(".akaza-editable-input");
    await input.setValue("Draft");
    for (const key of ["Enter", "Escape"]) await input.trigger("keydown", { key, ...guard });
    expect(wrapper.emitted("submit")).toBeUndefined();
    expect(wrapper.emitted("cancel")).toBeUndefined();
    expect(wrapper.attributes("data-akaza-state")).toBe("editing");
  });

  it("keeps native Tab, root-level blur, and multiline Enter policies", async () => {
    const wrapper = track(mount(Editable, { attachTo: document.body, props: {
      modelValue: "Original", startWithEditMode: true, submitMode: "both", multiline: true,
    } }));
    await settle();
    const input = wrapper.get("textarea");
    await input.setValue("Line one\nLine two");
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    input.element.dispatchEvent(tab);
    await input.trigger("keydown", { key: "Enter" });
    expect(tab.defaultPrevented).toBe(false);
    expect(wrapper.emitted("submit")).toBeUndefined();
    (wrapper.get(".akaza-editable-submit").element as HTMLButtonElement).focus();
    await settle();
    expect(wrapper.emitted("submit")).toBeUndefined();
    await input.trigger("keydown", { key: "Enter", ctrlKey: true });
    expect(wrapper.emitted("submit")?.[0]?.[1]).toMatchObject({ reason: "enter" });
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Line one\nLine two");
  });

  it("preserves first-pointer selection without forcing later pointer selections", async () => {
    const wrapper = track(mount(Editable, { attachTo: document.body, props: {
      modelValue: "Select me", selectOnFocus: true,
    } }));
    await wrapper.get(".akaza-editable-preview").trigger("pointerdown");
    await settle();
    const input = wrapper.get(".akaza-editable-input");
    const element = input.element as HTMLInputElement;
    expect(document.activeElement).toBe(element);
    expect([element.selectionStart, element.selectionEnd]).toEqual([0, 9]);
    await input.trigger("pointerdown");
    element.setSelectionRange(2, 2);
    await input.trigger("pointerup");
    expect([element.selectionStart, element.selectionEnd]).toEqual([2, 2]);
  });

  it("returns to the parent's committed value after a refused controlled request", async () => {
    const wrapper = track(mount(Editable, { props: {
      modelValue: "Parent", "onUpdate:modelValue": vi.fn(), startWithEditMode: true, submitMode: "enter",
    } }));
    await wrapper.get(".akaza-editable-input").setValue("Refused");
    await wrapper.get(".akaza-editable-input").trigger("keydown", { key: "Enter" });
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Parent");
    await wrapper.get(".akaza-editable-edit").trigger("click");
    expect((wrapper.get(".akaza-editable-input").element as HTMLInputElement).value).toBe("Parent");
  });
});

function tags(values = ["a", "b", "c"]) {
  return track(mount(defineComponent({
    components: { TagsInput },
    setup: () => ({ value: ref(values) }),
    template: `<TagsInput v-model="value" />`,
  }), { attachTo: document.body }));
}

describe("batch 17 TagsInput focus and token contracts", () => {
  it.each([0, 1, 2])("recovers removal at index %i to next or previous token", async (index) => {
    const wrapper = tags();
    const item = wrapper.findAll(".akaza-tags-input-item")[index]!;
    (item.element as HTMLElement).focus();
    await item.trigger("keydown", { key: "Delete" });
    await settle();
    const expected = wrapper.findAll(".akaza-tags-input-item")[Math.min(index, 1)]!;
    expect(document.activeElement).toBe(expected.element);
    expect(expected.attributes("data-akaza-highlighted")).toBe("true");
    expect(wrapper.getComponent(TagsInput).emitted("remove")?.[0]?.[1]).toMatchObject({ reason: "remove" });
  });

  it("recovers the final deleted token to the editor", async () => {
    const wrapper = tags(["last"]);
    const item = wrapper.get(".akaza-tags-input-item");
    (item.element as HTMLElement).focus();
    await item.trigger("keydown", { key: "Backspace" });
    await settle();
    expect(document.activeElement).toBe(wrapper.get(".akaza-tags-input-input").element);
    wrapper.vm.value = ["replacement"];
    await settle();
    expect(wrapper.get(".akaza-tags-input-item").attributes("data-akaza-highlighted")).toBeUndefined();
  });

  it("does not steal focus from a control focused before removal settles", async () => {
    const wrapper = tags();
    const other = document.createElement("button");
    document.body.append(other);
    const item = wrapper.findAll(".akaza-tags-input-item")[1]!;
    (item.element as HTMLElement).focus();
    item.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true }));
    other.focus();
    await settle();
    expect(document.activeElement).toBe(other);
  });

  it("does not recover after unmount or a refused controlled removal", async () => {
    const wrapper = track(mount(TagsInput, { attachTo: document.body, props: {
      modelValue: ["a", "b"], "onUpdate:modelValue": vi.fn(),
    } }));
    const item = wrapper.findAll(".akaza-tags-input-item")[1]!;
    (item.element as HTMLElement).focus();
    await item.trigger("keydown", { key: "Delete" });
    await settle();
    expect(wrapper.findAll(".akaza-tags-input-item")).toHaveLength(2);
    expect(document.activeElement).toBe(item.element);
    wrapper.unmount();
    await settle();
    expect(document.activeElement).toBe(document.body);
  });

  it("ignores queued recovery after its editor unmounts", async () => {
    const wrapper = tags();
    const item = wrapper.get(".akaza-tags-input-item");
    (item.element as HTMLElement).focus();
    item.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true }));
    wrapper.unmount();
    await settle();
    expect(document.activeElement).toBe(document.body);
  });

  it("retains focused tags after canceled remove and value-change requests", async () => {
    for (const eventName of ["onRemove", "onValueChange"]) {
      const cancel = vi.fn((_value, details) => details.cancel());
      const wrapper = track(mount(TagsInput, { attachTo: document.body, props: {
        modelValue: ["a", "b"], [eventName]: cancel,
      } }));
      const item = wrapper.findAll(".akaza-tags-input-item")[1]!;
      (item.element as HTMLElement).focus();
      await item.trigger("keydown", { key: "Delete" });
      await settle();
      expect(cancel).toHaveBeenCalledOnce();
      expect(wrapper.findAll(".akaza-tags-input-item")).toHaveLength(2);
      expect(document.activeElement).toBe(item.element);
    }
  });

  it.each([{ isComposing: true }, { keyCode: 229 }])("ignores token/editor IME keys: %o", async (guard) => {
    const wrapper = tags();
    const input = wrapper.get(".akaza-tags-input-input");
    await input.setValue("draft");
    await input.trigger("keydown", { key: "Enter", ...guard });
    await wrapper.get(".akaza-tags-input-item").trigger("keydown", { key: "Delete", ...guard });
    expect(wrapper.getComponent(TagsInput).emitted("add")).toBeUndefined();
    expect(wrapper.getComponent(TagsInput).emitted("remove")).toBeUndefined();
  });

  it("keeps object equality, validation, paste batching, and native serialization", async () => {
    const wrapper = track(mount(TagsInput, { props: {
      name: "tag", addOnPaste: true, max: 2,
      convertValue: text => ({ id: text.toLowerCase() }),
      displayValue: value => String((value as { id: string }).id),
      serializeValue: value => String((value as { id: string }).id),
      isEqual: (a, b) => (a as { id: string }).id === (b as { id: string }).id,
      validate: value => (value as { id: string }).id !== "bad",
    } }));
    await wrapper.get("input.akaza-tags-input-input").trigger("paste", {
      clipboardData: { getData: () => "Vue,VUE,bad,Nuxt,Vite" },
    });
    expect(wrapper.emitted("value-change")).toHaveLength(1);
    expect(wrapper.emitted("invalid-value")?.map(args => (args[1] as { reason: string }).reason))
      .toEqual(["duplicate", "invalid", "max"]);
    expect(wrapper.findAll(".akaza-tags-input-item-text").map(item => item.text())).toEqual(["vue", "nuxt"]);
    expect(wrapper.findAll(".akaza-tags-input-hidden-input").map(item => (item.element as HTMLInputElement).value))
      .toEqual(["vue", "nuxt"]);
  });
});

describe("batch 17 PinInput contracts", () => {
  it("keeps cells and completion aligned when a controlled parent refuses paste", async () => {
    const update = vi.fn();
    const wrapper = track(mount(PinInput, { props: {
      modelValue: "12", length: 4, "onUpdate:modelValue": update,
    } }));
    await wrapper.get(".akaza-pin-input-input").trigger("paste", { clipboardData: { getData: () => "9876" } });
    await settle();
    expect(update).toHaveBeenCalledWith("9876");
    expect(wrapper.findAll(".akaza-pin-input-input").map(input => (input.element as HTMLInputElement).value))
      .toEqual(["1", "2", "", ""]);
    expect(wrapper.emitted("complete")).toBeUndefined();
    await wrapper.setProps({ modelValue: "4321" });
    expect(wrapper.findAll(".akaza-pin-input-input").map(input => (input.element as HTMLInputElement).value))
      .toEqual(["4", "3", "2", "1"]);
  });

  it("restores positional gaps when a later controlled request is refused", async () => {
    const accept = ref(true);
    const wrapper = track(mount(defineComponent({
      components: { PinInput },
      setup: () => ({ accept, value: ref("1234") }),
      template: `<PinInput :model-value="value" :length="4" @update:model-value="next => { if (accept) value = next }" />`,
    }), { attachTo: document.body }));
    const inputs = wrapper.findAll(".akaza-pin-input-input");
    await inputs[1]!.trigger("keydown", { key: "Delete" });
    await settle();
    accept.value = false;
    (inputs[1]!.element as HTMLInputElement).focus();
    await inputs[1]!.setValue("9");
    await settle();
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual(["1", "", "3", "4"]);
    expect(document.activeElement).toBe(inputs[1]!.element);
    expect(wrapper.getComponent(PinInput).emitted("complete")).toBeUndefined();
  });

  it.each([{ isComposing: true }, { keyCode: 229 }])("ignores IME navigation and deletion: %o", async (guard) => {
    const wrapper = track(mount(PinInput, { attachTo: document.body, props: { modelValue: "12", length: 3 } }));
    const input = wrapper.get(".akaza-pin-input-input");
    (input.element as HTMLInputElement).focus();
    for (const key of ["Delete", "Backspace", "ArrowRight", "End"]) await input.trigger("keydown", { key, ...guard });
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(document.activeElement).toBe(input.element);
  });

  it("distributes filtered OTP paste, masks cells, completes once, and preserves gaps", async () => {
    const wrapper = track(mount(PinInput, { props: { type: "number", otp: true, mask: true, length: 4 } }));
    const inputs = wrapper.findAll(".akaza-pin-input-input");
    expect(inputs[0]!.attributes("autocomplete")).toBe("one-time-code");
    expect(inputs[1]!.attributes("autocomplete")).toBe("off");
    expect(inputs[0]!.attributes("type")).toBe("password");
    await inputs[0]!.trigger("paste", { clipboardData: { getData: () => "1x2 34" } });
    await settle();
    expect(wrapper.emitted("complete")).toHaveLength(1);
    await inputs[1]!.trigger("keydown", { key: "Delete" });
    await settle();
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual(["1", "", "3", "4"]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe("134");
    expect(wrapper.attributes("data-akaza-state")).toBe("incomplete");
    expect(wrapper.emitted("complete")).toHaveLength(1);
  });

  it("canceled paste retains positional draft and does not complete or advance focus", async () => {
    const wrapper = track(mount(PinInput, { attachTo: document.body, props: {
      modelValue: "12", length: 4, onValueChange: (_value, details) => details.cancel(),
    } }));
    const inputs = wrapper.findAll(".akaza-pin-input-input");
    (inputs[1]!.element as HTMLInputElement).focus();
    await inputs[1]!.trigger("paste", { clipboardData: { getData: () => "999" } });
    await settle();
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual(["1", "2", "", ""]);
    expect(wrapper.emitted("complete")).toBeUndefined();
    expect(document.activeElement).toBe(inputs[1]!.element);
  });
});

describe("batch 17 native forms and reset", () => {
  it("hydrates stable native controls and scoped slot bindings without SDK markup", async () => {
    const fixture = defineComponent({
      setup: () => () => h("form", [
        h(Editable, { modelValue: "Title", name: "title", startWithEditMode: true, selectOnFocus: true }),
        h(TagsInput, { modelValue: ["tag"], name: "tags" }, {
          input: ({ inputProps }: { inputProps: Record<string, unknown> }) => h("input", { ...inputProps, "data-custom": "tags" }),
        }),
        h(PinInput, { modelValue: "12", name: "pin", length: 2 }, {
          cell: ({ inputProps }: { inputProps: Record<string, unknown> }) => h("input", { ...inputProps, "data-custom": "pin" }),
        }),
      ]),
    });
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = await renderToString(createSSRApp(fixture));
    const ids = Array.from(host.querySelectorAll("[id]")).map(element => element.id);
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    const app = createSSRApp(fixture);
    track({ unmount: () => app.unmount() });
    try {
      app.mount(host);
      await settle();
      expect(Array.from(host.querySelectorAll("[id]")).map(element => element.id)).toEqual(ids);
      expect(host.querySelectorAll('[data-custom="pin"]')).toHaveLength(2);
      expect(host.querySelectorAll('[data-custom="tags"]')).toHaveLength(1);
      expect(host.querySelector("[data-slot]")).toBeNull();
      expect([...new FormData(host.querySelector("form")!).entries()]).toEqual([
        ["title", "Title"], ["tags", "tag"], ["pin", "12"],
      ]);
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
      warn.mockRestore();
    }
  });

  it.each(["editable", "tags", "pin"])("preserves %s native reset cancellation and committed FormData", async (kind) => {
    const wrapper = track(mount(defineComponent({
      components: { Editable, TagsInput, PinInput },
      setup: () => ({ title: ref("Initial"), tags: ref(["initial"]), pin: ref("12") }),
      template: `<form>
        <Editable v-model="title" name="title" start-with-edit-mode />
        <TagsInput v-model="tags" name="tags" />
        <PinInput v-model="pin" name="pin" :length="2" />
      </form>`,
    }), { attachTo: document.body }));
    await settle();
    if (kind === "editable") {
      await wrapper.get(".akaza-editable-input").setValue("Changed");
      expect(new FormData(wrapper.get("form").element as HTMLFormElement).get("title")).toBe("Initial");
      await wrapper.get(".akaza-editable-submit").trigger("click");
    } else if (kind === "tags") {
      await wrapper.get(".akaza-tags-input-input").setValue("added");
      await wrapper.get(".akaza-tags-input-input").trigger("keydown", { key: "Enter" });
    } else {
      await wrapper.get(".akaza-pin-input-input").trigger("paste", { clipboardData: { getData: () => "34" } });
    }
    const form = wrapper.get("form").element as HTMLFormElement;
    const changed = new FormData(form).getAll(kind === "editable" ? "title" : kind);
    const prevent = (event: Event) => event.preventDefault();
    form.addEventListener("reset", prevent);
    form.reset();
    await settle();
    expect(new FormData(form).getAll(kind === "editable" ? "title" : kind)).toEqual(changed);
    form.removeEventListener("reset", prevent);
    form.reset();
    await settle();
    expect(new FormData(form).get("title")).toBe("Initial");
    expect(new FormData(form).getAll("tags")).toEqual(["initial"]);
    expect(new FormData(form).get("pin")).toBe("12");
  });

  it("disables all native fields and blocks exposed changes", async () => {
    const wrapper = track(mount(defineComponent({
      components: { Editable, TagsInput, PinInput },
      template: `<form>
        <Editable name="title" model-value="Title" disabled />
        <TagsInput name="tags" :model-value="['tag']" disabled />
        <PinInput name="pin" model-value="12" disabled />
      </form>`,
    })));
    const editable = wrapper.getComponent(Editable);
    const tags = wrapper.getComponent(TagsInput);
    const pin = wrapper.getComponent(PinInput);
    editable.vm.edit();
    tags.vm.clear();
    pin.vm.clear();
    await settle();
    expect([...new FormData(wrapper.get("form").element as HTMLFormElement).entries()]).toEqual([]);
    expect(editable.emitted("state-change")).toBeUndefined();
    expect(tags.emitted("value-change")).toBeUndefined();
    expect(pin.emitted("value-change")).toBeUndefined();
  });
});
