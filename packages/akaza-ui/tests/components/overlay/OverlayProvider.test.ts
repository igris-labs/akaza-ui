import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { OverlayProvider } from "@/components/overlay";
import { useOverlay } from "@/composables/overlay/useOverlay";

const TestOverlay = defineComponent({
  props: {
    modelValue: Boolean,
    title: String,
  },
  emits: ["update:model-value", "close"],
  template: `
    <section v-if="modelValue" class="test-overlay">
      <span>{{ title }}</span>
      <button class="dismiss" @click="$emit('update:model-value', false)">Dismiss</button>
      <button class="resolve" @click="$emit('close', 'accepted')">Resolve</button>
    </section>
  `,
});

function resetOverlays() {
  const { overlays } = useOverlay();
  for (const overlay of overlays.slice()) overlay._close(undefined);
  overlays.splice(0);
}

beforeEach(resetOverlays);
afterEach(resetOverlays);

describe("overlay provider", () => {
  it("renders, patches, closes, and resolves an overlay", async () => {
    const { create } = useOverlay();
    const instance = create(TestOverlay, { props: { title: "Initial" } });
    const provider = mount(OverlayProvider);
    const { result } = instance.open();
    await nextTick();

    expect(instance.isOpen()).toBe(true);
    expect(provider.get(".test-overlay").text()).toContain("Initial");
    instance.patch({ title: "Patched" });
    await nextTick();
    expect(provider.get(".test-overlay").text()).toContain("Patched");

    await provider.get(".resolve").trigger("click");
    await expect(result).resolves.toBe("accepted");
    expect(instance.isOpen()).toBe(false);
    provider.unmount();
  });

  it("settles an existing promise before reopening or unmounting", async () => {
    const { create } = useOverlay();
    const instance = create(TestOverlay);
    const first = instance.open().result;
    const second = instance.open().result;

    await expect(first).resolves.toBeUndefined();
    instance.unmount();
    await expect(second).resolves.toBeUndefined();
    expect(instance.isOpen()).toBe(false);
  });

  it("delegates v-model dismissal and destroys when configured", async () => {
    const { create, overlays } = useOverlay();
    const instance = create(TestOverlay, { destroyOnClose: true });
    const provider = mount(OverlayProvider);
    const { result } = instance.open();
    await nextTick();

    await provider.get(".dismiss").trigger("click");
    await expect(result).resolves.toBeUndefined();
    expect(overlays).toHaveLength(0);
    provider.unmount();
  });
});
