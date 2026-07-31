import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Avatar } from "@/components/avatar";

class MockImage {
  static instances: MockImage[] = [];

  src = "";
  private listeners = new Map<string, Set<EventListener>>();

  constructor() {
    MockImage.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string) {
    this.listeners.get(type)?.forEach((listener) => listener(new Event(type)));
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  MockImage.instances = [];
});

describe("avatar", () => {
  it("delays fallback, emits status, and reloads when src changes", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Image", MockImage);
    const wrapper = mount(Avatar, {
      props: { src: "/one.png", alt: "Rahul", text: "RV", delayMs: 100 },
    });

    expect(wrapper.attributes("data-akaza-status")).toBe("loading");
    expect(wrapper.find(".akaza-avatar-fallback").exists()).toBe(false);
    vi.advanceTimersByTime(100);
    await nextTick();
    expect(wrapper.get(".akaza-avatar-fallback").text()).toBe("RV");

    MockImage.instances[0]!.dispatch("load");
    await nextTick();
    expect(wrapper.attributes("data-akaza-status")).toBe("loaded");
    expect(wrapper.get("img").attributes("alt")).toBe("Rahul");

    await wrapper.setProps({ src: "/two.png" });
    expect(MockImage.instances).toHaveLength(2);
    MockImage.instances[1]!.dispatch("error");
    await nextTick();
    expect(wrapper.attributes("data-akaza-status")).toBe("error");
    expect(wrapper.emitted("status-change")?.map(([status]) => status)).toEqual(["loading", "loaded", "loading", "error"]);
  });

  it("renders accessible fallback text when no source exists", () => {
    const wrapper = mount(Avatar, { props: { text: "Ada Lovelace" } });

    expect(wrapper.attributes("data-akaza-status")).toBe("error");
    expect(wrapper.get(".akaza-avatar-fallback").text()).toBe("Ada Lovelace");
    expect(wrapper.get(".akaza-avatar-fallback").attributes("aria-hidden")).toBeUndefined();
  });
});
