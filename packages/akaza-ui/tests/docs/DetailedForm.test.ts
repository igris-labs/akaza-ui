import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Select } from "@/components/select";
import DetailedForm from "../../../../docs/app/components/examples/form/DetailedForm.vue";

describe("detailed form slug validation", () => {
  it("keeps the documented pattern valid and rejects invalid native values", () => {
    const wrapper = mount(DetailedForm);
    try {
      const input = wrapper.get<HTMLInputElement>('input[name="workspaceSlug"]').element;
      const pattern = input.getAttribute("pattern")!;
      expect(() => new RegExp(pattern, "v")).not.toThrow();
      const content = readFileSync(resolve(__dirname, "../../../../docs/content/3.components/input.md"), "utf8");
      expect(content).toContain(`pattern="${pattern}"`);
      input.value = "support-team";
      expect(input.validity.patternMismatch).toBe(false);
      for (const value of ["Bad_slug", "invalid slug!", "UPPERCASE"]) {
        input.value = value;
        expect(input.validity.patternMismatch).toBe(true);
      }
    } finally {
      wrapper.unmount();
    }
  });

  it("rejects invalid slugs on submit even without native pattern enforcement", async () => {
    const wrapper = mount(DetailedForm);
    try {
      await wrapper.get('input[name="ownerName"]').setValue("Reviewer");
      await wrapper.get('input[name="seats"]').setValue("5");
      wrapper.findComponent(Select).vm.$emit("update:modelValue", "startup");
      await wrapper.vm.$nextTick();
      const slug = wrapper.get<HTMLInputElement>('input[name="workspaceSlug"]');
      slug.element.removeAttribute("pattern");
      await slug.setValue("Bad_slug");
      await slug.trigger("blur");
      expect(wrapper.get('.akaza-field:has(input[name="workspaceSlug"])').attributes("data-akaza-invalid")).toBe("true");
      await wrapper.get("form").trigger("submit");
      expect(wrapper.get("form pre").text()).toBe("Server validation returned field errors.");
      expect(wrapper.text()).toContain("Use lowercase letters, numbers, and hyphens only.");

      await slug.setValue("support-team");
      await wrapper.get("form").trigger("submit");
      expect(JSON.parse(wrapper.get("form pre").text()).workspaceSlug).toBe("support-team");
    } finally {
      wrapper.unmount();
    }
  });
});
