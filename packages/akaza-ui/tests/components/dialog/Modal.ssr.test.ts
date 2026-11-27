// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { AlertDialog } from "@/components/alert-dialog";
import { Dialog } from "@/components/dialog";
import { Drawer } from "@/components/drawer";

describe.each([
  ["Dialog", Dialog, "dialog"], ["AlertDialog", AlertDialog, "alertdialog"], ["Drawer", Drawer, "dialog"],
] as const)("%s SSR", (_name, component, role) => {
  it.each([false, true])("renders accepted open=%s without browser globals", async (open) => {
    const html = await renderToString(createSSRApp({
      render: () => h(component, { modelValue: open, teleport: false, title: "Issue", description: "Details" }, {
        body: () => h("button", "Action"),
      }),
    }));
    expect(html.includes(`role="${role}"`)).toBe(open);
    expect(html.includes("data-akaza-state=\"open\"")).toBe(open);
    if (open) {
      expect(html).toContain("aria-modal=\"true\"");
      expect(html).toContain("aria-labelledby=");
      expect(html).toContain("aria-describedby=");
      expect(html).toContain("Issue");
    }
  });
});

it("renders a nonmodal Drawer without modal ARIA or a backdrop", async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Drawer, { modelValue: true, modal: false, teleport: false, ariaLabel: "Preview" }),
  }));
  expect(html).toContain("role=\"dialog\"");
  expect(html).toContain("aria-label=\"Preview\"");
  expect(html).not.toContain("aria-modal");
  expect(html).not.toContain("akaza-drawer-overlay");
});
