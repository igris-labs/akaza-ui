import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, effectScope, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { useDisclosure, useFormReset, useTypeahead } from "@/index";

afterEach(() => {
  vi.useRealTimers();
});

describe("useDisclosure", () => {
  it("owns independent state and supports native event handlers", async () => {
    const wrapper = mount(defineComponent({
      setup: () => useDisclosure(),
      template: '<button @click="toggle">{{ isOpen }}</button>',
    }));
    const other = useDisclosure();
    await wrapper.get("button").trigger("click");
    expect(wrapper.text()).toBe("true");
    expect(other.isOpen.value).toBe(false);
    wrapper.unmount();
  });

  it("updates the supplied ref without maintaining a second copy", () => {
    const model = ref(true);
    const disclosure = useDisclosure(model);
    expect(disclosure.isOpen).toBe(model);
    disclosure.close();
    expect(model.value).toBe(false);
    disclosure.open();
    expect(model.value).toBe(true);
    model.value = false;
    disclosure.toggle();
    expect(model.value).toBe(true);
  });
});

describe("useTypeahead", () => {
  it("buffers normalized text and restarts its timeout", () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const typeahead = scope.run(() => useTypeahead())!;
    expect(typeahead.push("b")).toBe("b");
    vi.advanceTimersByTime(400);
    expect(typeahead.push("a")).toBe("ba");
    vi.advanceTimersByTime(400);
    expect(typeahead.query.value).toBe("ba");
    vi.advanceTimersByTime(100);
    expect(typeahead.query.value).toBe("");
    scope.stop();
  });

  it("preserves repeated characters unless cycling is requested", () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const ordinary = scope.run(() => useTypeahead())!;
    const cycling = scope.run(() => useTypeahead({ resetOnRepeatedCharacter: true }))!;
    ordinary.push("a");
    expect(ordinary.push("a")).toBe("aa");
    cycling.push("a");
    expect(cycling.push("a")).toBe("a");
    expect(cycling.push("b")).toBe("ab");
    expect(cycling.push("")).toBe("ab");
    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reads a reactive timeout on each input and clears timers on disposal", () => {
    vi.useFakeTimers();
    const timeout = ref(100);
    const scope = effectScope();
    const typeahead = scope.run(() => useTypeahead({ timeout: () => timeout.value }))!;
    typeahead.push("x");
    vi.advanceTimersByTime(100);
    expect(typeahead.query.value).toBe("");
    timeout.value = 1000;
    typeahead.push("y");
    vi.advanceTimersByTime(100);
    expect(typeahead.query.value).toBe("y");
    scope.stop();
    expect(typeahead.query.value).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useFormReset", () => {
  function fixture() {
    const reset = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        const input = ref<HTMLInputElement | null>(null);
        useFormReset(() => input.value, reset);
        return { input };
      },
      template: '<div><form id="first"></form><form id="second"></form><input ref="input" form="first"></div>',
    }), { attachTo: document.body });
    return { wrapper, reset };
  }

  it("uses current form ownership and ignores unrelated forms", async () => {
    const { wrapper, reset } = fixture();
    try {
      await wrapper.get("#second").trigger("reset");
      expect(reset).not.toHaveBeenCalled();
      await wrapper.get("#first").trigger("reset");
      expect(reset).toHaveBeenCalledTimes(1);
      wrapper.get("input").element.setAttribute("form", "second");
      await wrapper.get("#first").trigger("reset");
      expect(reset).toHaveBeenCalledTimes(1);
      await wrapper.get("#second").trigger("reset");
      expect(reset).toHaveBeenCalledTimes(2);
    } finally {
      wrapper.unmount();
    }
  });

  it("honors preventDefault after capture and ignores pending resets after unmount", async () => {
    const { wrapper, reset } = fixture();
    const form = wrapper.get("#first").element;
    form.addEventListener("reset", event => event.preventDefault(), { once: true });
    form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    await nextTick();
    expect(reset).not.toHaveBeenCalled();
    form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    wrapper.unmount();
    await flushPromises();
    expect(reset).not.toHaveBeenCalled();
  });
});

it("initializes public helpers during SSR without DOM access", async () => {
  const component = defineComponent({
    setup() {
      const disclosure = useDisclosure(ref(true));
      useTypeahead();
      useFormReset(() => null, () => {});
      return disclosure;
    },
    template: '<span>{{ isOpen }}</span>',
  });
  expect(await renderToString(createSSRApp(component))).toBe("<span>true</span>");
});
