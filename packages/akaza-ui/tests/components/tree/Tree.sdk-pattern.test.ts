import { checkPattern } from "@ui-sdk/core/testing";
import { afterEach, describe, expect, it } from "vitest";

const fixtures: HTMLElement[] = [];
afterEach(() => fixtures.splice(0).forEach(element => element.remove()));

// Independent APG-style nested DOM isolates checker policy from Akaza's flat renderer.
function referenceTree(button: boolean, expandedChild: boolean) {
  const tree = document.createElement("div");
  tree.setAttribute("role", "tree");
  tree.setAttribute("aria-label", "Reference files");
  tree.innerHTML = `
    <div id="reference-source" role="treeitem" tabindex="0" aria-labelledby="reference-source-label" aria-selected="false" aria-expanded="true">
      ${button ? '<button type="button" tabindex="-1" aria-label="Collapse Source">Toggle</button>' : ""}
      <span id="reference-source-label">Source</span>
      <div role="group">
        <div id="reference-components" role="treeitem" tabindex="-1" aria-labelledby="reference-components-label" aria-selected="false" ${expandedChild ? 'aria-expanded="true"' : ""}>
          <span id="reference-components-label">Components</span>
          ${expandedChild ? '<div role="group"><div id="reference-button" role="treeitem" tabindex="-1" aria-selected="false">Button.vue</div></div>' : ""}
        </div>
      </div>
    </div>
    <div id="reference-package" role="treeitem" tabindex="-1" aria-selected="false">Package.json</div>`;
  document.body.append(tree);
  fixtures.push(tree);
  const visible = () => [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(item => !item.closest("[hidden]"));
  tree.addEventListener("focusin", (event) => {
    visible().forEach(item => { item.tabIndex = item === event.target ? 0 : -1; });
  });
  tree.addEventListener("keydown", (event) => {
    const item = event.target as HTMLElement;
    if (item.getAttribute("role") !== "treeitem") return;
    const rows = visible();
    const index = rows.indexOf(item);
    const group = item.querySelector<HTMLElement>(':scope > [role="group"]');
    const open = item.getAttribute("aria-expanded") === "true";
    let target: HTMLElement | undefined | null;
    if (event.key === "ArrowDown") target = rows[index + 1];
    else if (event.key === "ArrowUp") target = rows[index - 1];
    else if (event.key === "Home") target = rows[0];
    else if (event.key === "End") target = rows.at(-1);
    else if (event.key === "ArrowRight" && group) {
      if (open) target = group.querySelector<HTMLElement>('[role="treeitem"]');
      else { item.setAttribute("aria-expanded", "true"); group.hidden = false; }
    } else if (event.key === "ArrowLeft") {
      if (open && group) { item.setAttribute("aria-expanded", "false"); group.hidden = true; }
      else target = item.parentElement?.closest<HTMLElement>('[role="treeitem"]');
    } else if (event.key === " " || event.key === "Enter") {
      rows.forEach(row => row.setAttribute("aria-selected", String(row === item)));
    } else if (event.key.length === 1) {
      target = [...rows.slice(index + 1), ...rows.slice(0, index + 1)].find((row) => {
        const label = row.getAttribute("aria-labelledby");
        return (label ? document.getElementById(label)?.textContent : row.textContent)?.toLowerCase().startsWith(event.key.toLowerCase());
      });
    }
    event.preventDefault();
    target?.focus();
  });
  return tree;
}

describe("beta.17 public tree checker probes", () => {
  it("accepts nested groups without a button or an expanded second branch", async () => {
    await checkPattern(referenceTree(false, false), "tree");
  });

  it("rejects a named non-tabbable button inside a treeitem, not a direct tree child", async () => {
    const tree = referenceTree(true, false);
    const button = tree.querySelector("button")!;
    expect(button.closest('[role="treeitem"]')?.id).toBe("reference-source");
    expect(button.tabIndex).toBe(-1);
    // Required owned roles constrain the tree's items, not every descendant of each item.
    await expect(checkPattern(tree, "tree")).rejects.toThrow(new Error([
      "checkPattern found 1 problem with the tree pattern:",
      '- button "Toggle": is a button inside a tree, which owns only treeitem elements (APG tree view).',
    ].join("\n")));
  });

  it("expects parent focus on an open child even though APG requires collapse first", async () => {
    const tree = referenceTree(false, true);
    const child = tree.querySelector<HTMLElement>("#reference-components")!;
    child.focus();
    child.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(child.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(child);
    child.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(document.activeElement?.id).toBe("reference-source");
    child.setAttribute("aria-expanded", "true");
    child.querySelector<HTMLElement>('[role="group"]')!.hidden = false;
    await expect(checkPattern(tree, "tree")).rejects.toThrow(new Error([
      "checkPattern found 1 problem with the tree pattern:",
      "- div#reference-components[role=treeitem]: ArrowLeft on a child should move focus to its parent, div#reference-source[role=treeitem] (APG tree view).",
    ].join("\n")));
  });
});
