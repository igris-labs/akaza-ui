import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Toast } from ".";
import { createToastManager } from "../../composables/toast";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("toast", () => {
  it("keeps duplicates unless a stable id is reused", () => {
    const manager = createToastManager();
    manager.add({ title: "Saved", duration: 0 });
    manager.add({ title: "Saved", duration: 0 });
    manager.add({ id: "deploy", title: "Deploying", duration: 0 });
    manager.add({ id: "deploy", title: "Deployed", duration: 0 });

    expect(manager.toasts.value).toHaveLength(3);
    expect(manager.toasts.value.find((item) => item.id === "deploy")?.title).toBe("Deployed");
    expect(manager.toasts.value.find((item) => item.id === "deploy")?.updateKey).toBe(1);
  });

  it("pauses and resumes remaining timeout", () => {
    vi.useFakeTimers();
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "timed", title: "Timed", duration: 1000 });

    vi.advanceTimersByTime(400);
    manager.pause();
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);

    manager.resume();
    vi.advanceTimersByTime(599);
    expect(manager.toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value).toHaveLength(0);
  });

  it("limits older toasts and focuses viewport with the hotkey", async () => {
    const manager = createToastManager();
    for (let index = 0; index < 4; index++) {
      manager.add({ title: `Toast ${index}`, duration: 0 });
    }
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, limit: 2, teleport: false },
    });

    expect(wrapper.findAll(".akaza-toast[data-akaza-limited]")).toHaveLength(2);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F8", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find(".akaza-toast-viewport").element);

    wrapper.unmount();
  });

  it("closes from the default close button", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ title: "Saved", duration: 0 });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, teleport: false },
    });

    await wrapper.find(".akaza-toast-close").trigger("click");

    expect(manager.toasts.value).toHaveLength(0);
    wrapper.unmount();
  });

  it("provides a native-handler-safe close function to custom content", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ title: "Custom", type: "warning", duration: 0 });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, teleport: false },
      slots: {
        toast: ({ close, type }: { close: () => void; type: string }) =>
          h("button", { class: "custom-close", onClick: close, "data-type": type }, "Close"),
      },
    });

    expect(wrapper.find(".custom-close").attributes("data-type")).toBe("warning");
    await wrapper.find(".custom-close").trigger("click");

    expect(manager.toasts.value).toHaveLength(0);
    wrapper.unmount();
  });

  it("does not start swipe capture from interactive content", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ title: "Action", duration: 0 });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, teleport: false },
    });
    const toastElement = wrapper.find(".akaza-toast").element as HTMLElement;
    const capture = vi.fn();
    toastElement.setPointerCapture = capture;

    await wrapper.find(".akaza-toast-close").trigger("pointerdown", {
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(capture).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("stacks and expands from the configured viewport edge", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const manager = createToastManager();
    for (let index = 0; index < 3; index++) manager.add({ title: `Toast ${index}`, duration: 0 });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, position: "top-right", teleport: false },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const items = wrapper.findAll(".akaza-toast");
    expect(items[0]!.attributes("data-akaza-behind")).toBe("true");
    expect((items[0]!.element as HTMLElement).style.getPropertyValue("--akaza-toast-offset-y")).toBe("104px");

    await wrapper.find(".akaza-toast-viewport").trigger("mouseenter");
    expect(wrapper.find(".akaza-toast-viewport").attributes("data-akaza-expanded")).toBe("true");
    expect(wrapper.findAll(".akaza-toast[data-akaza-expanded]")).toHaveLength(3);
    wrapper.unmount();
  });

  it("retargets the current toast behind a newly added bottom toast", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const manager = createToastManager();
    manager.add({ id: "first", title: "First", duration: 0 });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, position: "bottom-right", teleport: false },
    });
    await wrapper.vm.$nextTick();

    manager.add({ id: "second", title: "Second", duration: 0 });
    await wrapper.vm.$nextTick();

    const items = wrapper.findAll(".akaza-toast");
    const firstStyle = (items[0]!.element as HTMLElement).style;
    expect(firstStyle.getPropertyValue("--akaza-toast-index")).toBe("1");
    expect(Number.parseFloat(firstStyle.getPropertyValue("--akaza-toast-stack-y"))).toBeCloseTo(-16);
    expect((items[1]!.element as HTMLElement).style.getPropertyValue("--akaza-toast-index")).toBe("0");
    wrapper.unmount();
  });

  it("keeps the loading toast id when promise phase options include another id", async () => {
    const manager = createToastManager();
    await manager.promise(Promise.resolve("done"), {
      loading: { id: "request", title: "Loading", duration: 0 },
      success: { id: "wrong", title: "Done", duration: 0 },
      error: { title: "Failed", duration: 0 },
    });

    expect(manager.toasts.value).toHaveLength(1);
    expect(manager.toasts.value[0]?.id).toBe("request");
    expect(manager.toasts.value[0]?.title).toBe("Done");
  });

  it("removes a toast even when its close callback throws", () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({
      id: "throwing",
      title: "Throwing",
      duration: 0,
      onClose: () => { throw new Error("close failed"); },
    });

    expect(() => manager.close("throwing")).toThrow("close failed");
    expect(manager.toasts.value).toHaveLength(0);
  });
});
