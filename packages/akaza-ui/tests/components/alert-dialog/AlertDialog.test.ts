import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { AlertDialog } from "@/components/alert-dialog";
import { escape, outsidePress, popupEnvironment, popupFixture, settled } from "../dialog/popup-fixture";

popupEnvironment();
enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

describe.each([false, "body"] as const)("alertDialog SDK popup teleport=%s", (teleport) => {
  it("prefers cancel focus and refuses native Escape and backdrop dismissal", async () => {
    const view = await popupFixture(AlertDialog, { teleport, transition: false });
    view.trigger.element.focus();
    await view.trigger.trigger("click");
    await settled();
    const content = document.querySelector<HTMLElement>(".akaza-alert-dialog-content")!;
    expect(content.getAttribute("role")).toBe("alertdialog");
    expect(content.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(content.querySelector("[data-akaza-cancel]"));
    expect(document.getElementById(content.getAttribute("aria-labelledby")!)?.textContent).toBe("Edit issue");
    expect(document.getElementById(content.getAttribute("aria-describedby")!)?.textContent).toBe("Issue details");
    view.onOpenChange.mockClear();
    await escape(content);
    await outsidePress(document.querySelector(".akaza-alert-dialog-overlay")!);
    expect(view.onOpenChange).not.toHaveBeenCalled();
    expect(content.dataset.akazaState).toBe("open");
    expect(content.isConnected).toBe(true);
    const confirm = content.querySelector<HTMLElement>(".confirm")!;
    confirm.focus();
    confirm.click();
    await settled();
    expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "confirm" }));
    expect(document.querySelector(".akaza-alert-dialog-content")).toBeNull();
    expect(document.activeElement).toBe(view.trigger.element);
  });

  it.each(["cancel", "refuse"])("does not optimistically close after %s", async (policy) => {
    const view = await popupFixture(AlertDialog, { teleport, transition: false }, {
      initialOpen: true, cancel: policy === "cancel", accept: policy !== "refuse",
    });
    const content = document.querySelector<HTMLElement>(".akaza-alert-dialog-content")!;
    const button = content.querySelector<HTMLElement>("[data-akaza-cancel]")!;
    button.focus();
    button.click();
    await settled();
    expect(view.onOpenChange).toHaveBeenCalledOnce();
    expect(view.popup.emitted("update:modelValue")).toEqual(policy === "cancel" ? undefined : [[false]]);
    expect(content.isConnected).toBe(true);
    expect(document.activeElement).toBe(button);
  });
});

it("keeps fallback naming, duration, and ui hooks after transition classes clear", async () => {
  const wrapper = mount(AlertDialog, { attachTo: document.body,
    props: { modelValue: true, teleport: false, ariaLabel: "Delete issue", transition: "confirm-delete", duration: 600,
      ui: { content: "custom-content", overlay: "custom-overlay" } },
  });
  await settled();
  const content = wrapper.get('[role="alertdialog"]');
  expect(content.attributes("aria-label")).toBe("Delete issue");
  expect(content.attributes("aria-labelledby")).toBeUndefined();
  expect(content.attributes("aria-describedby")).toBeUndefined();
  expect(content.classes().some(name => name.startsWith("confirm-delete-enter-"))).toBe(false);
  expect(content.classes()).toContain("custom-content");
  expect(content.element.contains(document.activeElement)).toBe(true);
  expect(content.attributes("style")).toContain("--akaza-dialog-duration: 600ms");
  expect(wrapper.find(".custom-overlay").exists()).toBe(true);
});
