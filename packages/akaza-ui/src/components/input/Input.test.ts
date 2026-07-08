import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Input } from ".";

describe("input", () => {
  it("does not expose native invalid state before interaction", async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: "",
        required: true,
      },
    });

    const input = wrapper.find("input");

    expect(input.attributes("data-akaza-invalid")).toBeUndefined();

    await input.trigger("blur");

    expect(input.attributes("data-akaza-invalid")).toBe("true");
  });
});
