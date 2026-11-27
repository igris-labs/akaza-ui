// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Editable } from "@/components/editable";
import { PinInput } from "@/components/pin-input";
import { TagsInput } from "@/components/tags-input";

it("batch 17 renders independent deterministic editors and tokens without DOM globals", async () => {
  const render = () => renderToString(createSSRApp({
    render: () => h("form", [
      h(Editable, { modelValue: "Preview", name: "preview" }),
      h(Editable, { modelValue: "Draft", name: "draft", startWithEditMode: true, selectOnFocus: true }),
      h(TagsInput, { modelValue: ["Vue", "Nuxt"], name: "tags" }),
      h(PinInput, { modelValue: "12", name: "code", otp: true, mask: true, length: 4 }),
    ]),
  }));
  const html = await render();
  expect(html).toContain('name="preview" value="Preview"');
  expect(html).toContain('data-akaza-state="editing"');
  expect(html).toContain('name="tags" value="Vue"');
  expect(html).toContain('name="code" value="12"');
  expect(html).toContain('autocomplete="one-time-code"');
  expect(html).not.toContain("data-slot");
  expect(await render()).toBe(html);
});
