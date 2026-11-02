<script setup lang="ts">
import type { TreeKey, TreeSelection } from "akaza-ui";
import { ref } from "vue";
import { Tree } from "../../ui/tree";

interface FileNode {
  id: string;
  label: string;
  kind: "file" | "folder";
  lazy?: boolean;
  children?: FileNode[];
}

const files: FileNode[] = [
  {
    id: "src",
    label: "src",
    kind: "folder",
    children: [
      {
        id: "components",
        label: "components",
        kind: "folder",
        children: [
          { id: "button", label: "Button.vue", kind: "file" },
          { id: "tree", label: "Tree.vue", kind: "file" },
        ],
      },
      { id: "main", label: "main.ts", kind: "file" },
    ],
  },
  { id: "package", label: "package.json", kind: "file" },
];

const selected = ref<TreeSelection>("tree");
const expanded = ref<TreeKey[]>(["src", "components"]);

function itemIcon(item: FileNode, expanded: boolean): string {
  if (item.kind === "folder") {
    if (item.id === "src")
      return expanded ? "i-vscode-icons-folder-type-src-opened" : "i-vscode-icons-folder-type-src";
    return expanded ? "i-vscode-icons-default-folder-opened" : "i-vscode-icons-default-folder";
  }
  if (item.label.endsWith(".vue")) return "i-vscode-icons-file-type-vue";
  if (item.label.endsWith(".ts")) return "i-vscode-icons-file-type-typescript-official";
  if (item.label === "package.json") return "i-vscode-icons-file-type-npm";
  return "i-vscode-icons-default-file";
}
</script>

<template>
  <div class="grid w-full max-w-md gap-3">
    <Tree
      v-model="selected"
      v-model:expanded="expanded"
      :items="files"
      item-key="id"
      aria-label="Project files"
    >
      <template #icon="{ item, node }">
        <Icon
          :name="itemIcon(item, node.isExpanded)"
          class="size-5"
        />
      </template>
    </Tree>
    <p class="text-xs text-muted-foreground">Selected: {{ selected ?? "none" }}</p>
  </div>
</template>
