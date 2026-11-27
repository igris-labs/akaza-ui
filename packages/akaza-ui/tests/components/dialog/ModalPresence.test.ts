import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlertDialog } from "@/components/alert-dialog";
import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";
import { popupEnvironment, popupFixture, settled } from "./popup-fixture";

popupEnvironment();
enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe.each([
  ["Dialog", Dialog, "akaza-dialog-content", "akaza-dialog-overlay", "custom-exit"],
  ["AlertDialog", AlertDialog, "akaza-alert-dialog-content", "akaza-alert-dialog-overlay", "custom-exit"],
  ["Drawer", Drawer, "akaza-drawer", "akaza-drawer-overlay", "akaza-drawer"],
] as const)("%s SDK exit presence", (_name, component, contentClass, overlayClass, transition) => {
  it.each(["cancel", "refuse"])("keeps closed state and page focus after an opening %s", async (policy) => {
    const view = await popupFixture(component, { teleport: false }, {
      cancel: policy === "cancel", accept: policy !== "refuse",
    });
    view.trigger.element.focus();
    await view.trigger.trigger("click");
    await settled();
    expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: "trigger" }));
    expect(document.querySelector(`.${contentClass}`)).toBeNull();
    expect(document.querySelector(`.${overlayClass}`)).toBeNull();
    expect(view.trigger.element.inert).not.toBe(true);
    expect(document.activeElement).toBe(view.trigger.element);
    expect(document.documentElement.style.overflow).not.toBe("hidden");
    expect(view.popup.emitted("update:modelValue")).toEqual(policy === "cancel" ? undefined : [[true]]);
  });

  it("keeps the content and bound backdrop until SDK-observed animation finishes", async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => { finish = resolve; });
    const animation = { finished } as Animation;
    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(element => getComputedStyle(element));
    vi.spyOn(HTMLElement.prototype, "getAnimations").mockImplementation(function (this: HTMLElement) {
      return this.hasAttribute("data-ending-style") ? [animation] : [];
    });
    const view = await popupFixture(component, { teleport: false, ...(component === Drawer ? {} : { transition }) }, { initialOpen: true });
    const content = document.querySelector<HTMLElement>(`.${contentClass}`)!;
    const overlay = document.querySelector<HTMLElement>(`.${overlayClass}`)!;
    try {
      content.querySelector<HTMLElement>(".confirm")!.click();
      await settled();
      expect(view.onOpenChange).toHaveBeenCalledOnce();
      expect(content.isConnected).toBe(true);
      expect(overlay.isConnected).toBe(true);
      expect(content.dataset.akazaState).toBe("closed");
      expect(overlay.dataset.akazaState).toBe("closed");
      expect(content.hasAttribute("data-ending-style")).toBe(true);
      expect(content.classList.contains(`${transition}-leave-active`)).toBe(true);
      expect(content.classList.contains(`${transition}-leave-to`)).toBe(true);
    }
    finally {
      finish();
      await settled();
    }
    expect(content.isConnected).toBe(false);
    expect(overlay.isConnected).toBe(false);
  });
});
