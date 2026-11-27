import type { MenuItem } from "@/components/menu";
import type { AkazaChangeEventDetails } from "@/types";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { ContextMenu } from "@/components/context-menu";
import { Menu } from "@/components/menu";
import { Menubar } from "@/components/menubar";
import MenuSection from "../../../../../playground/src/sections/menu/MenuSection.vue";
import { installPopupTestEnvironment, settlePopup } from "../popover/popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();

const kinds = ["Menu", "ContextMenu", "Menubar"] as const;
type Kind = typeof kinds[number];
const branch: MenuItem[] = [{ value: "share", label: "Share", children: [
  { value: "export", label: "Export", children: [{ value: "copy", label: "Copy" }] },
  { value: "email", label: "Email" },
] }];

async function fixture(kind: Kind, teleport: false | "body", options: {
  accept?: boolean;
  cancel?: boolean;
  items?: MenuItem[];
} = {}) {
  const change = vi.fn((_next: unknown, details: AkazaChangeEventDetails) => {
    if (options.cancel) details.cancel();
  });
  const wrapper = mount(defineComponent({
    components: { Menu, ContextMenu, Menubar },
    setup() {
      const open = ref<boolean | string | null>(kind === "Menubar" ? "file" : true);
      const version = ref(0);
      const items = options.items ?? branch;
      return {
        kind, open, version, items, teleport, change,
        update: (value: boolean | string | null) => { if (options.accept !== false) open.value = value; },
      };
    },
    template: `
      <Menu v-if="kind === 'Menu'" :model-value="open" @update:model-value="update"
        :items="items" :teleport="teleport" @open-change="change">
        <template #trigger="{ toggle, triggerProps }">
          <button :key="version" v-bind="triggerProps" id="menu-launcher" class="launcher" @click="toggle">Actions</button>
        </template>
      </Menu>
      <ContextMenu v-else-if="kind === 'ContextMenu'" :model-value="open" @update:model-value="update"
        :items="items" :teleport="teleport" @open-change="change">
        <button class="launcher">Surface</button>
      </ContextMenu>
      <Menubar v-else :model-value="open" @update:model-value="update"
        :items="[{ value: 'file', label: 'File', children: items }]" :teleport="teleport" @open-change="change" />
      <button class="outside">Outside</button>
    `,
  }), { attachTo: document.body });
  await settlePopup();
  const content = document.querySelector<HTMLElement>(
    kind === "Menu" ? ".akaza-menu-root > .akaza-menu-content, body > .akaza-menu-content"
      : kind === "ContextMenu" ? ".akaza-context-menu-content" : ".akaza-menubar-content",
  )!;
  return { wrapper, content, change };
}

async function escape(target: HTMLElement) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await settlePopup();
  return event;
}

