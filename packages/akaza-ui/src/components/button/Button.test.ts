import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { Button } from ".";

describe("button", () => {
  it("uses the @click promise for loadingAuto", async () => {
    let resolve!: () => void;
    let calls = 0;

    const wrapper = mount(defineComponent({
      components: { Button },
      setup() {
        function save() {
          calls += 1;
          return new Promise<void>((done) => {
            resolve = done;
          });
        }
        return { save };
      },
      template: `<Button loading-auto @click="save">Save</Button>`,
    }));

    const click = wrapper.find("button").trigger("click");
    await nextTick();

    expect(calls).toBe(1);
    expect(wrapper.find("button").attributes("data-akaza-state")).toBe("loading");

    resolve();
    await click;
    await flushPromises();
    await nextTick();

    expect(wrapper.find("button").attributes("data-akaza-state")).toBe("enabled");
  });

  it("forwards click and other native events", async () => {
    let clicks = 0;
    let focused = false;
    let entered = false;

    const wrapper = mount(defineComponent({
      components: { Button },
      setup() {
        return {
          onClick: () => {
            clicks += 1;
          },
          onFocus: () => {
            focused = true;
          },
          onMouseenter: () => {
            entered = true;
          },
        };
      },
      template: `
        <Button
          @click="onClick"
          @focus="onFocus"
          @mouseenter="onMouseenter"
        >
          Save
        </Button>
      `,
    }));

    const button = wrapper.find("button");
    await button.trigger("click");
    await button.trigger("focus");
    await button.trigger("mouseenter");

    expect(clicks).toBe(1);
    expect(focused).toBe(true);
    expect(entered).toBe(true);
  });
});
