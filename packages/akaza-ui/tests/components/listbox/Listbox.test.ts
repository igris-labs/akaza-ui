import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Listbox } from "@/components/listbox";

describe("listbox", () => {
  it("skips disabled options and selects with the keyboard", async () => {
    const wrapper = mount(defineComponent({
      components: { Listbox },
      setup() {
        const value = ref("");
        const options = [
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta", disabled: true },
          { value: "gamma", label: "Gamma" },
        ];
        return { options, value };
      },
      template: `<Listbox v-model="value" :options="options" aria-label="Framework" />`,
    }));
    const listbox = wrapper.find("[role='listbox']");

    await listbox.trigger("focusin");
    await listbox.trigger("keydown", { key: "ArrowDown" });
    expect(listbox.attributes("aria-activedescendant")).toContain("option-2");

    await listbox.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string }).value).toBe("gamma");
    expect(wrapper.findAll("[role='option']")[2]!.attributes("aria-selected")).toBe("true");
  });

  it("supports multiple range selection and select all", async () => {
    const wrapper = mount(defineComponent({
      components: { Listbox },
      setup() {
        const value = ref<string[]>(["alpha"]);
        const options = ["alpha", "beta", "gamma"].map((item) => ({ value: item, label: item }));
        return { options, value };
      },
      template: `<Listbox v-model="value" multiple :options="options" aria-label="Items" />`,
    }));
    const listbox = wrapper.find("[role='listbox']");

    await listbox.trigger("focusin");
    await listbox.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["alpha", "beta"]);

    await listbox.trigger("keydown", { key: "a", ctrlKey: true });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["alpha", "beta", "gamma"]);
  });

  it("filters object options and serializes selected form values", async () => {
    const wrapper = mount(defineComponent({
      components: { Listbox },
      setup() {
        const value = ref<Record<string, unknown>[]>([{ id: 2, label: "Beta" }]);
        const search = ref("");
        const options = [
          { value: { id: 1, label: "Alpha" }, label: "Alpha" },
          { value: { id: 2, label: "Beta" }, label: "Beta" },
        ];
        const serialize = (item: Record<string, unknown>) => String(item.id);
        return { options, search, serialize, value };
      },
      template: `
        <form>
          <Listbox
            v-model="value"
            v-model:search="search"
            multiple
            filterable
            by="id"
            name="framework"
            :options="options"
            :serialize-value="serialize"
            aria-label="Framework"
          />
        </form>
      `,
    }));

    expect(wrapper.findAll("[role='option']")[1]!.attributes("aria-selected")).toBe("true");
    await wrapper.find(".akaza-listbox-filter").setValue("alp");
    expect(wrapper.findAll("[role='option']")).toHaveLength(1);

    const data = new FormData(wrapper.find("form").element as HTMLFormElement);
    expect(data.getAll("framework")).toEqual(["2"]);
  });

  it("renders a bounded virtual window", async () => {
    const options = Array.from({ length: 100 }, (_, index) => ({ value: index, label: `Item ${index}` }));
    const wrapper = mount(Listbox, {
      props: { options, virtualize: true, virtualHeight: 80, virtualItemHeight: 20, ariaLabel: "Items" },
    });
    await nextTick();

    const rendered = wrapper.findAll("[role='option']");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(options.length);
    expect(wrapper.find("[role='listbox']").attributes("style")).toContain("80px");
  });

  it("autofocuses the filter when filtering is enabled", async () => {
    const wrapper = mount(Listbox, {
      attachTo: document.body,
      props: {
        autoFocus: true,
        filterable: true,
        options: [{ value: "alpha", label: "Alpha" }],
        ariaLabel: "Items",
      },
    });
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get(".akaza-listbox-filter").element);
    wrapper.unmount();
  });

  it("supports required validation and cancelable changes", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Listbox, {
      props: {
        modelValue: "",
        options: [{ value: "alpha", label: "Alpha" }],
        required: true,
        ariaLabel: "Items",
        onValueChange,
      },
    });

    await wrapper.find(".akaza-listbox-hidden-input").trigger("invalid");
    expect(wrapper.find(".akaza-listbox").attributes("data-akaza-invalid")).toBe("true");

    await wrapper.find("[role='option']").trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe("");
  });

  it("exposes pointer entry/leave and clears pointer highlight", async () => {
    const onEntryFocus = vi.fn();
    const onLeave = vi.fn();
    const wrapper = mount(Listbox, {
      props: {
        options: [{ value: "alpha", label: "Alpha" }],
        ariaLabel: "Items",
        onEntryFocus,
        onLeave,
      },
    });
    const content = wrapper.get("[role='listbox']");

    await content.trigger("focusin");
    expect(onEntryFocus).toHaveBeenCalledOnce();
    expect(content.attributes("aria-activedescendant")).toContain("option-0");

    await content.trigger("pointerleave");
    expect(onLeave).toHaveBeenCalledOnce();
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
  });
});
