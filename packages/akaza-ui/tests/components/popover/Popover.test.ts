import type { AkazaChangeEventDetails } from "@/types";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Popover } from "@/components/popover";
import { installPopupTestEnvironment, pointer, settlePopup } from "./popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("popover SDK ownership", () => {
  it("toggles once per native click and preserves custom action reasons and events", async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: { teleport: false, transition: false },
      slots: {
        trigger: '<button class="trigger" v-bind="triggerProps" @click="toggle">Options</button>',
        content: '<button class="close" @click="close(\'apply\', $event)">Apply</button>',
      },
    });
    await settlePopup();
    await wrapper.get(".trigger").trigger("click");
    await settlePopup();
    expect(wrapper.emitted("open-change")).toEqual([[true, expect.objectContaining({ reason: "trigger", event: expect.any(MouseEvent) })]]);
    await wrapper.get(".close").trigger("click");
    await settlePopup();
    expect(wrapper.emitted("open-change")![1]).toEqual([false, expect.objectContaining({ reason: "apply", event: expect.any(MouseEvent) })]);
    expect(wrapper.emitted("open-change")).toHaveLength(2);
    expect(wrapper.find(".akaza-popover-content").exists()).toBe(false);
  });

  it("keeps native trigger attributes without installing a second click action", async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: { transition: false },
      slots: {
        trigger: '<button type="submit" class="trigger" v-bind="triggerProps" @click.prevent>Submit</button>',
        content: "Preview",
      },
    });
    await settlePopup();
    await wrapper.get(".trigger").trigger("click");
    await settlePopup();
    expect(wrapper.get(".trigger").attributes("type")).toBe("submit");
    expect(wrapper.emitted("open-change")).toBeUndefined();
    expect(wrapper.find(".akaza-popover-content").exists()).toBe(false);
  });

  it("supports exposed programmatic actions and refuses controlled opening", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: { modelValue: false, "onUpdate:modelValue": vi.fn(), transition: false, onOpenChange },
      slots: { trigger: '<button class="trigger">Options</button>', content: "Preview" },
    });
    await settlePopup();
    wrapper.vm.open("external");
    await settlePopup();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: "external" }));
    expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
    expect(wrapper.find(".akaza-popover-content").exists()).toBe(false);
    await wrapper.setProps({ modelValue: true });
    await settlePopup();
    expect(wrapper.get(".akaza-popover-content").attributes("data-akaza-state")).toBe("open");
    expect(onOpenChange).toHaveBeenCalledOnce();
  });

  it("keeps logical nesting with a child teleported outside its parent", async () => {
    const wrapper = mount(defineComponent({
      components: { Popover },
      template: `
        <Popover :transition="false">
          <template #trigger="{ toggle, triggerProps }"><button class="parent-trigger" v-bind="triggerProps" @click="toggle">Parent</button></template>
          <template #content>
            <Popover teleport="body" :transition="false">
              <template #trigger="{ toggle, triggerProps }"><button class="child-trigger" v-bind="triggerProps" @click="toggle">Child</button></template>
              <template #content><button class="child-action">Action</button></template>
            </Popover>
          </template>
        </Popover>`,
    }), { attachTo: document.body });
    await settlePopup();
    await wrapper.get(".parent-trigger").trigger("click");
    await settlePopup();
    await wrapper.get(".child-trigger").trigger("click");
    await settlePopup();
    const action = document.querySelector<HTMLButtonElement>(".child-action")!;
    action.focus();
    pointer(action, "pointerdown");
    pointer(action, "pointerup");
    action.click();
    await settlePopup();
    expect(document.querySelectorAll(".akaza-popover-content")).toHaveLength(2);
    await escape(action);
    expect(document.querySelectorAll(".akaza-popover-content")).toHaveLength(1);
    expect(wrapper.get(".parent-trigger").attributes("aria-expanded")).toBe("true");
    await escape(wrapper.get<HTMLButtonElement>(".child-trigger").element);
    expect(document.querySelectorAll(".akaza-popover-content")).toHaveLength(0);
  });

  it("lets SDK presence keep custom exit classes until the animation finishes", async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: { modelValue: true, transition: "custom-popup" },
      slots: { trigger: '<button class="trigger">Options</button>', content: "Preview" },
    });
    await settlePopup();
    const content = wrapper.get<HTMLElement>(".akaza-popover-content");
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    vi.spyOn(content.element, "getAnimations").mockReturnValue([{ finished } as Animation]);
    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(content.element.isConnected).toBe(true);
    expect(content.classes()).toContain("custom-popup-leave-active");
    expect(content.classes()).toContain("custom-popup-leave-to");
    expect(content.attributes("data-akaza-state")).toBe("closed");
    finish();
    await settlePopup();
    expect(content.element.isConnected).toBe(false);
  });

  it("does not let a completed old exit unmount a reopened popup", async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: { modelValue: true, transition: "custom-popup" },
      slots: { trigger: '<button class="trigger">Options</button>', content: "Preview" },
    });
    await settlePopup();
    const content = wrapper.get<HTMLElement>(".akaza-popover-content");
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    vi.spyOn(content.element, "getAnimations").mockReturnValue([{ finished } as Animation]);
    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });
    finish();
    await settlePopup();
    expect(wrapper.get(".akaza-popover-content").element).toBe(content.element);
    expect(content.attributes("data-akaza-state")).toBe("open");
  });
});

