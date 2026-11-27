import { createTreeCollection, toggleTreeChecked, treeCheckedStates } from "@ui-sdk/core";
import { describe, expect, it } from "vitest";

describe("batch 10 public tree helper compatibility", () => {
  const tree = createTreeCollection([
    { key: "root", parent: null },
    { key: "locked", parent: "root" },
    { key: "nested", parent: "locked" },
    { key: "leaf", parent: "root" },
    { key: "lazy", parent: null, branch: true },
  ]);

  it("keeps explicit independent keys, including unknown keys, without cascading", () => {
    expect(toggleTreeChecked(tree, ["unknown", "root"], "leaf", { strategy: "independent" }))
      .toEqual(["unknown", "root", "leaf"]);
    expect(toggleTreeChecked(tree, ["unknown", "root"], "root", { strategy: "independent" }))
      .toEqual(["unknown"]);
    expect(treeCheckedStates(tree, ["root"], "independent")("leaf")).toBe(false);
  });

  it("exposes the cascading semantic gaps that prevent replacing Akaza propagation", () => {
    expect(treeCheckedStates(tree, ["root"], "branch")("leaf")).toBe(true);
    expect(toggleTreeChecked(tree, [], "root", {
      strategy: "branch",
      checkable: key => key !== "locked",
    })).not.toContain("nested");
  });

  it("exposes ordered hierarchy and lazy branches without DOM bindings", () => {
    expect(tree.visible(["root", "locked"])).toEqual(["root", "locked", "nested", "leaf", "lazy"]);
    expect(tree.ancestors("nested")).toEqual(["root", "locked"]);
    expect(tree.descendants("root")).toEqual(["locked", "nested", "leaf"]);
    expect(tree.position("leaf")).toEqual({ index: 2, size: 2 });
    expect(tree.level("nested")).toBe(3);
    expect(tree.isBranch("lazy")).toBe(true);
  });
});
