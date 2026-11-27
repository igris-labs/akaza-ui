import { expect, test } from "@playwright/test";
import { build } from "vite";

let script = "";

test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production"), __VUE_OPTIONS_API__: "false", __VUE_PROD_DEVTOOLS__: "false", __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false" },
    logLevel: "silent",
    build: {
      write: false,
      minify: false,
      lib: {
        entry: new URL("../migration/batch23-popup-fixture.ts", import.meta.url).pathname,
        name: "AkazaPopupProof",
        formats: ["iife"],
      },
    },
  });
  if (Array.isArray(result) && result[0] && "output" in result[0]) {
    script = result[0].output.find(item => item.type === "chunk")?.code ?? "";
  } else if ("output" in result) {
    script = result.output.find(item => item.type === "chunk")?.code ?? "";
  }
  if (!script) throw new Error("SDK public-part proof did not build");
});

for (const kind of ["dialog", "customDialog"] as const) {
  test(`${kind} public mount owns native dialog modality`, async ({ page }) => {
    await page.setContent('<button id="outside">Outside</button>');
    await page.addScriptTag({ content: script });
    await page.evaluate((kind) => {
      const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
      proof.mount(proof[kind], { modal: true }, '<root><trigger data-proof="trigger">Open proof</trigger><content data-proof="content" initialFocus="#first"><button id="first">First</button><button id="last">Last</button></content></root>');
    }, kind);
    await page.locator('[data-proof="trigger"]').click();
    const content = page.locator('[data-proof="content"]');
    await expect(content).toBeVisible();
    await expect(page.locator("#first")).toBeFocused();
    await page.locator("#last").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#first")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#last")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-proof="trigger"]')).toBeFocused();
    await expect(content).toHaveCount(0);
  });
}

test("Vue core adapter owns modal focus, inert, Escape and return focus", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup();
  });
  const trigger = page.locator('[data-proof="trigger"]');
  const content = page.locator('[data-proof="content"]');
  await trigger.click();
  await expect(content).toBeVisible();
  await expect(page.locator("#first")).toBeFocused();
  await expect(page.locator("#outside")).toHaveAttribute("inert");
  await page.locator("#last").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#first")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#last")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(content).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("#outside")).not.toHaveAttribute("inert");
});

test("controlled refusal retains SDK modal effects and focused content", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ refuse: true, initialOpen: true });
  });
  await expect(page.locator("#first")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-proof="content"]')).toBeVisible();
  await expect(page.locator("#first")).toBeFocused();
  await expect(page.locator("#outside")).toHaveAttribute("inert");
});

test("nonmodal SDK popup leaves page controls usable", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ modal: false });
  });
  await page.locator('[data-proof="trigger"]').click();
  await expect(page.locator('[data-proof="content"]')).toBeVisible();
  await expect(page.locator("#outside")).not.toHaveAttribute("inert");
  await page.locator("#outside").focus();
  await expect(page.locator("#outside")).toBeFocused();
});

test("SDK modal fallback remains usable without native popover APIs", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button>');
  await page.evaluate(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
    Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
    Reflect.deleteProperty(HTMLElement.prototype, "popover");
  });
  // Older browsers also lack the UA rule that hides a closed [popover] element.
  await page.addStyleTag({ content: "[popover] { display: block; }" });
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup();
  });
  const trigger = page.locator('[data-proof="trigger"]');
  await trigger.click();
  const content = page.locator('[data-proof="content"]');
  await expect(content).toBeVisible();
  await expect(page.locator("#first")).toBeFocused();
  await expect(page.locator("#outside")).toHaveAttribute("inert");
  await page.locator("#last").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#first")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(content).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("#outside")).not.toHaveAttribute("inert");
});

test("SDK native reset does not defeat consumer layered styles", async ({ page }) => {
  await page.setContent('<style>@layer utilities { [data-proof="content"] { padding: 13px; border: 3px solid red; background: rgb(12, 34, 56); } }</style>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ initialOpen: true });
  });
  const content = page.locator('[data-proof="content"]');
  await expect(content).toBeVisible();
  await expect(content).toHaveCSS("padding", "13px");
  await expect(content).toHaveCSS("border-top-width", "3px");
  await expect(content).toHaveCSS("background-color", "rgb(12, 34, 56)");
});

