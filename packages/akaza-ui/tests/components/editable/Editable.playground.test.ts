import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Editable } from "@/components/editable";
import { Field } from "@/components/field";
import EditableSection from "../../../../../playground/src/sections/editable/EditableSection.vue";

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  document.body.replaceChildren();
});
async function settle() {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
}

describe("editable public integration", () => {
  it("hydrates stable native markup and runs independent SDK sessions with slots", async () => {
    const warnings = vi.spyOn(console, "error").mockImplementation(() => {});
    cleanups.push(() => warnings.mockRestore());
    const App = defineComponent({ setup() {
      const value = ref("Preview");
      return () => h("form", [
        h(Editable, { modelValue: value.value, "onUpdate:modelValue": next => value.value = next ?? "", activationMode: "click", ariaLabel: "Title", dir: "rtl", ui: { root: "custom-root", input: "custom-input" } }, {
          preview: ({ value }: { value: string }) => h("strong", value),
          state: ({ draft, isEditing }: { draft: string; isEditing: boolean }) => h("output", { "data-editing": isEditing }, draft),
        }),
        h(Editable, { modelValue: "Initial draft", startWithEditMode: true, multiline: true, submitMode: "none", ariaLabel: "Summary" }),
      ]);
    } });
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = await renderToString(createSSRApp(App));
    const ids = [...container.querySelectorAll("[id]")].map(element => element.id);
    const app = createSSRApp(App);
    app.mount(container);
    cleanups.push(() => app.unmount());
    await settle();
    expect([...container.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    const editors = container.querySelectorAll<HTMLElement>(".akaza-editable");
    expect(editors[0]?.getAttribute("dir")).toBe("rtl");
    expect(editors[0]?.classList.contains("custom-root")).toBe(true);
    expect(editors[0]?.querySelector("strong")?.textContent).toBe("Preview");
    editors[0]?.querySelector<HTMLButtonElement>(".akaza-editable-preview")?.click();
    await settle();
    const input = editors[0]!.querySelector<HTMLInputElement>(".akaza-editable-input")!;
    expect(input.classList.contains("custom-input")).toBe(true);
    expect(input.getAttribute("aria-label")).toBe("Title");
    input.value = "Hydrated draft";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();
    expect(editors[0]?.querySelector("output")?.textContent).toBe("Hydrated draft");
    expect(editors[0]?.querySelector("output")?.getAttribute("data-editing")).toBe("true");
    editors[0]?.querySelector<HTMLButtonElement>(".akaza-editable-submit")?.click();
    await settle();
    expect(editors[0]?.querySelector("strong")?.textContent).toBe("Hydrated draft");
    expect(editors[1]?.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe("Initial draft");
    expect(warnings).not.toHaveBeenCalled();
  });

  it("wires unchanged vetoes, draft/cancel vetoes, controlled refusal and acceptance in the actual playground", async () => {
    const wrapper = mount(EditableSection);
    cleanups.push(() => wrapper.unmount());
    const editors = wrapper.findAllComponents(Editable);
    const first = editors[0]!;
    expect(first.props("ariaLabel")).toBe("Planning title");
    await first.get(".akaza-editable-preview").trigger("click");
    await first.get(".akaza-editable-submit").trigger("click");
    expect(first.attributes("data-akaza-state")).toBe("editing");
    expect(wrapper.text()).toContain("Unchanged submit canceled; draft stays open.");
    const controlled = editors.find(editor => editor.props("ariaLabel") === "Controlled title")!;
    await controlled.get(".akaza-editable-preview").trigger("click");
    await controlled.get(".akaza-editable-input").setValue("Rejected!");
    expect(controlled.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("Parent-owned title");
    await controlled.get(".akaza-editable-input").setValue("Requested title");
    await controlled.get(".akaza-editable-cancel").trigger("click");
    expect(controlled.get<HTMLInputElement>(".akaza-editable-input").element.value).toBe("Requested title");
    expect(wrapper.text()).toContain("Cancel rejected; draft stays open.");
    await controlled.get(".akaza-editable-submit").trigger("click");
    expect(controlled.get(".akaza-editable-preview").text()).toBe("Parent-owned title");
    expect(wrapper.text()).toContain("Model update refused; parent value kept.");
    const toggles = wrapper.findAll('input[type="checkbox"]');
    await toggles[0]!.setValue(true);
    await controlled.get(".akaza-editable-preview").trigger("click");
    await controlled.get(".akaza-editable-input").setValue("Accepted title");
    await controlled.get(".akaza-editable-submit").trigger("click");
    expect(controlled.get(".akaza-editable-preview").text()).toBe("Accepted title");
    await toggles[1]!.setValue(true);
    await controlled.get(".akaza-editable-preview").trigger("click");
    await controlled.get(".akaza-editable-input").setValue("Discard");
    await controlled.get(".akaza-editable-cancel").trigger("click");
    expect(controlled.get(".akaza-editable-preview").text()).toBe("Accepted title");
  });

  it("documents the SDK boundary and distinct canceled versus refused update outcomes", () => {
    const docs = readFileSync(resolve(__dirname, "../../../../../docs/content/3.components/editable.md"), "utf8");
    for (const text of ["SDK inline-edit", "flat Vue API", "refuses `update:modelValue`", "Canceling `cancel`", "latest parent value", "native focus/selection"]) {
      expect(docs).toContain(text);
    }
  });

  it("inherits Field metadata, keeps drafts out of FormData, and excludes disabled values", async () => {
    const wrapper = mount(defineComponent({
      components: { Editable, Field },
      setup: () => ({ value: ref("Committed"), disabled: ref(false) }),
      template: `<form><Field id="release-title" label="Release title" name="title" description="Release name" required :disabled="disabled"><Editable v-model="value" activation-mode="click" /></Field></form>`,
    }), { attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    const editor = wrapper.getComponent(Editable);
    const form = wrapper.get<HTMLFormElement>("form").element;
    const preview = editor.get(".akaza-editable-preview");
    expect(preview.attributes("id")).toBe(wrapper.get("label").attributes("for"));
    expect(preview.attributes("aria-describedby")).toBe(wrapper.get(".akaza-field-description").attributes("id"));
    await preview.trigger("click");
    await settle();
    expect(editor.get(".akaza-editable-input").attributes("aria-required")).toBe("true");
    expect(document.activeElement).toBe(editor.get(".akaza-editable-input").element);
    expect(editor.attributes("data-akaza-focused")).toBe("true");
    await editor.get(".akaza-editable-input").setValue("Draft");
    expect(new FormData(form).get("title")).toBe("Committed");
    await editor.get(".akaza-editable-submit").trigger("click");
    expect(new FormData(form).get("title")).toBe("Draft");
    expect(wrapper.vm.value).toBe("Draft");
    wrapper.vm.disabled = true;
    await nextTick();
    expect(new FormData(form).has("title")).toBe(false);
    expect(editor.get<HTMLButtonElement>(".akaza-editable-edit").element.disabled).toBe(true);
  });
});
