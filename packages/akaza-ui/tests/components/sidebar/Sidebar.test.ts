import type { SidebarSizeChangeEventDetails } from "@/components/sidebar";
import type { SidebarController } from "@/composables/sidebar";
import type { AkazaChangeEventDetails } from "@/types";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/composables/sidebar";

describe("sidebar", () => {
  it("supports controlled desktop collapse and native-event-safe slot actions", async () => {
    const wrapper = mount(defineComponent({
      components: { Sidebar },
      setup() {
        const collapsed = ref(false);
        return { collapsed };
      },
      template: `
        <Sidebar v-model:collapsed="collapsed" collapsible="icon" aria-label="Workspace">
          <template #header="{ collapsed, toggleCollapsed }">
            <button class="collapse-trigger" @click="toggleCollapsed">{{ collapsed ? "Expand" : "Collapse" }}</button>
            <span class="header">{{ collapsed }}</span>
          </template>
          <span class="content">Navigation</span>
          <template #footer><span class="footer">Account</span></template>
        </Sidebar>
      `,
    }));

    const root = wrapper.get(".akaza-sidebar-root");
    const toggle = wrapper.get(".collapse-trigger");
    expect(root.attributes("data-akaza-state")).toBe("expanded");
    expect(wrapper.get("aside").attributes("aria-label")).toBe("Workspace");
    expect(toggle.text()).toBe("Collapse");

    await toggle.trigger("click");
    expect(root.attributes("data-akaza-state")).toBe("collapsed");
    expect(root.attributes("data-akaza-collapsed")).toBe("true");
    expect(toggle.text()).toBe("Expand");
    expect(wrapper.get(".header").text()).toBe("true");
  });

  it("supports cancelable collapse changes and hides off-canvas content from interaction", async () => {
    const onCollapsedChange = vi.fn((_value: boolean, details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = mount(Sidebar, {
      props: {
        collapsible: "offcanvas",
        onCollapsedChange,
      },
      slots: { header: `<button class="collapse-trigger">Toggle</button>`, default: "Navigation" },
    });

    const change = wrapper.vm as unknown as { collapse: () => void };
    change.collapse();
    await nextTick();
    expect(onCollapsedChange).toHaveBeenCalledOnce();
    expect(wrapper.get(".akaza-sidebar-root").attributes("data-akaza-state")).toBe("expanded");

    const collapsed = mount(Sidebar, {
      props: { collapsible: "offcanvas", defaultCollapsed: true },
      slots: { default: "Navigation" },
    });
    expect(collapsed.get(".akaza-sidebar-panel").attributes("aria-hidden")).toBe("true");
    expect(collapsed.get(".akaza-sidebar-panel").attributes()).toHaveProperty("inert");
  });

  it("renders mobile content as a modal drawer and closes on navigation", async () => {
    const wrapper = mount(defineComponent({
      components: { Sidebar },
      setup() {
        const open = ref(false);
        return { open };
      },
      template: `
        <div>
          <button class="mobile-trigger" :aria-expanded="open" @click="open = true">Menu</button>
          <Sidebar v-model:open="open" mobile :teleport="false" aria-label="Mobile navigation">
            <template #header><span>Workspace</span></template>
            <a href="#projects">Projects</a>
            <template #footer><button type="button">Account</button></template>
          </Sidebar>
        </div>
      `,
    }), { attachTo: document.body });

    await wrapper.get(".mobile-trigger").trigger("click");
    await nextTick();
    expect(wrapper.get("[role='dialog']").attributes("aria-label")).toBe("Mobile navigation");
    expect(wrapper.get(".akaza-sidebar-panel").attributes("data-akaza-mobile")).toBe("");
    expect(wrapper.get(".mobile-trigger").attributes("aria-expanded")).toBe("true");

    await wrapper.get("a").trigger("click");
    await nextTick();
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
    expect(wrapper.get(".mobile-trigger").attributes("aria-expanded")).toBe("false");
    wrapper.unmount();
  });

  it("resizes from keyboard on either side and resets on double click", async () => {
    const changes: Array<{ size: number; details: SidebarSizeChangeEventDetails }> = [];
    const wrapper = mount(Sidebar, {
      props: {
        resizable: true,
        defaultSize: 240,
        minSize: 200,
        maxSize: 300,
        resizeStep: 10,
        onSizeChange: (size, details) => changes.push({ size, details }),
      },
      slots: { default: "Navigation" },
    });
    const handle = wrapper.get("[role='separator']");

    expect(handle.attributes("aria-valuenow")).toBe("240");
    await handle.trigger("keydown", { key: "ArrowRight" });
    expect(handle.attributes("aria-valuenow")).toBe("250");
    expect(changes.at(-1)?.details.reason).toBe("keyboard");

    await handle.trigger("keydown", { key: "End" });
    expect(handle.attributes("aria-valuenow")).toBe("300");
    await handle.trigger("dblclick");
    expect(handle.attributes("aria-valuenow")).toBe("240");

    await wrapper.setProps({ side: "right" });
    await handle.trigger("keydown", { key: "ArrowLeft" });
    expect(handle.attributes("aria-valuenow")).toBe("250");
  });

  it("provides standalone responsive behavior through useSidebar", () => {
    const mobile = ref(true);
    const sidebar = useSidebar({ mobile });
    expect(sidebar.state.value).toBe("closed");
    sidebar.toggle();
    expect(sidebar.state.value).toBe("open");

    mobile.value = false;
    sidebar.toggle();
    expect(sidebar.state.value).toBe("collapsed");
    sidebar.expand();
    expect(sidebar.state.value).toBe("expanded");
  });

  it("controls the sidebar instance passed to useSidebar", async () => {
    const wrapper = mount(defineComponent({
      components: { Sidebar },
      setup() {
        const firstRef = ref<SidebarController | null>(null);
        const secondRef = ref<SidebarController | null>(null);
        const first = useSidebar(firstRef);
        const second = useSidebar(secondRef);
        return {
          firstRef,
          secondRef,
          firstSize: first.size,
          resetFirst: first.resetSize,
          toggleFirst: first.toggle,
          toggleSecond: second.toggle,
        };
      },
      template: `
        <div>
          <button class="toggle-first" @click="toggleFirst">Toggle first</button>
          <button class="toggle-second" @click="toggleSecond">Toggle second</button>
          <button class="reset-first" @click="resetFirst">Reset first</button>
          <span class="first-size">{{ firstSize }}</span>
          <Sidebar ref="firstRef" collapsible="icon" resizable :default-size="240">First</Sidebar>
          <Sidebar ref="secondRef" collapsible="icon">Second</Sidebar>
        </div>
      `,
    }));

    const sidebars = wrapper.findAll(".akaza-sidebar-root");
    await nextTick();
    expect(wrapper.get(".first-size").text()).toBe("240");
    await wrapper.get("[role='separator']").trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.get(".first-size").text()).toBe("248");
    await wrapper.get(".reset-first").trigger("click");
    expect(wrapper.get(".first-size").text()).toBe("240");

    await wrapper.get(".toggle-first").trigger("click");
    expect(sidebars[0]?.attributes("data-akaza-state")).toBe("collapsed");
    expect(sidebars[1]?.attributes("data-akaza-state")).toBe("expanded");

    await wrapper.get(".toggle-second").trigger("click");
    expect(sidebars[0]?.attributes("data-akaza-state")).toBe("collapsed");
    expect(sidebars[1]?.attributes("data-akaza-state")).toBe("collapsed");
  });
});
