<script setup lang="ts">
import type { TreeExpandedChangeEventDetails, TreeKey } from "akaza-ui";
import { ref } from "vue";
import { Tree } from "../../ui/tree";

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

function itemIcon(item: FileNode, isExpanded: boolean): string {
  if (item.kind === "folder")
    return isExpanded ? "i-vscode-icons-default-folder-opened" : "i-vscode-icons-default-folder";
  return "i-vscode-icons-file-type-rest";
}

async function loadChildren(_keys: TreeKey[], details: TreeExpandedChangeEventDetails<FileNode>) {
  if (!details.expanded || !details.item.lazy || details.item.children?.length) return;

  loadingKeys.value = [...loadingKeys.value, details.key];
  await new Promise((resolve) => window.setTimeout(resolve, 600));
  items.value = items.value.map((item) =>
    item.id === details.key
      ? {
          ...item,
          children: [
            { id: "users", label: "Users API", kind: "file" },
            { id: "billing", label: "Billing API", kind: "file" },
          ],
        }
      : item,
  );
  loadingKeys.value = loadingKeys.value.filter((key) => key !== details.key);
}
</script>

<template>
  <div class="w-full max-w-md">
    <Tree
      v-model:expanded="expanded"
      :items="items"
      item-key="id"
      :has-children="(item) => item.kind === 'folder'"
      :loading-keys="loadingKeys"
      aria-label="Remote services"
      @expanded-change="loadChildren"
    >
      <template #icon="{ item, node }">
        <Icon
          :name="itemIcon(item, node.isExpanded)"
          class="size-5"
        />
      </template>
    </Tree>
  </div>
</template>