describe.each(kinds)("%s SDK popup", (kind) => {
  describe.each([false, "body"] as const)("teleport=%s", (teleport) => {
    it.each(["cancel", "refuse"] as const)("keeps focus and accepted open state on %s", async (policy) => {
      const view = await fixture(kind, teleport, { cancel: policy === "cancel", accept: policy !== "refuse" });
      const item = view.content.querySelector<HTMLElement>('[role="menuitem"]')!;
      item.focus();
      const event = await escape(item);
      expect(view.change).toHaveBeenCalledExactlyOnceWith(kind === "Menubar" ? null : false,
        expect.objectContaining({ reason: "escape", event }));
      expect(view.content.isConnected).toBe(true);
      expect(view.content.dataset.akazaState).toBe("open");
      expect(document.activeElement).toBe(item);
      if (kind !== "ContextMenu") {
        const trigger = view.wrapper.get('[aria-haspopup="menu"]');
        expect(trigger.attributes("aria-expanded")).toBe("true");
        expect(trigger.attributes("aria-controls")).toBe(view.content.id);
      }
    });

    it("closes exactly one nested level per Escape", async () => {
      const view = await fixture(kind, teleport);
      const firstTrigger = view.content.querySelector<HTMLElement>(".akaza-menu-submenu-trigger")!;
      firstTrigger.click();
      await settlePopup();
      const first = view.content.querySelector<HTMLElement>(".akaza-menu-submenu-content")!;
      const secondTrigger = first.querySelector<HTMLElement>(".akaza-menu-submenu-trigger")!;
      secondTrigger.click();
      await settlePopup();
      const second = first.querySelector<HTMLElement>(".akaza-menu-submenu-content")!;
      const leaf = second.querySelector<HTMLElement>('[role="menuitem"]')!;
      leaf.focus();
      expect(view.content.querySelectorAll('[role="menu"]')).toHaveLength(3);
      const order = (element: HTMLElement) => Number(element.style.getPropertyValue("--akaza-layer-order"));
      expect(order(first)).toBeGreaterThan(order(view.content));
      expect(order(second)).toBeGreaterThan(order(first));
      await escape(leaf);
      expect(second.isConnected).toBe(false);
      expect(first.isConnected).toBe(true);
      expect(document.activeElement).toBe(secondTrigger);
      expect(view.change).not.toHaveBeenCalled();
      await escape(secondTrigger);
      expect(first.isConnected).toBe(false);
      expect(view.content.isConnected).toBe(true);
      expect(document.activeElement).toBe(firstTrigger);
      await escape(firstTrigger);
      expect(view.content.isConnected).toBe(false);
      expect(view.change).toHaveBeenCalledOnce();
    });

    it("removes descendant popups when the accepted parent closes", async () => {
      const view = await fixture(kind, teleport);
      view.content.querySelector<HTMLElement>(".akaza-menu-submenu-trigger")!.click();
      await settlePopup();
      const submenu = view.content.querySelector<HTMLElement>(".akaza-menu-submenu-content")!;
      expect(submenu).not.toBeNull();
      view.wrapper.vm.open = kind === "Menubar" ? null : false;
      await settlePopup();
      expect(view.content.isConnected).toBe(false);
      expect(submenu.isConnected).toBe(false);
      view.wrapper.vm.open = kind === "Menubar" ? "file" : true;
      await settlePopup();
      expect(document.querySelector(".akaza-menu-submenu-content")).toBeNull();
    });

    it("does not take focus back from a selected command's destination", async () => {
      const view = await fixture(kind, teleport, { items: [{ label: "Move focus", onSelect() {
        document.querySelector<HTMLButtonElement>(".outside")!.focus();
      } }] });
      const item = view.content.querySelector<HTMLElement>('[role="menuitem"]')!;
      item.focus();
      item.click();
      await settlePopup();
      expect(view.content.isConnected).toBe(false);
      expect(document.activeElement).toBe(view.wrapper.get(".outside").element);
      expect(view.change).toHaveBeenCalledExactlyOnceWith(kind === "Menubar" ? null : false,
        expect.objectContaining({ reason: "select" }));
    });

    it("routes outside presses through the cancelable Akaza request", async () => {
      const view = await fixture(kind, teleport, { cancel: true });
      const event = new MouseEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 });
      view.wrapper.get(".outside").element.dispatchEvent(event);
      await settlePopup();
      expect(view.change).toHaveBeenCalledExactlyOnceWith(kind === "Menubar" ? null : false,
        expect.objectContaining({ reason: "outside-click", event }));
      expect(view.content.dataset.akazaState).toBe("open");
    });

    it("lets SDK restore the actual trigger after accepted Escape", async () => {
      const view = await fixture(kind, teleport);
      const trigger = view.wrapper.get(kind === "Menubar" ? ".akaza-menubar-trigger" : ".launcher");
      if (kind === "ContextMenu") {
        await trigger.trigger("contextmenu", { clientX: 20, clientY: 20 });
        await settlePopup();
      }
      const item = view.content.querySelector<HTMLElement>('[role="menuitem"]')!;
      item.focus();
      await escape(item);
      expect(view.content.isConnected).toBe(false);
      expect(document.activeElement).toBe(trigger.element);
    });

    it("keeps outside focus after SDK accepts outside dismissal", async () => {
      const view = await fixture(kind, teleport);
      const item = view.content.querySelector<HTMLElement>('[role="menuitem"]')!;
      item.focus();
      const outside = view.wrapper.get<HTMLButtonElement>(".outside");
      outside.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 }));
      outside.element.focus();
      await settlePopup();
      expect(view.content.isConnected).toBe(false);
      expect(document.activeElement).toBe(outside.element);
    });
  });

  it("renders initially open markup during SSR without native bindings", async () => {
    const component = kind === "Menu" ? Menu : kind === "ContextMenu" ? ContextMenu : Menubar;
    const html = await renderToString(createSSRApp(component, {
      modelValue: kind === "Menubar" ? "file" : true,
      items: kind === "Menubar" ? [{ value: "file", label: "File", children: branch }] : branch,
      teleport: false,
    }));
    expect(html).toContain('data-slot="akaza-menu-popup-content"');
    expect(html.match(/role="menu"/g)).toHaveLength(1);
    expect(html).not.toContain("akaza-menu-submenu-content");
  });
});

