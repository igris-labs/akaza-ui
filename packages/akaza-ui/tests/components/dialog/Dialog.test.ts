import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Dialog } from "@/components/dialog";
import { escape, outsidePress, popupEnvironment, popupFixture, settled } from "./popup-fixture";

popupEnvironment();
enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

describe.each([false, "body"] as const)("dialog SDK popup teleport=%s", (teleport) => {
  it("preserves native trigger events, naming, styles, and accepted Escape close", async () => {
    const view = await popupFixture(Dialog, { teleport, transition: false, fullscreen: true,
      ui: { content: "custom-content", overlay: "custom-overlay" } });
    view.trigger.element.focus();
    const click = new MouseEvent("click", { bubbles: true });
    view.trigger.element.dispatchEvent(click);
    await settled();
    const content = document.querySelector<HTMLElement>(".akaza-dialog-content")!;
    expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: "trigger", event: click }));
    expect(content.classList.contains("custom-content")).toBe(true);
    expect(document.querySelector(".custom-overlay")).not.toBeNull();
    expect(content.getAttribute("data-akaza-fullscreen")).toBe("true");
    expect(document.getElementById(content.getAttribute("aria-labelledby")!)?.textContent).toBe("Edit issue");
    expect(document.getElementById(content.getAttribute("aria-describedby")!)?.textContent).toBe("Issue details");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("aria-modal")).toBe("true");
    content.querySelector("input")!.focus();
    const event = await escape(content);
    expect(view.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "escape", event }));
    expect(document.querySelector(".akaza-dialog-content")).toBeNull();
    expect(document.activeElement).toBe(view.trigger.element);
  });

  it.each(["cancel", "refuse"])("keeps accepted state and focus after %s", async (policy) => {
    const view = await popupFixture(Dialog, { teleport, transition: false }, {
      initialOpen: true, cancel: policy === "cancel", accept: policy !== "refuse",
    });
    const content = document.querySelector<HTMLElement>(".akaza-dialog-content")!;
    const input = content.querySelector("input")!;
    input.focus();
    await escape(input);
    expect(view.onOpenChange).toHaveBeenCalledOnce();
    expect(view.popup.emitted("update:modelValue")).toEqual(policy === "cancel" ? undefined : [[false]]);
    expect(content.isConnected).toBe(true);
    expect(content.dataset.akazaState).toBe("open");
    expect(document.activeElement).toBe(input);
  });

  it.each([true, false])("respects closeOnBackdropClick=%s through SDK outside press", async (closeOnBackdropClick) => {
    const view = await popupFixture(Dialog, { teleport, transition: false, closeOnBackdropClick }, { initialOpen: true });
    const event = await outsidePress(document.querySelector(".akaza-dialog-overlay")!);
    if (closeOnBackdropClick) {
      expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "backdrop-click", event }));
      expect(document.querySelector(".akaza-dialog-content")).toBeNull();
    }
    else {
      expect(view.onOpenChange).not.toHaveBeenCalled();
      expect(document.querySelector(".akaza-dialog-content")).not.toBeNull();
    }
  });
});

it("clears settled transition classes and retains exposed action reasons", async () => {
  const view = await popupFixture(Dialog, { teleport: false, transition: "custom-modal", duration: 420 });
  view.trigger.element.focus();
  const api = view.popup.vm as unknown as { open: (reason?: string, event?: Event) => void; close: () => void };
  const event = new Event("open-editor");
  api.open("edit", event);
  await settled();
  const content = view.wrapper.get(".akaza-dialog-content");
  expect(content.classes().some(name => name.startsWith("custom-modal-enter-"))).toBe(false);
  expect(content.attributes("style")).toContain("--akaza-dialog-duration: 420ms");
  expect(view.onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "edit", event }));
  api.close();
  await settled();
  expect(view.onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "programmatic" }));
});

it("keeps author ARIA instead of SDK-generated title and description references", async () => {
  const wrapper = mount(Dialog, { attachTo: document.body,
    props: { modelValue: true, teleport: false, ariaLabel: "Preview", transition: false },
  });
  await settled();
  const panel = wrapper.get('[role="dialog"]');
  expect(panel.attributes("aria-label")).toBe("Preview");
  expect(panel.attributes("aria-labelledby")).toBeUndefined();
  expect(panel.attributes("aria-describedby")).toBeUndefined();
});
