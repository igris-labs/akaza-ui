import { mount } from "@vue/test-utils";
import { useRovingFocus } from "akaza-ui";
import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";

describe("useRovingFocus", () => {
  it("renders one server-side tab stop and skips disabled items", async () => {
    const App = defineComponent({
      setup() {
        const items = [{ key: "remove", disabled: true }, { key: "undo" }, { key: "redo" }];
        const { itemProps } = useRovingFocus({ items });
        return () => h("div", items.map(item => h("button", {
          ...itemProps(item.key), disabled: item.disabled,
        }, item.key)));
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain('<button tabindex="-1" disabled>remove</button>');
    expect(html).toContain('<button tabindex="0">undo</button>');
    expect(html).toContain('<button tabindex="-1">redo</button>');
  });

  it("reconciles the tab stop when reactive items change", async () => {
    const items = ref([{ key: "undo", disabled: false }, { key: "redo", disabled: false }]);
    const App = defineComponent({
      setup() {
        const { itemProps, tabStop } = useRovingFocus({ items });
        return () => h("div", { "data-tab-stop": tabStop.value }, items.value.map(item => h("button", {
          ...itemProps(item.key), key: item.key, disabled: item.disabled,
        }, item.key)));
      },
    });
    const wrapper = mount(App);
    try {
      expect(wrapper.attributes("data-tab-stop")).toBe("undo");
      items.value[0]!.disabled = true;
      await nextTick();
      expect(wrapper.attributes("data-tab-stop")).toBe("redo");
      items.value.pop();
      await nextTick();
      expect(wrapper.attributes("data-tab-stop")).toBeUndefined();
      expect(wrapper.get("button").attributes("tabindex")).toBe("-1");
    } finally {
      wrapper.unmount();
    }
  });
});