async function fixture(
  teleport: false | "body",
  onOpenChange = vi.fn<(_open: boolean, _details: AkazaChangeEventDetails) => void>(),
  accept = true,
) {
  const wrapper = mount(defineComponent({
    components: { Popover },
    setup() {
      const open = ref(true);
      const update = (value: boolean) => { if (accept) open.value = value; };
      return { open, update, onOpenChange, teleport };
    },
    template: `
      <Popover :model-value="open" @update:model-value="update" @open-change="onOpenChange"
        :teleport="teleport" :transition="false">
        <template #trigger="{ toggle, triggerProps }">
          <button class="trigger" v-bind="triggerProps" @click="toggle">Options</button>
        </template>
        <template #content><input aria-label="Filter" /></template>
      </Popover>
      <button class="outside">Outside</button>
    `,
  }), { attachTo: document.body });
  await settlePopup();
  const trigger = wrapper.get<HTMLButtonElement>(".trigger");
  const outside = wrapper.get<HTMLButtonElement>(".outside");
  const content = document.querySelector<HTMLElement>(".akaza-popover-content")!;
  const input = content.querySelector("input")!;
  return { wrapper, trigger, outside, content, input, onOpenChange };
}

async function escape(target: HTMLElement) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await settlePopup();
  return event;
}

