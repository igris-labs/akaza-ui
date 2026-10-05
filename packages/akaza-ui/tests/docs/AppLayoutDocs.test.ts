import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import Builder from "../../../../docs/app/components/examples/app-layout/Builder.vue";
import BuilderPreview from "../../../../docs/app/components/examples/app-layout/BuilderPreview.vue";
import BuilderSelect from "../../../../docs/app/components/examples/app-layout/BuilderSelect.vue";
import Demo from "../../../../docs/app/components/examples/app-layout/Demo.vue";
import Example from "../../../../docs/app/components/examples/app-layout/Example.vue";

function mountBuilder() {
  return mount(Builder, {
    global: {
      stubs: {
        BuilderPreview: true,
        ComponentCode: { template: "<div><slot /></div>" },
        ClientOnly: { template: "<div><slot /></div>" },
        MDC: { props: ["value"], template: "<pre>{{ value }}</pre>" },
        MDCRenderer: true,
        UButton: { props: ["label"], template: "<button>{{ label }}</button>" },
        UIcon: true,
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
    expect(content.match(/:::examples-app-layout-(?:demo|example)/g)).toHaveLength(6);
    expect(content).toContain("/builders/layout-builder");
    expect(content).not.toContain(":::examples-app-layout-builder");
    const builder = readFileSync(resolve(__dirname, "../../../../docs/content/4.builders/layout-builder.md"), "utf8");
    expect(builder.match(/::examples-app-layout-builder/g)).toHaveLength(1);
    expect(content).not.toMatch(/:::examples[^\n]*:layout=/);
    const snippets = [...content.matchAll(/```vue\n([\s\S]*?)\n```/g)];
    expect(snippets).toHaveLength(6);
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
    await wrapper.findAll("label").find(label => label.text() === "Right sidebar")!.get("input").setValue(true);
    await wrapper.findAllComponents(BuilderSelect).find(control => control.props("label") === "Left placement")!.get("select").setValue("overlay");
    await wrapper.findAll('input[type="range"]')[1]!.setValue(224);
    const props = wrapper.getComponent(BuilderPreview).props();
    expect(props.showHeader).toBe(false);
    expect(props.layout).toMatchObject({ left: "overlay", right: "inline" });
    expect(props.leftSize).toBe(168);
    expect(props.rightSize).toBe(224);
    expect(wrapper.get("pre").text()).toContain(':default-size="224"');
    await wrapper.get("button").trigger("click");
    expect(wrapper.getComponent(BuilderPreview).props()).toMatchObject({ showHeader: true, showRight: false, leftSize: 168, rightSize: 160 });
    wrapper.unmount();
  });

  it("generates compilable headless code for every region combination", async () => {
    const wrapper = mountBuilder();
    for (let mask = 0; mask < 16; mask++) {
      const regions = ["Header", "Left sidebar", "Right sidebar", "Footer"];
      for (const [index, name] of regions.entries()) {
        await wrapper.findAll("label").find(label => label.text() === name)!.get("input").setValue(Boolean(mask & (1 << index)));
      }
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
    const select = (label: string) => wrapper.findAllComponents(BuilderSelect).find(control => control.props("label") === label)!.get("select");
    await select("Scrolling").setValue("page");
    await wrapper.findAll("label").find(label => label.text() === "Sticky header")!.get("input").setValue(true);
    await select("Left collapse").setValue("offcanvas");
    await select("Responsive preview").setValue("mobile");
    expect(wrapper.getComponent(BuilderPreview).props()).toMatchObject({ scroll: "page", stickyHeader: true, leftCollapsible: "offcanvas", rightCollapsible: "icon", mobile: true });
    const source = wrapper.get("pre").text().replace(/^```vue\n/, "").replace(/\n```$/, "");
    verifyCode(source);
    expect(source).toContain('scroll="page" sticky-header');
    expect(source).toContain('collapsible="offcanvas" :mobile="true"');
    wrapper.unmount();
  });

  it("keeps hidden region settings visible but disabled without losing their values", async () => {
    const wrapper = mountBuilder();
    const select = (label: string) => wrapper.findAllComponents(BuilderSelect).find(control => control.props("label") === label)!.get("select");
    const toggle = (label: string) => wrapper.findAll("label").find(control => control.text() === label)!.get("input");
    expect(select("Right placement").element.matches(":disabled")).toBe(true);
    await select("Left collapse").setValue("offcanvas");
    await toggle("Left sidebar").setValue(false);
    expect(select("Left collapse").element.matches(":disabled")).toBe(true);
    expect(select("Responsive preview").element.matches(":disabled")).toBe(true);
    await toggle("Left sidebar").setValue(true);
    expect(select("Left collapse").element.matches(":disabled")).toBe(false);
    expect(wrapper.getComponent(BuilderPreview).props("leftCollapsible")).toBe("offcanvas");
    await select("Scrolling").setValue("page");
    await select("Left placement").setValue("overlay");
    expect(toggle("Sticky left sidebar").element.matches(":disabled")).toBe(true);
    await select("Left placement").setValue("inline");
    expect(toggle("Sticky left sidebar").element.matches(":disabled")).toBe(false);
    wrapper.unmount();
  });

  it("renders structural region labels without workspace data", async () => {
    const wrapper = mount(BuilderPreview, {
      props: { layout: {}, scroll: "content", showHeader: true, showFooter: true, showLeft: true, showRight: true, stickyHeader: false, stickyFooter: false, stickyLeft: false, stickyRight: false, leftCollapsible: "icon", rightCollapsible: "icon", mobile: false, leftSize: 168, rightSize: 160 },
    });
    expect(wrapper.findAll("[data-layout-region]").map(region => region.attributes("data-layout-region"))).toEqual(["header", "left", "main", "right", "footer"]);
    expect(wrapper.find(".akaza-navigation-menu").exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/Acme|Projects|Website|saved/);
    await wrapper.setProps({ showHeader: false, showLeft: false, showRight: false, showFooter: false });
    expect(wrapper.findAll("[data-layout-region]")).toHaveLength(1);
    wrapper.unmount();
  });

  it("exports asymmetric bars and independent sticky sides", async () => {
    const wrapper = mountBuilder();
    const select = (label: string) => wrapper.findAllComponents(BuilderSelect).find(control => control.props("label") === label)!.get("select");
    await select("Header width").setValue("left");
    await select("Footer width").setValue("right");
    await select("Scrolling").setValue("page");
    await wrapper.findAll("label").find(label => label.text() === "Sticky left sidebar")!.get("input").setValue(true);
    expect(wrapper.getComponent(BuilderPreview).props()).toMatchObject({ layout: { header: "left", footer: "right" }, stickyLeft: true, stickyRight: false });
    const source = wrapper.get("pre").text().replace(/^```vue\n/, "").replace(/\n```$/, "");
    verifyCode(source);
    expect(source).toContain('"header": "left"');
    expect(source).toContain('"footer": "right"');
    expect(source).toContain("sticky-left");
    expect(source).not.toContain("sticky-right");
    wrapper.unmount();
  });

  it("applies complete arrangements and exports non-collapsible sidebars", async () => {
    const wrapper = mountBuilder();
    await wrapper.findAll("button").find(button => button.text() === "Full-height right")!.trigger("click");
    expect(wrapper.getComponent(BuilderPreview).props()).toMatchObject({ layout: { header: "left", footer: "left" }, showLeft: true, showRight: true });
    await wrapper.findAllComponents(BuilderSelect).find(control => control.props("label") === "Right collapse")!.get("select").setValue("false");
    expect(wrapper.getComponent(BuilderPreview).props("rightCollapsible")).toBe(false);
    const source = wrapper.get("pre").text().replace(/^```vue\n/, "").replace(/\n```$/, "");
    verifyCode(source);
    expect(source).toContain(':collapsible="false"');
    expect(source).toContain(':disabled="!right.isMobile.value"');
    wrapper.unmount();
  });
});
