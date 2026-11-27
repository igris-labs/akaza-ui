import { createFocusRecovery, createSelection, createTreeCollection, definePrimitive, toggleTreeChecked, treeCheckedStates } from "@ui-sdk/core";
import { describe, expect, it } from "vitest";

describe("batch 24a public SDK Tree contracts", () => {
  const tree = createTreeCollection([
    { key: "root", parent: null },
    { key: "branch", parent: "root" },
    { key: "deep", parent: "branch" },
    { key: "leaf", parent: "root" },
    { key: "lazy", parent: null, branch: true },
  ]);

  it.each(["leaf", "trunk", "branch"] as const)("%s checks infer descendants from explicit branch values", (strategy) => {
    const states = treeCheckedStates(tree, ["branch"], strategy);
    expect(states("deep")).toBe(true);
    expect(states("root")).toBe("indeterminate");
    expect(treeCheckedStates(tree, ["deep", "leaf"], strategy)("root")).toBe(true);
    expect(toggleTreeChecked(tree, ["unknown"], "root", {
      strategy, checkable: key => key !== "branch",
    })).not.toContain("deep");
  });

  it("independent checks preserve explicit and unknown keys, but have no mixed state", () => {
    const states = treeCheckedStates(tree, ["branch"], "independent");
    expect(states("root")).toBe(false);
    expect(states("deep")).toBe(false);
    expect(toggleTreeChecked(tree, ["unknown", "lazy"], "deep", { strategy: "independent" }))
      .toEqual(["unknown", "lazy", "deep"]);
  });

  it("selection supplies filtered replacement ranges without committing its own value", () => {
    const proposals: string[][] = [];
    const primitive = definePrimitive({
      name: "akaza-tree-range-probe",
      state: () => ({ value: ["unknown"] }),
      api: context => ({
        selection: createSelection(context, {
          key: "value", multiple: () => true,
          order: () => ["a", "disabled", "b", "c"],
          selectable: key => key !== "disabled",
          set: (value) => { proposals.push(value); return false; },
        }),
      }),
      slots: () => ({}),
    });
    const instance = primitive({ id: "tree-range-probe" });
    try {
      instance.api.selection.setAnchor("c");
      instance.api.selection.extend("a", { reason: "range", additive: false });
      instance.api.selection.extend("b", { reason: "range", additive: false });
      expect(proposals).toEqual([["a", "b", "c"], ["b", "c"]]);
      expect(instance.api.selection.isSelected("unknown")).toBe(true);
      expect(instance.api.selection.isSelected("a")).toBe(false);
    } finally {
      instance.destroy();
    }
  });

  it("focus recovery waits for removal and does not steal focus from another control", async () => {
    const root = document.createElement("div");
    root.innerHTML = '<div tabindex="0">Lost</div><button>Fallback</button><input aria-label="Outside">';
    document.body.append(root);
    const lost = root.children[0] as HTMLElement;
    const fallback = root.children[1] as HTMLElement;
    const outside = root.children[2] as HTMLElement;
    const recovery = createFocusRecovery({ fallback: () => fallback });
    let unbind = recovery.bind(lost, { key: "lost", props: {} });
    try {
      lost.focus();
      lost.remove();
      unbind();
      await Promise.resolve();
      expect(document.activeElement).toBe(fallback);
      root.prepend(lost);
      unbind = recovery.bind(lost, { key: "lost", props: {} });
      lost.focus();
      lost.remove();
      unbind();
      outside.focus();
      await Promise.resolve();
      expect(document.activeElement).toBe(outside);
    } finally {
      unbind();
      root.remove();
    }
  });
});
