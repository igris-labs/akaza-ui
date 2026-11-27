import type { Component } from "vue";
import type { AkazaChangeEventDetails } from "@/types";
import { settle } from "@ui-sdk/core/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { afterAll, beforeAll, vi } from "vitest";
import { defineComponent, ref } from "vue";

export function popupEnvironment() {
  const style = document.createElement("style");
  style.textContent = "[popover] { display: block !important }";
  beforeAll(() => {
    document.head.append(style);
  });
  afterAll(() => {
    style.remove();
  });
}

export async function settled() {
  await settle();
  await flushPromises();
}

export async function popupFixture(component: Component, props: Record<string, unknown> = {}, options: {
  initialOpen?: boolean;
  accept?: boolean;
  cancel?: boolean;
} = {}) {
  const onOpenChange = vi.fn((_open: boolean, details: AkazaChangeEventDetails) => {
    if (options.cancel) details.cancel();
  });
  const wrapper = mount(defineComponent({
    components: { Popup: component },
    setup() {
      const open = ref(options.initialOpen ?? false);
      const update = (next: boolean) => { if (options.accept !== false) open.value = next; };
      return { open, update, onOpenChange, props };
    },
    template: `<Popup :model-value="open" @update:model-value="update" @open-change="onOpenChange"
      title="Edit issue" description="Issue details" v-bind="props">
      <template #trigger="{ toggle }"><button class="trigger" @click="toggle">Open</button></template>
      <template #body><input aria-label="Subject" /></template>
      <template #footer="{ close }">
        <button data-akaza-cancel @click="close">Cancel</button>
        <button class="confirm" @click="close('confirm', $event)">Confirm</button>
      </template>
    </Popup>
    <button class="outside">Outside</button>`,
  }), { attachTo: document.body });
  await settled();
  const popup = wrapper.findComponent(component);
  const trigger = wrapper.get<HTMLButtonElement>(".trigger");
  return { wrapper, popup, trigger, onOpenChange };
}

export async function escape(target: EventTarget) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  await settled();
  return event;
}

export async function outsidePress(target: EventTarget) {
  for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup"]) {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 }));
  }
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  target.dispatchEvent(event);
  await settled();
  return event;
}
