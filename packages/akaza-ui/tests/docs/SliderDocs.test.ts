import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import Vertical from "../../../../docs/app/components/examples/slider/Vertical.vue";

const docs = resolve(__dirname, "../../../../docs");

describe("slider documentation", () => {
  it("imports Akaza after Tailwind and keeps a separate setup for Vue without Tailwind", () => {
    const installation = readFileSync(resolve(docs, "content/1.getting-started/2.installation.md"), "utf8");
    const tailwind = installation.split("### Vue (with Tailwind CSS)\n")[1]!.split(/\n#{2,3} /)[0]!;
    expect(tailwind).toContain("import './main.css'");
    expect(tailwind).not.toContain("import 'akaza-ui/dist/akaza-ui.css'");
    const plain = installation.split("### Vue (without Tailwind)\n")[1]!.split(/\n#{2,3} /)[0]!;
    expect(plain).toMatch(/```ts \[main\.ts\][\s\S]*import 'akaza-ui\/dist\/akaza-ui\.css'/);
    const css = '@layer akaza-reset;\n@import "tailwindcss";\n@import "akaza-ui/dist/akaza-ui.css";';
    for (const path of [
      "content/1.getting-started/2.installation.md",
      "content/1.getting-started/3.styling.md",
      "content/3.components/slider.md",
      "../README.md",
      "../packages/akaza-ui/README.md",
    ]) {
      expect(readFileSync(resolve(docs, path), "utf8")).toContain(css);
    }
  });

  it("keeps the headless vertical snippet and styled preview behavior aligned", async () => {
    const content = readFileSync(resolve(docs, "content/3.components/slider.md"), "utf8");
    const section = content.split("### Vertical slider\n")[1]!.split("\n### ")[0]!;
    const snippet = section.match(/```vue\n([\s\S]*?)\n```/)![1]!;
    expect(section).toContain(":::examples-slider-vertical");
    const preview = readFileSync(resolve(docs, "app/components/examples/slider/Vertical.vue"), "utf8");
    for (const source of [snippet, preview]) {
      const { descriptor, errors } = parse(source);
      expect(errors).toEqual([]);
      compileScript(descriptor, { id: "vertical-slider" });
      expect(compileTemplate({ source: descriptor.template!.content, filename: "Vertical.vue", id: "vertical-slider" }).errors).toEqual([]);
      expect(descriptor.template!.content).toContain('v-model="volume"');
      expect(descriptor.template!.content).toContain('orientation="vertical"');
      expect(descriptor.template!.content).toContain('aria-label="Volume"');
    }

    const wrapper = mount(Vertical);
    const thumb = wrapper.get('[role="slider"]');
    expect(thumb.attributes("aria-orientation")).toBe("vertical");
    expect(wrapper.get(".akaza-slider").attributes("data-akaza-orientation")).toBe("vertical");
    expect(thumb.attributes("aria-valuenow")).toBe("60");
    await thumb.trigger("keydown", { key: "ArrowUp" });
    expect(thumb.attributes("aria-valuenow")).toBe("61");
    expect(wrapper.text()).toContain("Volume: 61");
    wrapper.unmount();
  });
});
