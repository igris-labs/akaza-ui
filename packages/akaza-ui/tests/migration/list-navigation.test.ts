import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useListNavigation } from "@/composables/internal/sdk/useListNavigation";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()));

function setupNavigation() {
  const active = ref<string | null>("a");
  const loop = ref(true);
  const items = ref([
    { value: "a", label: "Alpha", disabled: false },
    { value: "skip", label: "Disabled", disabled: true },
    { value: "b", label: "Beta", disabled: false },
  ]);
  let navigation!: ReturnType<typeof useListNavigation>;
  const wrapper = mount(defineComponent({
    setup() {
      navigation = useListNavigation({ active: () => active.value, loop: () => loop.value, items: () => items.value });
      return () => h("div");
    },
  }));
  mounted.push(wrapper);
  return { navigation, active, loop, items };
}

describe("sdk list navigation proposals", () => {
  it("does not retain rejected proposals or affect another instance", () => {
    const first = setupNavigation();
    const second = setupNavigation();
    expect(first.navigation.move(1)).toBe("b");
    expect(first.navigation.move(1)).toBe("b");
    expect(first.active.value).toBe("a");
    first.active.value = "b";
    expect(first.navigation.move(1)).toBe("a");
    expect(second.navigation.move(1)).toBe("b");
    expect(first.navigation.move("first")).toBe("a");
    expect(first.navigation.move(-1)).toBe("a");
    expect(first.navigation.move("last")).toBe("b");
  });

  it("uses current order/disabled data and respects no-wrap boundaries", () => {
    const { navigation, active, loop, items } = setupNavigation();
    loop.value = false;
    expect(navigation.move(-1)).toBe("a");
    active.value = "b";
    expect(navigation.move(1)).toBe("b");
    items.value = [items.value[2]!, items.value[1]!, items.value[0]!];
    expect(navigation.move(1)).toBe("a");
    expect(navigation.move("first")).toBe("b");
    items.value = items.value.map(item => ({ ...item, disabled: true }));
    expect(navigation.move("first")).toBeNull();
    expect(navigation.move("last")).toBeNull();
    expect(navigation.move(1)).toBeNull();
    items.value = [];
    expect(navigation.move(1)).toBeNull();
  });

  it("enters from an absent highlight at the appropriate enabled edge", () => {
    const { navigation, active } = setupNavigation();
    active.value = null;
    expect(navigation.move(1)).toBe("a");
    expect(navigation.move(-1)).toBe("b");
    active.value = "removed";
    expect(navigation.move(1)).toBe("a");
  });

  it("navigates a large unmounted data set without taking DOM focus or scrolling", () => {
    const { navigation, active, items } = setupNavigation();
    items.value = Array.from({ length: 10000 }, (_, index) => ({ value: `row-${index}`, label: `Row ${index}`, disabled: false }));
    active.value = "row-5000";
    const outside = document.createElement("input");
    const viewport = document.createElement("div");
    document.body.append(outside, viewport);
    outside.focus();
    viewport.scrollTop = 120;
    try {
      for (let index = 0; index < 100; index++) active.value = navigation.move(1);
      expect(active.value).toBe("row-5100");
      expect(navigation.move("last")).toBe("row-9999");
      expect(navigation.move("first")).toBe("row-0");
      expect(document.activeElement).toBe(outside);
      expect(viewport.scrollTop).toBe(120);
    } finally {
      outside.remove();
      viewport.remove();
    }
  });
});
