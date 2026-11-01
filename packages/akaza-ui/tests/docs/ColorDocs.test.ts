import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";

const names = ["color-picker", "color-field", "color-area", "color-slider", "color-swatch", "color-swatch-picker"];
describe("color documentation", () => {
  it.each(names)("documents %s with compilable examples and styling/keyboard contracts", name => {
    const content = readFileSync(resolve(__dirname, `../../../../docs/content/3.components/${name}.md`), "utf8");
    for (const heading of ["## Anatomy", "## Examples", "### Props", "### Emits", "### Slots", "### UI Options", "### Styling Hooks", "### Keyboard", "## Parity Notes"]) expect(content).toContain(heading);
    expect(content).toContain(`examples-${name}-demo`);
    const demo = readFileSync(resolve(__dirname, `../../../../docs/app/components/examples/${name}/Demo.vue`), "utf8");
    expect(demo).toContain("[--ui-radius:0.25rem]");
    for (const [, source] of content.matchAll(/```vue\n([\s\S]*?)\n```/g)) {
      const { descriptor, errors } = parse(source!);
      expect(errors).toEqual([]);
      if (descriptor.scriptSetup) compileScript(descriptor, { id: name });
      if (descriptor.template) expect(compileTemplate({ source: descriptor.template.content, filename: `${name}.vue`, id: name }).errors).toEqual([]);
    }
  });
});
