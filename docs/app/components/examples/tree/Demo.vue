<script setup lang="ts">
import type { TreeKey, TreeSelection } from "akaza-ui";
import { Tree } from "akaza-ui";
import { ref } from "vue";

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

const ui = {
  root: "w-full",
  viewport:
    "rounded-lg border border-neutral-300 bg-white p-1 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
  item: "outline-none focus-visible:[&_.akaza-tree-selection]:ring-1 focus-visible:[&_.akaza-tree-selection]:ring-inset focus-visible:[&_.akaza-tree-selection]:ring-neutral-500 data-[akaza-disabled]:opacity-40",
  row: "min-h-9 cursor-pointer",
  content: "min-h-9 gap-1 rounded-md px-3 max-sm:min-h-11",
  selection:
    "rounded-md transition-colors hover:bg-neutral-100 data-[akaza-selected]:bg-neutral-100 dark:hover:bg-neutral-900 dark:data-[akaza-selected]:bg-neutral-800",
  toggle:
    "grid size-7 shrink-0 place-items-center rounded text-neutral-500 outline-none hover:bg-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-900 max-sm:size-11 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-100",
  leafSpacer: "me-1",
  toggleIcon: "text-lg leading-none",
  icon: "grid size-5 shrink-0 place-items-center text-sm text-neutral-500",
  text: "min-w-0 flex-1",
  label: "truncate text-sm font-medium",
  loading:
    "py-2 pr-2 text-xs text-neutral-500 [padding-inline-start:calc(var(--akaza-tree-indent-offset)_+_2rem)] dark:text-neutral-400",
  empty: "px-3 py-8 text-center text-sm text-neutral-500",
};

</script>

<template>
  <div class="grid w-full max-w-md gap-3">
    <Tree
      v-model="selected"
      v-model:expanded="expanded"
      :items="files"
      item-key="id"
      aria-label="Project files"
      :ui="ui"
    >
      <template #icon="{ item, node }">
        <UIcon :name="itemIcon(item, node.isExpanded)" class="size-5" />
      </template>
    </Tree>
    <p class="text-xs text-neutral-600 dark:text-neutral-400">
      Selected: {{ selected ?? "none" }}
    </p>
  </div>
</template>
