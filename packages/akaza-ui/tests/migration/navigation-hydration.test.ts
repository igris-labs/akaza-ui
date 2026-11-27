import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { Menubar } from "@/components/menubar";
import { NavigationMenu } from "@/components/navigation-menu";

it("hydrates menus and routed links with native Vue transitions and stable IDs", async () => {
  const Link = defineComponent({
    props: { to: String },
    setup(props, { attrs, slots }) {
      return () => h("a", { ...attrs, href: props.to }, slots.default?.());
    },
  });
  const View = defineComponent({
    render: () => h("div", [
      h(Menubar, { teleport: false, ariaLabel: "Commands", items: [{ value: "a", label: "Add" }, { value: "b", label: "Build" }] }),
      h(NavigationMenu, { ariaLabel: "Pages", modelValue: "docs", items: [{ value: "home", label: "Home", to: "/home" }, { value: "docs", label: "Docs", to: "/docs" }] }),
    ]),
  });
  const createApp = () => createSSRApp(View).component("RouterLink", Link);
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createApp());
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  const app = createApp();
  const warn = vi.fn();
  app.config.warnHandler = warn;
  try {
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(2);
    expect(root.querySelector("[data-slot]")).toBeNull();
    const links = root.querySelectorAll("a");
    links[0]!.focus();
    links[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(links[1]);
    expect(links[1]!.getAttribute("href")).toBe("/docs");
  } finally {
    app.unmount();
    root.remove();
  }
});
