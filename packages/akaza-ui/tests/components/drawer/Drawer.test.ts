import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";
import { popupEnvironment, settled } from "../dialog/popup-fixture";

popupEnvironment();
enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});

function backgroundInput() {
  const input = document.createElement("input");
  document.body.append(input);
  input.focus();
  return input;
}

describe("drawer modality", () => {
  it("leaves background content, scrolling, and focus alone in nonmodal mode", async () => {
    const background = backgroundInput();
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: { modelValue: true, modal: false, title: "Issue preview" },
      slots: { body: "<button>Preview action</button>" },
    });
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(".akaza-drawer")!;
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.hasAttribute("aria-modal")).toBe(false);
    expect(document.querySelector(".akaza-drawer-overlay")).toBeNull();
    expect(background.inert).not.toBe(true);
    expect(background.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.activeElement).toBe(background);
    panel.querySelector("button")!.focus();
    background.focus();
    expect(document.activeElement).toBe(background);
    await wrapper.setProps({ modelValue: false });
    expect(document.activeElement).toBe(background);
  });

  it("keeps modal behavior by default and updates modality while open", async () => {
    const background = backgroundInput();
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: { modelValue: true, teleport: false, title: "Edit issue" },
      slots: { body: "<button>Save</button>" },
    });
    await flushPromises();
    expect(wrapper.get(".akaza-drawer").attributes("aria-modal")).toBe("true");
    await settled();
    expect(wrapper.find(".akaza-drawer-overlay").exists()).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(background.inert).toBe(true);
    // jsdom has no layout, so SDK auto focus can choose the content fallback.
    expect(wrapper.get(".akaza-drawer").element.contains(document.activeElement)).toBe(true);
    await wrapper.setProps({ modal: false });
    await flushPromises();
    expect(wrapper.find(".akaza-drawer-overlay").exists()).toBe(false);
    expect(background.inert).not.toBe(true);
    expect(document.documentElement.style.overflow).toBe("");
    background.focus();
    expect(document.activeElement).toBe(background);
    await wrapper.setProps({ modal: true });
    await flushPromises();
    expect(background.inert).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("supports cancelable Escape dismissal without trapping nonmodal focus", async () => {
    const background = backgroundInput();
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true, modal: false, title: "Preview",
        onOpenChange: (_open, details) => details.cancel(),
      },
    });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();
    expect(document.querySelector(".akaza-drawer")).not.toBeNull();
    expect(wrapper.emitted("open-change")?.[0]?.[1]).toMatchObject({ reason: "escape" });
    expect(document.activeElement).toBe(background);
  });

  it("keeps nested portals in the enclosing modal focus scope", async () => {
    mount(defineComponent({
      components: { Dialog, Drawer, Select },
      template: `
        <Dialog :model-value="true" title="Issue editor">
          <template #body>
            <button>Editor action</button>
            <Drawer :model-value="true" :modal="false" title="Preview">
              <template #body>
                <Select :open="true" autocomplete teleport="body" aria-label="Project"
                  :options="[{ value: 'a', label: 'Alpha' }]" />
              </template>
            </Drawer>
          </template>
        </Dialog>`,
    }), { attachTo: document.body });
    await settled();
    const search = document.querySelector<HTMLInputElement>(".akaza-select-search-input")!;
    expect(search.closest('[aria-hidden="true"]')).toBeNull();
    search.focus();
    expect(document.activeElement).toBe(search);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("restores focus when closing with focus in a logically owned portal", async () => {
    const background = backgroundInput();
    const wrapper = mount(defineComponent({
      components: { Drawer, Select },
      setup: () => ({ open: ref(true) }),
      template: `<Drawer v-model="open" :modal="false" title="Preview">
        <template #body><Select :open="true" autocomplete teleport="body" aria-label="Project"
          :options="[{ value: 'a', label: 'Alpha' }]" /></template>
      </Drawer>`,
    }), { attachTo: document.body });
    await flushPromises();
    const search = document.querySelector<HTMLInputElement>(".akaza-select-search-input")!;
    search.focus();
    expect(document.activeElement).toBe(search);
    wrapper.vm.open = false;
    await flushPromises();
    expect(document.activeElement).toBe(background);
  });
});
