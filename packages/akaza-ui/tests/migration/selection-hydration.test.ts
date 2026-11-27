import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Rating } from "@/components/rating";
import { ToggleGroup } from "@/components/toggle-group";

it("hydrates Rating and ToggleGroup without SDK markup or a second selected value", async () => {
  const View = defineComponent({
    setup() {
      const score = ref(2.5);
      const selection = ref(["a"]);
      return () => h("form", [
        h(Rating, { modelValue: score.value, step: 0.5, name: "score", "onUpdate:modelValue": value => { score.value = value; } }),
        h(ToggleGroup, {
          modelValue: selection.value, type: "multiple", name: "choice", ariaLabel: "Choices",
          options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
          "onUpdate:modelValue": value => { selection.value = value as string[]; },
        }),
      ]);
    },
  });
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  const warn = vi.fn();
  const app = createSSRApp(View);
  app.config.warnHandler = warn;
  try {
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelector("[data-slot]")).toBeNull();
    expect(root.querySelectorAll('button[tabindex="0"]')).toHaveLength(2);
    const score = root.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]')!;
    score.focus();
    score.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    const beta = root.querySelectorAll<HTMLButtonElement>(".akaza-toggle-group-item")[1]!;
    beta.click();
    await nextTick();
    expect(new FormData(root.querySelector("form")!).get("score")).toBe("3");
    expect(new FormData(root.querySelector("form")!).getAll("choice")).toEqual(["a", "b"]);
    beta.click();
    await nextTick();
    expect(new FormData(root.querySelector("form")!).getAll("choice")).toEqual(["a"]);
  } finally {
    app.unmount();
    root.remove();
  }
});
