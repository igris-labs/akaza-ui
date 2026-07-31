import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { Pagination } from "@/components/pagination";

describe("pagination", () => {
  it("renders edge pages, ellipses, and updates the current page", async () => {
    const wrapper = mount(defineComponent({
      components: { Pagination },
      setup() {
        const page = ref(10);
        return { page };
      },
      template: `<Pagination v-model="page" :total="200" :items-per-page="10" :sibling-count="1" show-edges />`,
    }));

    expect(wrapper.findAll(".akaza-pagination-ellipsis")).toHaveLength(2);
    expect(wrapper.get("[aria-current='page']").text()).toBe("10");

    await wrapper.get(".akaza-pagination-next").trigger("click");
    expect((wrapper.vm as unknown as { page: number }).page).toBe(11);
  });

  it("disables boundary controls and supports first/last controls", async () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, total: 30, itemsPerPage: 10, showFirstLast: true },
    });

    expect(wrapper.get(".akaza-pagination-first").attributes()).toHaveProperty("disabled");
    expect(wrapper.get(".akaza-pagination-previous").attributes()).toHaveProperty("disabled");

    await wrapper.get(".akaza-pagination-last").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
  });

  it("renders anchors when a page href resolver is provided", () => {
    const wrapper = mount(Pagination, {
      props: {
        modelValue: 2,
        total: 40,
        itemsPerPage: 10,
        getPageHref: (page: number) => `/reports?page=${page}`,
      },
    });

    const page = wrapper.get(".akaza-pagination-page[data-akaza-page='3']");
    expect(page.element.tagName).toBe("A");
    expect(page.attributes("href")).toBe("/reports?page=3");
  });

  it("removes disabled links from interaction and tab order", async () => {
    const wrapper = mount(Pagination, {
      props: {
        modelValue: 1,
        total: 40,
        disabled: true,
        getPageHref: (page: number) => `/reports?page=${page}`,
      },
    });
    const page = wrapper.get(".akaza-pagination-page[data-akaza-page='2']");

    expect(page.attributes("tabindex")).toBe("-1");
    const event = new MouseEvent("click", { cancelable: true });
    page.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("clamps page state and allows changes to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Pagination, {
      props: { modelValue: 99, total: 30, itemsPerPage: 10, onValueChange },
    });

    expect(wrapper.get("[aria-current='page']").text()).toBe("3");
    await wrapper.get(".akaza-pagination-previous").trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe(99);
  });
});
