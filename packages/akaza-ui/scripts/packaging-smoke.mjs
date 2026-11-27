import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
assert.equal(manifest.engines.node, ">=22.12.0");
assert.equal(manifest.dependencies["@ui-sdk/core"], "0.1.0-beta.17");
assert.deepEqual(manifest.exports, {
  ".": {
    import: { types: "./dist/types/index.d.ts", default: "./dist/akaza-ui.js" },
    require: { types: "./dist/types/index.d.ts", default: "./dist/akaza-ui.cjs" },
  },
  "./nuxt": {
    types: "./dist/types/nuxt.d.ts",
    import: "./dist/nuxt.js",
    require: "./dist/nuxt.cjs",
  },
  "./dist/akaza-ui.css": "./dist/akaza-ui.css",
});

for (const file of [
  "composables/color/useColor",
  "composables/data-table/useDataTable",
  "composables/disclosure/useDisclosure",
  "utils/useFormReset",
  "composables/overlay/useOverlay",
  "composables/roving-focus/useRovingFocus",
  "composables/selection/useSelection",
  "composables/sidebar/useSidebar",
  "composables/toast/index",
  "composables/typeahead/useTypeahead",
]) {
  const declarations = readFileSync(new URL(`dist/types/${file}.d.ts`, root), "utf8");
  assert.match(declarations, /@example/, file);
}

const consumers = [
  ["commonjs", `const akaza = require("akaza-ui"); const nuxt = require("akaza-ui/nuxt");`],
  [
    "module",
    `const akaza = await import("akaza-ui"); const { default: nuxt } = await import("akaza-ui/nuxt");`,
  ],
];
const results = consumers.map(([format, load]) => {
  const script = `
    (async () => {
      const assert = (await import("node:assert/strict")).default;
      const { createRequire } = await import("node:module");
      const require = createRequire(process.cwd() + "/package.json");
      for (const name of ["window", "document", "HTMLElement", "Element", "Node", "MutationObserver", "ResizeObserver"]) {
        assert.equal(typeof globalThis[name], "undefined", name);
      }
      ${load}
      assert.equal(typeof nuxt, "function");
      assert.ok(require.resolve("akaza-ui/dist/akaza-ui.css").endsWith("/dist/akaza-ui.css"));
      for (const entry of ["@ui-sdk/core", "@ui-sdk/core/dialog", "@ui-sdk/core/popover"]) {
        const cjs = require(entry);
        const esm = await import(entry);
        for (const key of Object.keys(esm)) assert.equal(cjs[key], esm[key], entry + ":" + key);
      }
      const sdk = require("@ui-sdk/core");
      assert.equal(typeof sdk.bindLayer, "function");
      const { createSSRApp, h } = require("vue");
      const { renderToString } = require("vue/server-renderer");
      const html = await renderToString(createSSRApp({
        render: () => h("main", [
          h(akaza.Button, null, () => "Packaging SSR"),
          ...["Dialog", "Popover", "Menu", "Tooltip"].map(name => h(akaza[name], {
            items: [{ label: "Item", value: "item" }],
          }, { trigger: () => h("button", name) })),
        ]),
      }));
      assert.match(html, /Packaging SSR/);
      for (const name of ["Dialog", "Popover", "Menu", "Tooltip"]) assert.ok(html.includes(name), name);
      console.log(JSON.stringify({ exports: Object.keys(akaza).sort(), html }));
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `;
  const result = spawnSync(process.execPath, [`--input-type=${format}`, "-e", script], {
    cwd: fileURLToPath(root),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${format}: ${result.error ?? result.stderr}`);
  return JSON.parse(result.stdout);
});
assert.deepEqual(results[0], results[1], "CJS and ESM exports and SSR output must match");

let declarations = 0;
const externalFormats = new Set();
for (const path of readdirSync(new URL("dist/", root), { recursive: true, encoding: "utf8" })) {
  const url = new URL(`dist/${path}`, root);
  if (path.endsWith(".d.ts")) {
    assert.doesNotMatch(readFileSync(url, "utf8"), /@ui-sdk\//, path);
    declarations++;
  } else if (/\.(?:js|cjs)$/.test(path)) {
    if (readFileSync(url, "utf8").includes("@ui-sdk/core")) {
      externalFormats.add(path.endsWith(".cjs") ? "cjs" : "esm");
    }
  } else if (/\.(?:js|cjs)\.map$/.test(path)) {
    const map = JSON.parse(readFileSync(url, "utf8"));
    assert.ok(
      map.sources.every(
        (source) => !source.includes("@ui-sdk/core") && !source.includes("@ui-sdk+core"),
      ),
      path,
    );
  }
}
assert.ok(declarations > 0, "Built declarations must exist");
assert.deepEqual([...externalFormats].sort(), ["cjs", "esm"]);
console.log(
  `Packaging smoke passed on Node ${process.versions.node}: CJS + ESM SSR, shared SDK, ${declarations} declarations`,
);
