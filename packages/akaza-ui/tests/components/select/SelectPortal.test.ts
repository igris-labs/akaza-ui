import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Dialog } from "@/components/dialog";
import { Select } from "@/components/select";

enableAutoUnmount(afterEach);
afterEach(() => { document.body.innerHTML = ""; });
const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];

describe("select portals", () => {
  it("keeps the native form control inline while rendering the listbox in body", async () => {
    const wrapper = mount(defineComponent({
      components: { Select },
      setup: () => ({ value: ref("a"), options }),
      template: '<form><Select v-model="value" :options="options" :open="true" teleport="body" name="project" aria-label="Project" /></form>',
    }), { attachTo: document.body });
    await flushPromises();
    const content = document.querySelector<HTMLElement>(".akaza-select-content")!;
    expect(document.body.contains(content)).toBe(true);
    expect(wrapper.element.contains(content)).toBe(false);
    expect(content.style.position).toBe("fixed");
    expect(wrapper.get("select").element.form).toBe(wrapper.get("form").element);
    content.querySelector<HTMLElement>('[role="option"]:last-child')!.click();
    await flushPromises();
    expect(wrapper.vm.value).toBe("b");
    expect(new FormData(wrapper.get("form").element).get("project")).toBe("b");
    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("tracks a custom portal target and can switch back inline while open", async () => {
    const target = document.createElement("div");
    target.id = "select-portal";
    document.body.append(target);
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options, open: true, teleport: "#select-portal", ariaLabel: "Project" },
    });
    await flushPromises();
    expect(target.querySelector(".akaza-select-content")).not.toBeNull();
    await wrapper.setProps({ teleport: false });
    await flushPromises();
    expect(target.querySelector(".akaza-select-content")).toBeNull();
    expect(wrapper.element.contains(wrapper.get(".akaza-select-content").element)).toBe(true);
    expect((wrapper.get(".akaza-select-content").element as HTMLElement).style.position).toBe("absolute");
  });

  it("keeps portaled search and scrollbar gestures internal, then dismisses outside", async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options, open: true, autocomplete: true, teleport: "body", ariaLabel: "Project" },
    });
    await flushPromises();
    const content = document.querySelector<HTMLElement>(".akaza-select-content")!;
    const search = content.querySelector<HTMLInputElement>("input")!;
    expect(search.hasAttribute("aria-expanded")).toBe(false);
    expect(document.activeElement).toBe(search);
    content.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    search.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await flushPromises();
    expect(wrapper.emitted("open-change")).toBeUndefined();
    content.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    await flushPromises();
    expect(wrapper.emitted("open-change")?.[0]).toMatchObject([false, { reason: "outside-click" }]);
  });

  it("dismisses a portaled search on Escape and returns focus to its trigger", async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { options, open: true, autocomplete: true, teleport: "body", ariaLabel: "Project" },
    });
    await flushPromises();
    document.querySelector<HTMLInputElement>(".akaza-select-search-input")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(wrapper.emitted("open-change")?.[0]).toMatchObject([false, { reason: "escape" }]);
    expect(document.activeElement).toBe(wrapper.get("button").element);
  });

  it("puts an initially open portal above its owning Dialog's Escape layer", async () => {
    const wrapper = mount(defineComponent({
      components: { Dialog, Select },
      setup: () => ({ dialogOpen: ref(true), selectOpen: ref(true), options }),
      template: `<Dialog v-model="dialogOpen" title="Editor"><template #body>
        <Select v-model:open="selectOpen" :options="options" teleport="body" aria-label="Project" />
      </template></Dialog>`,
    }), { attachTo: document.body });
    await flushPromises();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(wrapper.vm.selectOpen).toBe(false);
    expect(wrapper.vm.dialogOpen).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(wrapper.vm.dialogOpen).toBe(false);
  });
});
