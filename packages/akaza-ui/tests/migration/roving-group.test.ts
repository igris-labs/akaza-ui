import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { useRovingGroup } from "@/composables/internal/sdk/useRovingGroup";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});

function fixture(remember = true) {
  const items = ref([{ key: "a", disabled: false }, { key: "skip", disabled: true }, { key: "b", disabled: false }]);
  const preferred = ref("a");
  const orientation = ref<"horizontal" | "vertical">("horizontal");
  const loop = ref(true);
  const wrapper = mount(defineComponent({
    setup() {
      const roving = useRovingGroup({
        keys: () => items.value.map(item => item.key),
        disabled: key => items.value.find(item => item.key === key)?.disabled ?? true,
        preferred: () => preferred.value,
        orientation: () => orientation.value,
        loop: () => loop.value,
        remember,
      });
      return () => h("div", items.value.map(item => h("button", {
        key: item.key,
        ref: el => roving.bind(item.key, el as HTMLElement | null),
        tabindex: roving.tabIndex(item.key),
        disabled: item.disabled,
        onKeydown: (event: KeyboardEvent) => roving.keydown(event, event.currentTarget as HTMLElement),
      }, item.key)));
    },
  }), { attachTo: document.body });
  mounted.push(wrapper);
  return { wrapper, items, preferred, orientation, loop };
}

describe("vue sdk roving focus bridge", () => {
  it("starts with one stop, skips disabled items, and wraps", async () => {
    const { wrapper } = fixture();
    await nextTick();
    const buttons = wrapper.findAll("button");
    expect(buttons.map(button => button.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[2]!.element);
    expect(buttons[2]!.attributes("tabindex")).toBe("0");
    await buttons[2]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[0]!.element);
  });

  it("reconciles a controlled preferred item without moving focus", async () => {
    const { wrapper, preferred } = fixture(false);
    await nextTick();
    wrapper.findAll("button")[0]!.element.focus();
    preferred.value = "b";
    await nextTick();
    await nextTick();
    expect(wrapper.findAll("button").map(button => button.attributes("tabindex"))).toEqual(["-1", "-1", "0"]);
    expect(document.activeElement).toBe(wrapper.findAll("button")[0]!.element);
  });

  it("reads orientation, wrapping, disabled changes and reordered DOM without stale bindings", async () => {
    const { wrapper, items, orientation, loop } = fixture();
    orientation.value = "vertical";
    loop.value = false;
    items.value = [items.value[2]!, items.value[0]!];
    await nextTick();
    const buttons = wrapper.findAll("button");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttons[1]!.element);
    await buttons[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttons[1]!.element);
    items.value[1]!.disabled = true;
    await nextTick();
    await nextTick();
    expect(buttons[0]!.attributes("tabindex")).toBe("0");
    expect(buttons[1]!.attributes("tabindex")).toBe("-1");
    items.value = [];
    await nextTick();
    expect(wrapper.findAll("button")).toHaveLength(0);
  });

  it("leaves modified, composed, and canceled keys alone and isolates instances", async () => {
    const { wrapper } = fixture();
    const other = fixture().wrapper;
    const first = wrapper.findAll("button")[0]!;
    first.element.focus();
    for (const extra of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }]) {
      await first.trigger("keydown", { key: "ArrowRight", ...extra });
      expect(document.activeElement).toBe(first.element);
    }
    first.element.addEventListener("keydown", event => event.preventDefault(), { capture: true, once: true });
    await first.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(first.element);
    await first.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(wrapper.findAll("button")[2]!.element);
    expect(other.findAll("button")[0]!.attributes("tabindex")).toBe("0");
  });

  it("does not steal focus from another control while a DOM move settles", async () => {
    const { wrapper, items } = fixture();
    const outside = document.createElement("input");
    document.body.append(outside);
    wrapper.findAll("button")[2]!.element.focus();
    items.value = [...items.value].reverse();
    await nextTick();
    outside.focus();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(document.activeElement).toBe(outside);
  });

  it("disposes listeners and pending focus targets when unmounted", async () => {
    const { wrapper, items } = fixture();
    wrapper.findAll("button")[2]!.element.focus();
    items.value = [...items.value].reverse();
    await nextTick();
    wrapper.unmount();
    mounted.splice(mounted.indexOf(wrapper), 1);
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(document.activeElement).toBe(outside);
    const next = fixture().wrapper;
    expect(next.findAll('button[tabindex="0"]')).toHaveLength(1);
    expect(next.findAll('button[tabindex="0"]')[0]!.text()).toBe("a");
  });
});
