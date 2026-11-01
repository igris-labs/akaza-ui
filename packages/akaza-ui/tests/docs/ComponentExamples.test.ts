import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";

const contentRoot = resolve(__dirname, "../../../../docs/content");
const pages = ["2.composables", "3.components"].flatMap(section =>
  readdirSync(resolve(contentRoot, section))
    .filter(file => file.endsWith(".md"))
    .map(file => `${section}/${file}`),
);

describe("component and composable examples", () => {
  it.each(pages)("compiles Vue code blocks in %s", page => {
    const content = readFileSync(resolve(contentRoot, page), "utf8");
    for (const [index, match] of [...content.matchAll(/^```vue[^\n]*\n([\s\S]*?)^```/gm)].entries()) {
      const source = match[1]!;
      // Some docs show template fragments rather than complete SFCs.
      const sfc = /<(?:script(?:\s|>)|template>)/.test(source)
        ? source
        : `<template>\n${source}\n</template>`;
      const id = `${page}-${index}`;
      const { descriptor, errors } = parse(sfc);
      expect(errors, id).toEqual([]);
      if (descriptor.scriptSetup) compileScript(descriptor, { id });
      if (descriptor.template) {
        const compiled = compileTemplate({ source: descriptor.template.content, filename: `${id}.vue`, id });
        expect(compiled.errors, id).toEqual([]);
      }
    }
  });
});
