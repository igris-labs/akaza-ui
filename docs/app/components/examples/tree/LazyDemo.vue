<script setup lang="ts">
import type { TreeExpandedChangeEventDetails, TreeKey } from "akaza-ui";
import { Tree } from "akaza-ui";
import { ref } from "vue";

interface FileNode {
  id: string;
  label: string;
  kind: "file" | "folder";
  lazy?: boolean;
  children?: FileNode[];
}

const items = ref<FileNode[]>([
  { id: "services", label: "Remote services", kind: "folder", lazy: true },
]);
const expanded = ref<TreeKey[]>([]);
const loadingKeys = ref<TreeKey[]>([]);

const ui = {
  root: "w-full",
  viewport:
    "rounded-lg border border-neutral-300 bg-white p-1 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
  item: "outline-none focus-visible:[&_.akaza-tree-selection]:ring-1 focus-visible:[&_.akaza-tree-selection]:ring-inset focus-visible:[&_.akaza-tree-selection]:ring-neutral-500",
  row: "min-h-9 cursor-pointer",
  content: "min-h-9 gap-1 rounded-md px-3 max-sm:min-h-11",
  selection:
    "rounded-md transition-colors hover:bg-neutral-100 data-[akaza-selected]:bg-neutral-100 dark:hover:bg-neutral-900 dark:data-[akaza-selected]:bg-neutral-800",
  toggle:
    "grid size-7 shrink-0 place-items-center rounded text-neutral-500 outline-none hover:bg-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-900 max-sm:size-11 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-100",
  leafSpacer: "me-1",
  icon: "grid size-5 shrink-0 place-items-center text-sm text-neutral-500",
  text: "min-w-0 flex-1",
  label: "truncate text-sm font-medium",
  loading:
    "py-2 pr-2 text-xs text-neutral-500 [padding-inline-start:calc(var(--akaza-tree-indent-offset)_+_2rem)] dark:text-neutral-400",
};

function itemIcon(item: FileNode, isExpanded: boolean): string {
  if (item.kind === "folder")
    return isExpanded ? "i-vscode-icons-default-folder-opened" : "i-vscode-icons-default-folder";
  return "i-vscode-icons-file-type-rest";
}

async function loadChildren(_keys: TreeKey[], details: TreeExpandedChangeEventDetails<FileNode>) {
  if (!details.expanded || !details.item.lazy || details.item.children?.length)
    return;

  loadingKeys.value = [...loadingKeys.value, details.key];
  await new Promise(resolve => window.setTimeout(resolve, 600));
  items.value = items.value.map(item => item.id === details.key
    ? {
        ...item,
        children: [
          { id: "users", label: "Users API", kind: "file" },
          { id: "billing", label: "Billing API", kind: "file" },
        ],
      }
    : item);
  loadingKeys.value = loadingKeys.value.filter(key => key !== details.key);
}
</script>

<template>
  <div class="w-full max-w-md">
    <Tree
      v-model:expanded="expanded"
      :items="items"
      item-key="id"
      :has-children="item => item.kind === 'folder'"
      :loading-keys="loadingKeys"
      aria-label="Remote services"
      :ui="ui"
      @expanded-change="loadChildren"
    >
      <template #icon="{ item, node }">
        <UIcon :name="itemIcon(item, node.isExpanded)" class="size-5" />
      </template>
    </Tree>
  </div>
</template>
