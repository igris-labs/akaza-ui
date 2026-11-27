// @vitest-environment node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sdkPackage = JSON.parse(readFileSync(require.resolve("@ui-sdk/core/package.json"), "utf8"));
const node18 = process.env.BATCH13_NODE18;

describe("batch 13 external shared-registry packaging boundary", () => {
  it("records the pinned ESM SDK and Node 22.12+ support with CJS retained", () => {
    const akaza = JSON.parse(readFileSync(resolve(here, "../../package.json"), "utf8"));
    const workspace = JSON.parse(readFileSync(resolve(here, "../../../../package.json"), "utf8"));
    expect(akaza.engines.node).toBe(">=22.12.0");
    expect(workspace.engines.node).toBe(">=22.12.0");
    expect(akaza.dependencies["@ui-sdk/core"]).toBe("0.1.0-beta.17");
    expect(sdkPackage.version).toBe("0.1.0-beta.17");
    expect(sdkPackage.type).toBe("module");
    for (const entry of [".", "./dialog", "./popover"]) {
      expect(sdkPackage.exports[entry]).not.toHaveProperty("require");
      expect(sdkPackage.exports[entry].default).toMatch(/\.js$/);
    }
    expect(akaza.exports["."].require.default).toBe("./dist/akaza-ui.cjs");
  });

  it("loads public ESM popup entries with no DOM on the current Node", () => {
    const result = spawnSync(process.execPath, [resolve(here, "batch13-external-sdk.mjs")], {
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("batch13-esm-ssr-ok");
  });

  it("resolves require/import to the same external SDK module on supported Node 22.12+", () => {
    const script = `
      const assert = require('node:assert/strict');
      const cjs = require('@ui-sdk/core');
      import('@ui-sdk/core').then(esm => {
        assert.equal(cjs.bindLayer, esm.bindLayer);
        assert.equal(cjs.createPopup, esm.createPopup);
        console.log('batch13-one-external-module');
      });
    `;
    const result = spawnSync(process.execPath, ["-e", script], {
      cwd: resolve(here, "../.."),
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("batch13-one-external-module");
  });

  it.skipIf(!node18)(
    "historical diagnostic: unsupported Node 18.20.8 loads ESM but rejects CJS",
    () => {
      const version = spawnSync(node18!, ["--version"], { encoding: "utf8" });
      expect(version.stdout.trim()).toBe("v18.20.8");
      const esm = spawnSync(node18!, [resolve(here, "batch13-external-sdk.mjs")], {
        encoding: "utf8",
      });
      expect(esm.status, esm.stderr).toBe(0);
      expect(esm.stdout.trim()).toBe("batch13-esm-ssr-ok");
      const cjs = spawnSync(node18!, [resolve(here, "batch13-external-sdk.cjs")], {
        encoding: "utf8",
      });
      expect(cjs.status).toBe(1);
      expect(cjs.stderr).toContain("ERR_REQUIRE_ESM");
      expect(cjs.stdout).not.toContain("batch13-cjs-ok");
    },
  );
});
