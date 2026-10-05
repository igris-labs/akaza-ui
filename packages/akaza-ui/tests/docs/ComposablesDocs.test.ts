import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import * as akaza from "../../src/index";

const contentRoot = resolve(__dirname, "../../../../docs/content");
const pages = ["use-data-table", "use-overlay", "use-sidebar", "use-toast"];

describe("public composable documentation", () => {
  it("documents every public use composable without exposing internal helpers", () => {
    const names = Object.keys(akaza).filter(name => /^use[A-Z]/.test(name)).sort();
    expect(names).toEqual(["useDataTable", "useOverlay", "useSidebar", "useToast"]);
    const index = readFileSync(resolve(contentRoot, "2.composables/1.index.md"), "utf8");
    for (const page of pages) expect(index).toContain(`/composables/${page}`);
    const toast = readFileSync(resolve(contentRoot, "2.composables/use-toast.md"), "utf8");
    expect(toast).toContain("createToastManager");
    expect(toast).toContain("provideToastManager");
  });

  it("orders navigation without changing component route names", () => {
    const sections = readdirSync(contentRoot).filter(name => /^\d\./.test(name)).sort();
    expect(sections).toEqual(["1.getting-started", "2.composables", "3.components", "4.builders"]);
    expect(readFileSync(resolve(contentRoot, "3.components/.navigation.yml"), "utf8")).toContain("Components");
    expect(readFileSync(resolve(contentRoot, "4.builders/layout-builder.md"), "utf8")).toContain("::examples-app-layout-builder");
  });

  it.each(pages)("provides compilable Vue snippets and an API reference for %s", (page) => {
    const content = readFileSync(resolve(contentRoot, `2.composables/${page}.md`), "utf8");
    expect(content).toContain("## API Reference");
    for (const [, source] of content.matchAll(/```vue\n([\s\S]*?)\n```/g)) {
      const { descriptor, errors } = parse(source!);
      expect(errors).toEqual([]);
      if (descriptor.scriptSetup) compileScript(descriptor, { id: page });
      if (descriptor.template) {
        expect(compileTemplate({ source: descriptor.template.content, filename: `${page}.vue`, id: page }).errors).toEqual([]);
      }
    }
  });
});
