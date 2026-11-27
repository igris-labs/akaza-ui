import { createApp, defineComponent, h, ref, Teleport } from "vue";
import { usePopup } from "../../src/composables/internal/sdk/usePopup";

export { batch13Dialog as customDialog } from "./batch13-popup-fixture";
export { bindPersistentLayer } from "@ui-sdk/core";
export { dialog } from "@ui-sdk/core/dialog";
export { mount } from "@ui-sdk/core/testing";

export function mountVuePopup({ refuse = false, modal = true, initialOpen = false, transition = false as string | false, focusLast = false, movable = false, restoreFocus = true } = {}) {
  const open = ref(initialOpen);
  const portaled = ref(false);
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(defineComponent({
    setup() {
      const trigger = ref<HTMLElement | null>(null);
      const content = ref<HTMLElement | null>(null);
      const popup = usePopup({
        kind: "dialog", open, content, contentId: "custom-proof-content", trigger: () => trigger.value, modal: () => modal,
        initialFocus: focusLast ? "#last" : "#first",
        ...(restoreFocus ? {} : { finalFocus: "none" as const }),
        transition: () => transition,
        request(next) { if (!refuse) open.value = next; },
      });
      return () => h("div", [
        h("button", {
          ...popup.triggerAttrs.value, ref: trigger, "data-proof": "trigger",
          onClick(event: MouseEvent) { popup.setOpen(!open.value, "trigger-press", event); },
        }, "Open proof"),
        h(Teleport, { to: "body", disabled: !movable || !portaled.value }, popup.present.value ? h("div", {
          ...popup.contentAttrs.value, ref: content, "data-proof": "content", "aria-label": "Proof",
        }, [h("button", { id: "first" }, "First"), h("button", { id: "last" }, "Last")]) : null),
      ]);
    },
  }));
  app.mount(host);
  return { open, move() { portaled.value = !portaled.value; }, unmount() { app.unmount(); host.remove(); } };
}

export function mountNestedVuePopup() {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(defineComponent({
    setup() {
      const open = ref(false);
      const innerOpen = ref(false);
      const trigger = ref<HTMLElement | null>(null);
      const content = ref<HTMLElement | null>(null);
      const innerTrigger = ref<HTMLElement | null>(null);
      const innerContent = ref<HTMLElement | null>(null);
      const outer = usePopup({
        kind: "dialog", open, content, trigger: () => trigger.value,
        request(next) { open.value = next; },
      });
      const inner = usePopup({
        kind: "popover", open: innerOpen, content: innerContent, trigger: () => innerTrigger.value,
        initialFocus: "#nested-input", request(next) { innerOpen.value = next; },
      });
      return () => h("div", [
        h("button", { ...outer.triggerAttrs.value, ref: trigger, "data-proof": "outer-trigger", onClick: (event: MouseEvent) => outer.setOpen(true, "trigger", event) }, "Open outer"),
        outer.present.value ? h("div", { ...outer.contentAttrs.value, ref: content, "data-proof": "outer", "aria-label": "Outer" }, [
          h("button", { ...inner.triggerAttrs.value, ref: innerTrigger, "data-proof": "inner-trigger", onClick: (event: MouseEvent) => inner.setOpen(true, "trigger", event) }, "Open inner"),
          h("button", "Last outer"),
        ]) : null,
        h(Teleport, { to: document.body }, inner.present.value ? h("div", { ...inner.contentAttrs.value, ref: innerContent, "data-proof": "inner" }, [
          h("input", { id: "nested-input", "aria-label": "Nested draft" }),
        ]) : null),
      ]);
    },
  }));
  app.mount(host);
  return () => { app.unmount(); host.remove(); };
}
