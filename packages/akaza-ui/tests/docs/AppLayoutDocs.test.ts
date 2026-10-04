import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import Builder from "../../../../docs/app/components/examples/app-layout/Builder.vue";
import Demo from "../../../../docs/app/components/examples/app-layout/Demo.vue";
import Example from "../../../../docs/app/components/examples/app-layout/Example.vue";

function mountBuilder() {
  return mount(Builder, {
    global: {
      stubs: {
        Demo: true,
        ComponentCode: { template: "<div><slot /></div>" },
        ClientOnly: { template: "<div><slot /></div>" },
        MDC: { props: ["value"], template: "<pre>{{ value }}</pre>" },
        MDCRenderer: true,
        UButton: { props: ["label"], template: "<button>{{ label }}</button>" },
      },
    },
  });
}

function verifyCode(source: string) {
  const { descriptor, errors } = parse(source);
  expect(errors).toEqual([]);
  expect(descriptor.template).not.toBeNull();
  if (descriptor.scriptSetup) compileScript(descriptor, { id: "layout-example" });
  expect(compileTemplate({ source: descriptor.template!.content, filename: "Example.vue", id: "layout-example" }).errors).toEqual([]);
  expect(source).not.toMatch(/shellUi|sidebarUi|navigationUi|bg-neutral|text-neutral/);
}

describe("app layout documentation", () => {
  it("provides a live preview for usage and each example, with valid Vue snippets", () => {
    const content = readFileSync(resolve(__dirname, "../../../../docs/content/3.components/app-layout.md"), "utf8");
    expect(content.match(/:::examples-app-layout-(?:demo|example)/g)).toHaveLength(5);
    expect(content).toContain("/builders/layout-builder");
    expect(content).not.toContain(":::examples-app-layout-builder");
    const builder = readFileSync(resolve(__dirname, "../../../../docs/content/4.builders/layout-builder.md"), "utf8");
    expect(builder.match(/:::examples-app-layout-builder/g)).toHaveLength(1);
    expect(content).not.toMatch(/:::examples[^\n]*:layout=/);
    const snippets = [...content.matchAll(/```vue\n([\s\S]*?)\n```/g)];
    expect(snippets).toHaveLength(5);
    for (const [, source] of snippets) verifyCode(source!.includes("<template>") ? source! : `<template>\n${source}\n</template>`);
  });

  it.each(["between", "page", "contained", "overlay"] as const)("sets the %s preview explicitly rather than relying on Markdown expressions", (variant) => {
    const wrapper = mount(Example, { props: { variant }, global: { stubs: { Demo: true } } });
    const props = wrapper.getComponent(Demo).props();
    expect(props.showRight).toBe(variant === "between");
    expect(props.showLeft).toBe(variant !== "contained");
    expect(props.showFooter).toBe(variant !== "contained");
    expect(props.scroll).toBe(variant === "page" ? "page" : "content");
    expect(props.stickyHeader).toBe(variant === "page");
    expect(props.layout).toEqual(variant === "between" ? { header: "content", footer: "content" } : variant === "overlay" ? { left: "overlay" } : {});
    wrapper.unmount();
  });

  it("keeps side placement and sizes independent and resets the preview", async () => {
    const wrapper = mountBuilder();
    await wrapper.get('input[type="checkbox"]').setValue(false);
    await wrapper.findAll('input[type="checkbox"]')[2]!.setValue(true);
    const placements = wrapper.findAll("fieldset select");
    await placements[0]!.setValue("overlay");
    await wrapper.findAll('input[type="range"]')[1]!.setValue(224);
    const props = wrapper.getComponent(Demo).props();
    expect(props.showHeader).toBe(false);
    expect(props.layout).toMatchObject({ left: "overlay", right: "inline" });
    expect(props.leftSize).toBe(168);
    expect(props.rightSize).toBe(224);
    expect(wrapper.get("pre").text()).toContain(':default-size="224"');
    await wrapper.get("button").trigger("click");
    expect(wrapper.getComponent(Demo).props()).toMatchObject({ showHeader: true, showRight: false, leftSize: 168, rightSize: 160 });
    wrapper.unmount();
  });

  it("generates compilable headless code for every region combination", async () => {
    const wrapper = mountBuilder();
    for (let mask = 0; mask < 16; mask++) {
      const inputs = wrapper.findAll('input[type="checkbox"]');
      for (let index = 0; index < 4; index++) await inputs[index]!.setValue(Boolean(mask & (1 << index)));
      const markdown = wrapper.get("pre").text();
      const source = markdown.replace(/^```vue\n/, "").replace(/\n```$/, "");
      verifyCode(source);
      expect(source.includes("<template #header>")).toBe(Boolean(mask & 1));
      expect(source.includes("#left")).toBe(Boolean(mask & 2));
      expect(source.includes("#right")).toBe(Boolean(mask & 4));
      expect(source.includes("#footer")).toBe(Boolean(mask & 8));
    }
    wrapper.unmount();
  });

  it("keeps generated scroll, sticky, collapse, and mobile options in sync with the preview", async () => {
    const wrapper = mountBuilder();
    const select = (label: string) => wrapper.findAll("select").find(control => control.element.parentElement?.textContent?.startsWith(label))!;
    await select("Scrolling").setValue("page");
    await wrapper.findAll('input[type="checkbox"]')[4]!.setValue(true);
    await select("Collapse behavior").setValue("offcanvas");
    await select("Sidebar mode").setValue("mobile");
    expect(wrapper.getComponent(Demo).props()).toMatchObject({ scroll: "page", stickyHeader: true, collapsible: "offcanvas", mobile: true });
    const source = wrapper.get("pre").text().replace(/^```vue\n/, "").replace(/\n```$/, "");
    verifyCode(source);
    expect(source).toContain('scroll="page" sticky-header');
    expect(source).toContain('collapsible="offcanvas" :mobile="true"');
    wrapper.unmount();
  });
});
