import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Drawer } from "@/components/drawer";
import { geometry, pointer, pointerFrames } from "../../migration/batch21b-pointer-fixture";
import { escape, outsidePress, popupEnvironment, popupFixture, settled } from "../dialog/popup-fixture";

popupEnvironment();
enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

describe.each([false, "body"] as const)("drawer SDK popup teleport=%s", (teleport) => {
  it("preserves inset, side, naming and ui hooks", async () => {
    const view = await popupFixture(Drawer, { teleport, side: "left", inset: "1rem", ui: { content: "custom-drawer" } }, { initialOpen: true });
    const content = document.querySelector<HTMLElement>(".akaza-drawer")!;
    expect(content.classList.contains("custom-drawer")).toBe(true);
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("aria-modal")).toBe("true");
    expect(content.dataset.akazaSide).toBe("left");
    expect(content.style.getPropertyValue("--akaza-drawer-inset")).toBe("1rem");
    expect(document.getElementById(content.getAttribute("aria-labelledby")!)?.textContent).toBe("Edit issue");
    expect(document.getElementById(content.getAttribute("aria-describedby")!)?.textContent).toBe("Issue details");
    expect(view.onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the nonmodal page interactive and ignores outside presses", async () => {
    const background = document.createElement("input");
    document.body.append(background);
    background.focus();
    const view = await popupFixture(Drawer, { teleport, modal: false }, { initialOpen: true });
    const content = document.querySelector<HTMLElement>(".akaza-drawer")!;
    expect(content.hasAttribute("aria-modal")).toBe(false);
    expect(document.querySelector(".akaza-drawer-overlay")).toBeNull();
    expect(background.closest("[inert], [aria-hidden='true']")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(background);
    await outsidePress(background);
    expect(view.onOpenChange).not.toHaveBeenCalled();
    content.querySelector("input")!.focus();
    background.focus();
    expect(document.activeElement).toBe(background);
    await escape(background);
    expect(view.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape" }));
    expect(document.activeElement).toBe(background);
  });

  it.each([true, false])("respects modal backdrop dismissal policy=%s", async (closeOnBackdropClick) => {
    const view = await popupFixture(Drawer, { teleport, closeOnBackdropClick }, { initialOpen: true });
    const event = await outsidePress(document.querySelector(".akaza-drawer-overlay")!);
    expect(view.onOpenChange).toHaveBeenCalledTimes(closeOnBackdropClick ? 1 : 0);
    if (closeOnBackdropClick) {
      expect(view.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "backdrop-click", event }));
      expect(document.querySelector(".akaza-drawer")).toBeNull();
    }
  });

  it.each(["cancel", "refuse"])("retains state and focus after %s", async (policy) => {
    const view = await popupFixture(Drawer, { teleport }, { initialOpen: true, cancel: policy === "cancel", accept: policy !== "refuse" });
    const content = document.querySelector<HTMLElement>(".akaza-drawer")!;
    const input = content.querySelector("input")!;
    input.focus();
    await escape(input);
    expect(view.onOpenChange).toHaveBeenCalledOnce();
    expect(view.popup.emitted("update:modelValue")).toEqual(policy === "cancel" ? undefined : [[false]]);
    expect(content.dataset.akazaState).toBe("open");
    expect(content.isConnected).toBe(true);
    expect(document.activeElement).toBe(input);
  });
});

it("reads nonmodal focus policy after modality changes before opening", async () => {
  const wrapper = mount(Drawer, { attachTo: document.body, props: { title: "Preview", teleport: false } });
  const background = document.createElement("input");
  background.setAttribute("aria-label", "Background input");
  document.body.append(background);
  background.focus();
  await wrapper.setProps({ modal: false });
  (wrapper.vm as unknown as { open: () => void }).open();
  await settled();
  expect(document.activeElement).toBe(background);
  expect(wrapper.get(".akaza-drawer").attributes("aria-modal")).toBeUndefined();
});

describe("drawer final swipe sampling", () => {
  let frame: () => Promise<void>;
  beforeEach(() => { frame = pointerFrames(); });

  it.each([
    ["left", -100, 0], ["right", 100, 0], ["top", 0, -100], ["bottom", 0, 100],
  ] as const)("closes %s from the final release coordinates", async (side, clientX, clientY) => {
    const wrapper = mount(Drawer, { attachTo: document.body,
      props: { title: "Preview", modal: false, modelValue: true, teleport: false, side },
    });
    await nextTick();
    const content = geometry(wrapper.get(".akaza-drawer").element);
    pointer(content, "pointerdown");
    const release = pointer(document, "pointerup", { clientX, clientY });
    await nextTick();
    await frame();
    await flushPromises();
    expect(wrapper.emitted("open-change")?.[0]).toEqual([false, expect.objectContaining({ reason: "swipe", event: release })]);
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    expect(content.hasAttribute("data-swiping")).toBe(false);
  });

  it.each([false, true])("snaps back when a controlled swipe is refused, cancel=%s", async (cancel) => {
    const wrapper = mount(Drawer, { attachTo: document.body,
      props: { title: "Preview", modal: false, modelValue: true, teleport: false,
        "onUpdate:modelValue": () => {}, onOpenChange: (_open, details) => { if (cancel) details.cancel(); } },
    });
    await nextTick();
    const content = geometry(wrapper.get(".akaza-drawer").element);
    pointer(content, "pointerdown");
    pointer(document, "pointermove", { clientX: 130 });
    await frame();
    pointer(document, "pointerup", { clientX: 140 });
    await nextTick();
    await nextTick();
    expect(wrapper.emitted("open-change")).toHaveLength(1);
    expect(content.hasAttribute("data-swiping")).toBe(false);
    expect(content.style.getPropertyValue("--drawer-swipe-movement-x")).toBe("");
    expect(content.dataset.akazaState).toBe("open");
  });
});