it("restores to the current Menu trigger after its slot element is replaced", async () => {
  const view = await fixture("Menu", false);
  const previous = view.wrapper.get(".launcher").element;
  view.wrapper.vm.version++;
  await settlePopup();
  const trigger = view.wrapper.get(".launcher");
  expect(trigger.element).not.toBe(previous);
  expect(trigger.attributes("id")).toBe("menu-launcher");
  const item = view.content.querySelector<HTMLElement>('[role="menuitem"]')!;
  item.focus();
  await escape(item);
  expect(document.activeElement).toBe(trigger.element);
});

it("keeps the panel's own roving group and typeahead separate from child panels", async () => {
  const view = await fixture("Menu", false);
  view.content.querySelector<HTMLElement>(".akaza-menu-submenu-trigger")!.click();
  await settlePopup();
  const child = view.content.querySelector<HTMLElement>(".akaza-menu-submenu-content")!;
  const items = child.querySelectorAll<HTMLElement>('[role="menuitem"]');
  items[0]!.focus();
  items[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true, cancelable: true }));
  await flushPromises();
  expect(document.activeElement).toBe(items[1]);
  expect(view.content.querySelectorAll('[tabindex="0"]')).toHaveLength(2);
});

it("keeps the existing grouped playground menu open when its trigger-slot reorder control is pressed", async () => {
  const wrapper = mount(MenuSection, { attachTo: document.body });
  const launcher = wrapper.findAll("button").find(button => button.text() === "Grouped focus commands")!;
  const reorder = wrapper.findAll("button").find(button => button.text() === "Reverse command order")!;
  await launcher.trigger("click");
  await settlePopup();
  const content = document.getElementById(launcher.attributes("aria-controls"))!;
  expect(content.querySelector('[role="menuitem"]')?.textContent).toBe("First command");
  reorder.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 }));
  (reorder.element as HTMLElement).focus();
  await reorder.trigger("click");
  await settlePopup();
  expect(launcher.attributes("aria-expanded")).toBe("true");
  expect(content.isConnected).toBe(true);
  expect(content.querySelector('[role="menuitem"]')?.textContent).toBe("Last command");
  expect(document.activeElement).toBe(reorder.element);
});

it.each([true, false])("honors ContextMenu restoreFocus=%s through SDK finalFocus", async (restoreFocus) => {
  const wrapper = mount(ContextMenu, {
    attachTo: document.body,
    props: { items: [{ label: "Copy" }], teleport: false, restoreFocus },
    slots: { default: '<button class="surface">Surface</button>' },
  });
  const surface = wrapper.get<HTMLButtonElement>(".surface");
  await surface.trigger("contextmenu", { clientX: 20, clientY: 20 });
  await settlePopup();
  const focus = vi.spyOn(surface.element, "focus");
  const item = wrapper.get<HTMLElement>('[role="menuitem"]');
  item.element.focus();
  await escape(item.element);
  expect(wrapper.find(".akaza-context-menu-content").exists()).toBe(false);
  if (restoreFocus) {
    expect(document.activeElement).toBe(surface.element);
    expect(focus).toHaveBeenCalledOnce();
  } else {
    expect(focus).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(surface.element);
  }
});

it.each([true, false])("tracks restoreFocus changes to %s while a ContextMenu is open", async (restoreFocus) => {
  const wrapper = mount(ContextMenu, {
    attachTo: document.body,
    props: { items: [{ label: "Copy" }], teleport: false, restoreFocus: !restoreFocus },
    slots: { default: '<button class="surface">Surface</button>' },
  });
  const surface = wrapper.get<HTMLButtonElement>(".surface");
  await surface.trigger("contextmenu", { clientX: 20, clientY: 20 });
  await settlePopup();
  await wrapper.setProps({ restoreFocus });
  const focus = vi.spyOn(surface.element, "focus");
  const item = wrapper.get<HTMLElement>('[role="menuitem"]');
  item.element.focus();
  await escape(item.element);
  expect(focus).toHaveBeenCalledTimes(restoreFocus ? 1 : 0);
});