test("SDK owns exit presence while existing transition classes supply motion", async ({ page }) => {
  await page.setContent('<style>.proof-enter-active,.proof-leave-active { transition: opacity 300ms linear; }.proof-enter-from,.proof-leave-to { opacity: 0; }</style>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ transition: "proof" });
  });
  const content = page.locator('[data-proof="content"]');
  await page.locator('[data-proof="trigger"]').click();
  await expect(content).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(content).toHaveAttribute("data-ending-style");
  await expect(content).toBeVisible();
  await expect(content).toHaveCount(0);
});

test("public content focus props remain committed in Vue", async ({ page }) => {
  await page.setContent("");
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ focusLast: true });
  });
  await page.locator('[data-proof="trigger"]').click();
  await expect(page.locator("#last")).toBeFocused();
});

test("custom DOM IDs do not override explicit SDK finalFocus policy", async ({ page }) => {
  await page.setContent("");
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountVuePopup({ restoreFocus: false });
  });
  const trigger = page.locator('[data-proof="trigger"]');
  await trigger.click();
  await expect(page.locator("#first")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-proof="content"]')).toHaveCount(0);
  await expect(trigger).not.toBeFocused();
});

test("an open popup survives reactive Teleport reparenting", async ({ page }) => {
  await page.setContent("");
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    const popup = proof.mountVuePopup({ movable: true });
    document.addEventListener("proof-move", () => popup.move());
  });
  const content = page.locator('[data-proof="content"]');
  await page.locator('[data-proof="trigger"]').click();
  for (const portaled of [true, false]) {
    await page.evaluate(() => document.dispatchEvent(new Event("proof-move")));
    await expect.poll(() => content.evaluate(element => element.parentElement === document.body)).toBe(portaled);
    await expect(content).toBeVisible();
    expect(await content.evaluate(element => element.matches(":popover-open"))).toBe(true);
    await page.locator("#last").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#first")).toBeFocused();
  }
  await page.keyboard.press("Escape");
  await expect(content).toHaveCount(0);
  await expect(page.locator('[data-proof="trigger"]')).toBeFocused();
});

test("portaled child popup stays interactive inside SDK modal and closes one level at a time", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.mountNestedVuePopup();
  });
  const outer = page.locator('[data-proof="outer"]');
  const inner = page.locator('[data-proof="inner"]');
  await page.locator('[data-proof="outer-trigger"]').click();
  await page.locator('[data-proof="inner-trigger"]').click();
  await expect(page.locator("#nested-input")).toBeFocused();
  await page.locator("#nested-input").fill("Keep draft");
  await expect(inner).toBeVisible();
  expect(await inner.evaluate(element => element.parentElement === document.body)).toBe(true);
  expect(await inner.evaluate(element => element.closest("[inert]") === null)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(inner).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(page.locator('[data-proof="inner-trigger"]')).toBeFocused();
  await expect(page.locator("#outside")).toHaveAttribute("inert");
  await page.keyboard.press("Escape");
  await expect(outer).toHaveCount(0);
  await expect(page.locator('[data-proof="outer-trigger"]')).toBeFocused();
  await expect(page.locator("#outside")).not.toHaveAttribute("inert");
});

test("SDK persistent region stays usable without dismissing a modal", async ({ page }) => {
  await page.setContent('<button id="outside">Outside</button><section id="toast"><button id="toast-action">Undo</button></section>');
  await page.addScriptTag({ content: script });
  await page.evaluate(() => {
    const proof = (window as unknown as { AkazaPopupProof: typeof import("../migration/batch23-popup-fixture") }).AkazaPopupProof;
    proof.bindPersistentLayer(document.querySelector("#toast")!);
    document.querySelector("#toast-action")!.addEventListener("click", event => { (event.currentTarget as HTMLElement).textContent = "Undone"; });
    proof.mountVuePopup();
  });
  await page.locator('[data-proof="trigger"]').click();
  await expect(page.locator("#toast")).not.toHaveAttribute("inert");
  await page.locator("#toast-action").click();
  await expect(page.locator("#toast-action")).toHaveText("Undone");
  await expect(page.locator('[data-proof="content"]')).toBeVisible();
  await expect(page.locator("#outside")).toHaveAttribute("inert");
});
