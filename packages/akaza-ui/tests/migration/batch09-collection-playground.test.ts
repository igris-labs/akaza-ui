import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import CheckboxGroupSection from "../../../../playground/src/sections/checkbox-group/CheckboxGroupSection.vue";
import ComboboxSection from "../../../../playground/src/sections/combobox/ComboboxSection.vue";
import ListboxSection from "../../../../playground/src/sections/listbox/ListboxSection.vue";
import SelectSection from "../../../../playground/src/sections/select/SelectSection.vue";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => mounted.splice(0).forEach(wrapper => wrapper.unmount()));

it("batch 09 playground Listbox distinguishes typed values and resets native form state", async () => {
  const wrapper = mount(ListboxSection, { attachTo: document.body });
  mounted.push(wrapper);
  const list = wrapper.get('[role="listbox"][aria-label="Typed selections"]');
  const form = list.element.closest("form")!;
  await list.findAll('[role="option"]')[1]!.trigger("click");
  expect(form.querySelector("code")!.textContent).toContain('[1,"1"]');
  form.reset();
  await flushPromises();
  expect(form.querySelector("code")!.textContent).toContain("[1]");
  expect(new FormData(form).getAll("typed")).toEqual(["1"]);
});

it("batch 09 playground CheckboxGroup cancels parent clear and retains disabled selection", async () => {
  const wrapper = mount(CheckboxGroupSection);
  mounted.push(wrapper);
  const group = wrapper.get('[role="group"][aria-label="Required email channel"]');
  const parent = group.get(".akaza-checkbox-group-parent button");
  await parent.trigger("click");
  expect(parent.attributes("aria-checked")).toBe("true");
  await parent.trigger("click");
  expect(parent.attributes("aria-checked")).toBe("true");
  expect(group.findAll(".akaza-checkbox-group-item").at(-1)!.attributes("data-akaza-state")).toBe("checked");
});

it("batch 09 playground Select submits multiple values after selection rerenders", async () => {
  const wrapper = mount(SelectSection, { attachTo: document.body });
  mounted.push(wrapper);
  const trigger = wrapper.get('[role="combobox"][aria-label="Permissions"]');
  const form = trigger.element.closest("form")!;
  await trigger.trigger("click");
  const option = wrapper.findAll('.akaza-select-option').find(option => option.text().includes("Write"))!;
  await option.trigger("click");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await flushPromises();
  expect(new FormData(form).getAll("permissions")).toEqual(["read", "write", "deploy"]);
  expect(form.textContent).toContain("Submitted permissions: read, write, deploy");
});

it("batch 09 playground Combobox matches recreated object values and adds another object", async () => {
  const wrapper = mount(ComboboxSection);
  mounted.push(wrapper);
  const input = wrapper.get('[role="combobox"][aria-label="Assignees"]');
  await input.trigger("keydown", { key: "ArrowDown" });
  const root = input.element.closest(".akaza-combobox")!;
  expect(root.querySelector('[role="option"]')!.getAttribute("aria-selected")).toBe("true");
  root.querySelectorAll<HTMLElement>('[role="option"]')[1]!.click();
  await flushPromises();
  expect([...root.querySelectorAll<HTMLInputElement>('input[name="assignees"]')].map(input => input.value)).toEqual(["1", "2"]);
});
