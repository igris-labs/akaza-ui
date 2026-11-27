import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { AlertDialog } from "@/components/alert-dialog";
import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";
import { Menu } from "@/components/menu";
import { Popover } from "@/components/popover";
import { Tooltip } from "@/components/tooltip";
import { outsidePress } from "../dialog/popup-fixture";
import { installPopupTestEnvironment, settlePopup } from "../popover/popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();

afterEach(() => {
  vi.useRealTimers();
  document.body.style.overflow = "";
  document.body.innerHTML = "";
});

describe("overlay components", () => {
  it("opens Dialog from a native event, locks scrolling, and restores focus", async () => {
    const wrapper = mount(defineComponent({
      components: { Dialog },
      setup() {
        const open = ref(false);
        return { open };
      },
      template: `
        <Dialog v-model="open" title="Settings" description="Change settings" :teleport="false">
          <template #trigger="{ open: show }"><button class="dialog-trigger" @click="show">Open</button></template>
          <template #body><button class="dialog-action">Save</button></template>
        </Dialog>
      `,
    }), { attachTo: document.body });
    const trigger = wrapper.get(".dialog-trigger");
    trigger.element.focus();

    await trigger.trigger("click");
    await settlePopup();
    const dialog = wrapper.get("[role='dialog']");
    expect(dialog.attributes("aria-modal")).toBe("true");
    expect(dialog.attributes("aria-labelledby")).toBe(wrapper.get(".akaza-dialog-title").attributes("id"));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(wrapper.get(".dialog-action").element);

    await outsidePress(wrapper.get(".akaza-dialog-overlay").element);
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("lets AlertDialog block Escape from an underlying Dialog", async () => {
    const wrapper = mount(defineComponent({
      components: { AlertDialog, Dialog },
      setup() {
        const alertOpen = ref(false);
        const dialogOpen = ref(true);
        return { alertOpen, dialogOpen };
      },
      template: `
        <Dialog v-model="dialogOpen" aria-label="Dialog" :teleport="false">
          <template #body><button>Dialog action</button></template>
        </Dialog>
        <AlertDialog v-model="alertOpen" title="Delete?" :teleport="false">
          <template #footer="{ close }"><button data-akaza-cancel @click="close">Cancel</button></template>
        </AlertDialog>
      `,
    }), { attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as { alertOpen: boolean }).alertOpen = true;
    await nextTick();
    await nextTick();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await nextTick();
    expect((wrapper.vm as unknown as { alertOpen: boolean }).alertOpen).toBe(true);
    expect((wrapper.vm as unknown as { dialogOpen: boolean }).dialogOpen).toBe(true);
    expect(document.activeElement).toBe(wrapper.get("[data-akaza-cancel]").element);

    (wrapper.vm as unknown as { alertOpen: boolean }).alertOpen = false;
    await nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await nextTick();
    expect((wrapper.vm as unknown as { dialogOpen: boolean }).dialogOpen).toBe(false);
    wrapper.unmount();
  });

  it("exposes Drawer side/inset state and honors backdrop policy", async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true, side: "left", inset: 12, closeOnBackdropClick: false, teleport: false, ariaLabel: "Panel" },
    });
    await nextTick();
    const drawer = wrapper.get("[role='dialog']");

    expect(drawer.attributes("data-akaza-side")).toBe("left");
    expect(drawer.attributes("style")).toContain("--akaza-drawer-inset: 12px");
    await wrapper.get(".akaza-drawer-overlay").trigger("click");
    expect(wrapper.find("[role='dialog']").exists()).toBe(true);
    wrapper.unmount();
  });

  it("keeps Popover trigger ARIA synchronized and closes only itself on Escape", async () => {
    const wrapper = mount(defineComponent({
      components: { Dialog, Popover },
      setup() {
        const dialogOpen = ref(true);
        const popoverOpen = ref(true);
        return { dialogOpen, popoverOpen };
      },
      template: `
        <Dialog v-model="dialogOpen" aria-label="Dialog" :teleport="false">
          <template #body><button>Dialog action</button></template>
        </Dialog>
        <Popover v-model="popoverOpen" :teleport="false" :transition="false">
          <template #trigger="{ toggle, triggerProps }"><button class="popover-trigger" v-bind="triggerProps" @click="toggle">More</button></template>
          <template #content>Details</template>
        </Popover>
      `,
    }), { attachTo: document.body });
    await nextTick();
    const trigger = wrapper.get(".popover-trigger");

    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(trigger.attributes("aria-controls")).toBe(wrapper.get(".akaza-popover-content").attributes("id"));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await nextTick();
    expect((wrapper.vm as unknown as { popoverOpen: boolean }).popoverOpen).toBe(false);
    expect((wrapper.vm as unknown as { dialogOpen: boolean }).dialogOpen).toBe(true);
    wrapper.unmount();
  });

  it("opens Tooltip from keyboard focus and hides it on Escape without moving focus", async () => {
    vi.useFakeTimers();
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { delayDuration: 100, closeDelay: 0, arrow: true, teleport: false, transition: false },
      slots: {
        trigger: '<button class="tooltip-button" v-bind="triggerProps">Help</button>',
        content: "Helpful text",
      },
    });
    await nextTick();
    const trigger = wrapper.get<HTMLButtonElement>(".tooltip-button");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    trigger.element.focus();
    await vi.advanceTimersByTimeAsync(40);

    const tooltip = wrapper.get("[role='tooltip']");
    expect(trigger.attributes("aria-describedby")).toBe(tooltip.attributes("id"));
    expect(wrapper.get(".akaza-tooltip-trigger").attributes("aria-describedby")).toBe(tooltip.attributes("id"));
    expect(tooltip.find(".akaza-tooltip-arrow").exists()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(tooltip.attributes("hidden")).toBeDefined();
    expect(tooltip.attributes("data-akaza-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it("supports Menu focus, checkbox updates, selection, and closing", async () => {
    const onChecked = vi.fn();
    const onSelect = vi.fn();
    const wrapper = mount(defineComponent({
      components: { Menu },
      setup() {
        const open = ref(false);
        const items = [
          { type: "checkbox", value: "grid", label: "Grid", checked: false, onUpdateChecked: onChecked },
          { value: "disabled", label: "Disabled", disabled: true },
          { value: "save", label: "Save", onSelect },
        ];
        return { items, onChecked, onSelect, open };
      },
      template: `
        <Menu v-model="open" :items="items" :teleport="false">
          <template #trigger="{ toggle, triggerProps }"><button class="menu-trigger" v-bind="triggerProps" @click="toggle">Menu</button></template>
        </Menu>
      `,
    }), { attachTo: document.body });

    await wrapper.get(".menu-trigger").trigger("click");
    await nextTick();
    const items = wrapper.findAll(".akaza-menu-item");
    expect(document.activeElement).toBe(items[0]!.element);

    await items[0]!.trigger("click");
    expect(onChecked).toHaveBeenCalledWith(true);
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(true);

    await items[2]!.trigger("click");
    expect(onSelect).toHaveBeenCalledOnce();
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false);
    wrapper.unmount();
  });
});
