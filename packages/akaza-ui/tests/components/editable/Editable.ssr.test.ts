// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Editable } from "@/components/editable";

describe("editable SDK server rendering", () => {
  it("seeds independent preview/edit sessions without browser globals", async () => {
    expect(typeof document).toBe("undefined");
    expect(typeof HTMLElement).toBe("undefined");
    const render = () => renderToString(createSSRApp({ render: () => h("form", [
      h(Editable, { modelValue: "Preview", name: "preview", ariaLabel: "Preview title" }),
      h(Editable, { modelValue: "Draft", name: "draft", startWithEditMode: true, multiline: true, selectOnFocus: true, ariaLabel: "Draft title" }),
      h(Editable, { modelValue: null, name: "empty", startWithEditMode: true, disabled: true }),
    ]) }));
    const html = await render();
    expect(html).toBe(await render());
    expect(html.match(/class="akaza-editable-preview"/g)).toHaveLength(1);
    expect(html.match(/class="akaza-editable-input"/g)).toHaveLength(2);
    expect(html).toContain('name="preview" value="Preview"');
    expect(html).toContain('name="draft" value="Draft"');
    expect(html).toContain('name="empty" value=""');
    expect(html).toContain("<textarea");
    expect(html).not.toContain("data-slot");
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(3);
  });
});
