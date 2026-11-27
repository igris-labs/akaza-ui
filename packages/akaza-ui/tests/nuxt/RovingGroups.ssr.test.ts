// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Menubar, NavigationMenu, RadioGroup, Rating, Stepper, Tabs, ToggleGroup, Toolbar } from "@/index";

it("renders isolated roving groups without browser globals", async () => {
  const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
  const render = (value: string) => renderToString(createSSRApp(defineComponent({
    render: () => h("div", [
      h(Tabs, { items: options, modelValue: value }),
      h(RadioGroup, { options, modelValue: value }),
      h(ToggleGroup, { options, modelValue: value }),
      h(Toolbar, { items: options }),
      h(Stepper, { items: options.map(option => ({ value: option.value, title: option.label })), modelValue: value }),
      h(Menubar, { items: options, ariaLabel: "Application" }),
      h(NavigationMenu, { items: options, modelValue: value }),
      h(Rating, { modelValue: value === "a" ? 2.5 : 4, step: 0.5 }),
    ]),
  })));
  const [first, second] = await Promise.all([render("a"), render("b")]);
  expect((first.match(/<button[^>]*tabindex="0"/g) ?? [])).toHaveLength(8);
  expect((second.match(/<button[^>]*tabindex="0"/g) ?? [])).toHaveLength(8);
  expect(first).toContain('aria-selected="true"');
  expect(first).not.toContain("data-slot");
  expect(second).not.toContain("data-slot");
  expect(await render("a")).toBe(first);
});