describe.each([false, "body"] as const)("popover teleport=%s", (teleport) => {
  it("keeps content focus when Escape closing is canceled", async () => {
    const onOpenChange = vi.fn((_open: boolean, details: AkazaChangeEventDetails) => details.cancel());
    const view = await fixture(teleport, onOpenChange);
    view.input.focus();
    const focus = vi.spyOn(view.trigger.element, "focus");

    const event = await escape(view.input);

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "escape", event }));
    expect(view.wrapper.findComponent(Popover).emitted("update:modelValue")).toBeUndefined();
    expect(view.content.isConnected).toBe(true);
    expect(view.trigger.attributes("aria-expanded")).toBe("true");
    expect(view.trigger.attributes("aria-controls")).toBe(view.content.id);
    expect(document.activeElement).toBe(view.input);
    expect(focus).not.toHaveBeenCalled();
  });

  it("keeps content focus when the controlled parent refuses Escape closing", async () => {
    const view = await fixture(teleport, undefined, false);
    view.input.focus();
    const focus = vi.spyOn(view.trigger.element, "focus");

    const event = await escape(view.input);

    expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "escape", event }));
    expect(view.wrapper.findComponent(Popover).emitted("update:modelValue")).toEqual([[false]]);
    expect(view.content.isConnected).toBe(true);
    expect(view.trigger.attributes("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(view.input);
    expect(focus).not.toHaveBeenCalled();
  });

  it("restores trigger focus without scrolling after an accepted Escape close", async () => {
    const view = await fixture(teleport);
    view.input.focus();
    const focus = vi.spyOn(view.trigger.element, "focus");

    const event = await escape(view.input);

    expect(view.onOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: "escape", event }));
    expect(view.content.isConnected).toBe(false);
    expect(view.trigger.attributes("aria-expanded")).toBe("false");
    expect(view.trigger.attributes("aria-controls")).toBeUndefined();
    expect(document.activeElement).toBe(view.trigger.element);
    expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
  });

  it("does not steal focus already outside the nonmodal panel", async () => {
    const view = await fixture(teleport);
    view.outside.element.focus();
    const focus = vi.spyOn(view.trigger.element, "focus");

    await escape(view.outside.element);

    expect(view.content.isConnected).toBe(false);
    expect(document.activeElement).toBe(view.outside.element);
    expect(focus).not.toHaveBeenCalled();
  });

  it("restores trigger focus when Safari-style pointer activation leaves body focused", async () => {
    const view = await fixture(teleport);
    expect(document.activeElement).toBe(document.body);

    await escape(document.body);

    expect(view.content.isConnected).toBe(false);
    expect(document.activeElement).toBe(view.trigger.element);
  });

  it("restores its trigger when pointer activation leaves the previous element focused", async () => {
    const view = await fixture(teleport);
    await view.trigger.trigger("click");
    await settlePopup();
    view.outside.element.focus();
    pointer(view.trigger.element, "pointerdown");
    pointer(view.trigger.element, "pointerup");
    view.trigger.element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));
    await settlePopup();
    expect(document.activeElement).toBe(view.outside.element);

    await escape(view.outside.element);

    expect(view.content.isConnected).toBe(false);
    expect(document.activeElement).toBe(view.trigger.element);
  });

  it.each(["synchronous", "nextTick"])("preserves a consumer's %s focus handoff during close", async (timing) => {
    let outside: HTMLButtonElement;
    const onOpenChange = vi.fn(() => {
      if (timing === "synchronous") outside.focus();
      else nextTick(() => outside.focus());
    });
    const view = await fixture(teleport, onOpenChange);
    outside = view.outside.element;
    view.input.focus();
    const focus = vi.spyOn(view.trigger.element, "focus");

    await escape(view.input);

    expect(view.content.isConnected).toBe(false);
    expect(document.activeElement).toBe(outside);
    expect(focus).not.toHaveBeenCalled();
  });

  it("keeps trigger focus when Escape originates there", async () => {
    const view = await fixture(teleport);
    view.trigger.element.focus();

    await escape(view.trigger.element);

    expect(view.content.isConnected).toBe(false);
    expect(document.activeElement).toBe(view.trigger.element);
  });

  it("exposes disclosure ARIA without promising dialog semantics or moving focus on open", async () => {
    const view = await fixture(teleport);
    expect(view.trigger.attributes("aria-haspopup")).toBeUndefined();
    expect(view.content.hasAttribute("role")).toBe(false);
    expect(view.content.hasAttribute("aria-modal")).toBe(false);
    expect(view.trigger.attributes("aria-controls")).toBe(view.content.id);

    view.trigger.element.focus();
    await view.trigger.trigger("click");
    expect(view.trigger.attributes("aria-expanded")).toBe("false");
    expect(view.trigger.attributes("aria-controls")).toBeUndefined();
    await view.trigger.trigger("click");
    expect(view.trigger.attributes("aria-expanded")).toBe("true");
    expect(view.trigger.attributes("aria-controls")).toBe(document.querySelector(".akaza-popover-content")!.id);
    expect(document.activeElement).toBe(view.trigger.element);
  });
});
