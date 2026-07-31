import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Fieldset } from "@/components/fieldset";
import { Meter } from "@/components/meter";
import { Progress } from "@/components/progress";
import { Separator } from "@/components/separator";

describe("status and structural components", () => {
  it("clamps Meter values and exposes semantic state", () => {
    const wrapper = mount(Meter, {
      props: { value: 150, min: 0, max: 100, high: 80, label: "Capacity" },
    });
    const meter = wrapper.get("[role='meter']");

    expect(meter.attributes("aria-valuenow")).toBe("100");
    expect(meter.attributes("data-akaza-state")).toBe("high");
    expect(meter.attributes("style")).toContain("--akaza-meter-percentage: 100%");
    expect(meter.attributes("aria-labelledby")).toBe(wrapper.get(".akaza-meter-label").attributes("id"));
  });

  it("reports determinate and indeterminate Progress state", async () => {
    const wrapper = mount(Progress, { props: { modelValue: null, min: 10, max: 30, ariaLabel: "Loading" } });
    const progress = wrapper.get("[role='progressbar']");

    expect(progress.attributes("data-akaza-state")).toBe("indeterminate");
    expect(progress.attributes("aria-valuenow")).toBeUndefined();

    await wrapper.setProps({ modelValue: 20 });
    expect(progress.attributes("data-akaza-state")).toBe("loading");
    expect(progress.attributes("style")).toContain("--akaza-progress-percentage: 50%");

    await wrapper.setProps({ modelValue: 30 });
    expect(progress.attributes("data-akaza-state")).toBe("complete");
  });

  it("keeps Separator decorative semantics explicit", () => {
    const semantic = mount(Separator, { props: { orientation: "vertical" } });
    const decorative = mount(Separator, { props: { decorative: true } });

    expect(semantic.attributes("role")).toBe("separator");
    expect(semantic.attributes("aria-orientation")).toBe("vertical");
    expect(decorative.attributes("role")).toBe("none");
    expect(decorative.attributes("aria-orientation")).toBeUndefined();
  });

  it("uses native Fieldset grouping and granular state hooks", () => {
    const wrapper = mount(Fieldset, {
      props: { legend: "Billing", description: "Invoice details", disabled: true, invalid: true },
      slots: { default: "<input name='company'>" },
    });
    const fieldset = wrapper.get("fieldset");
    const description = wrapper.get(".akaza-fieldset-description");

    expect(fieldset.attributes()).toHaveProperty("disabled");
    expect(fieldset.attributes("aria-invalid")).toBe("true");
    expect(fieldset.attributes("aria-describedby")).toBe(description.attributes("id"));
    expect(fieldset.attributes("data-akaza-disabled")).toBe("true");
    expect(fieldset.attributes("data-akaza-invalid")).toBe("true");
  });
});
