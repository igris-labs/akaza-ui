<script setup lang="ts">
import type {
  AkazaChangeEventDetails,
  TreeExpandedChangeEventDetails,
  TreeKey,
  TreeSelection,
  TreeSelectionHighlight,
} from "akaza-ui";
import { ref } from "vue";
import { Tree } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  eventEntry,
  exampleStack,
  exampleTitle,
  sectionDescription,
  sectionTitle,
  treeUi,
} from "../styles";

interface FileNode {
  id: string;
  label: string;
  kind: "file" | "folder";
  disabled?: boolean;
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
  { id: "lock", label: "pnpm-lock.yaml", kind: "file", disabled: true },
];
const selected = ref<TreeSelection>("tree");
const expanded = ref<TreeKey[]>(["src", "components"]);
const lastEvent = ref("No activation yet.");

const permissions = [
  {
    id: "workspace",
    label: "Workspace permissions",
    kind: "folder" as const,
    children: [
      { id: "read", label: "Read records", kind: "file" as const },
      { id: "write", label: "Edit records", kind: "file" as const },
      { id: "deploy", label: "Deploy releases", kind: "file" as const },
    ],
  },
];
const selectedPermissions = ref<TreeKey[]>(["read"]);

const highlightItems = [{
  id: "components",
  label: "components",
  kind: "folder" as const,
  children: [
    { id: "card", label: "Card.vue", kind: "file" as const },
    { id: "button", label: "Button.vue", kind: "file" as const },
  ],
}];
const highlightModes: { id: TreeSelectionHighlight; label: string; description: string }[] = [
  { id: "full", label: "Full row", description: "Highlight spans the tree width." },
  { id: "indented", label: "Indented row", description: "Highlight starts at the node depth." },
  { id: "label", label: "Label only", description: "Highlight follows the label content." },
];
const highlightSelections = ref<Record<TreeSelectionHighlight, TreeSelection>>({
  full: "card",
  indented: "card",
  label: "card",
});

const remoteItems = ref<FileNode[]>([
  { id: "services", label: "Remote services", kind: "folder", lazy: true },
]);
const remoteExpanded = ref<TreeKey[]>([]);
const loadingKeys = ref<TreeKey[]>([]);

const virtualItems = Array.from({ length: 1000 }, (_, index) => ({
  id: `result-${index + 1}`,
  label: `Result ${index + 1}`,
  kind: "file" as const,
}));
const virtualSelection = ref<TreeSelection>("result-1");

function nodeIcon(kind: FileNode["kind"], expandedState: boolean): string {
  if (kind === "file") return "file";
  return expandedState ? "folder-open" : "folder";
}

function logActivation(item: FileNode, details: AkazaChangeEventDetails) {
  lastEvent.value = `activate: ${item.id}, reason: ${details.reason}`;
}

async function loadChildren(_value: TreeKey[], details: TreeExpandedChangeEventDetails<FileNode>) {
  if (!details.expanded || !details.item.lazy || details.item.children?.length || loadingKeys.value.includes(details.key)) return;
  loadingKeys.value = [...loadingKeys.value, details.key];
  await new Promise(resolve => window.setTimeout(resolve, 700));
  remoteItems.value = remoteItems.value.map(item => item.id === details.key
    ? {
        ...item,
        children: [
          { id: "users-api", label: "Users API", kind: "file" },
          { id: "billing-api", label: "Billing API", kind: "file" },
        ],
      }
    : item);
  loadingKeys.value = loadingKeys.value.filter(key => key !== details.key);
}
</script>

<template>
  <section id="tree">
    <h2 :class="sectionTitle">Tree</h2>
    <p :class="sectionDescription">
      Hierarchical selection with lazy loading, selection propagation, typeahead, and virtualization.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Preloaded files + icons</h3>
        <div :class="canvasCol">
          <Tree
            v-model="selected"
            v-model:expanded="expanded"
            :items="files"
            item-key="id"
            aria-label="Project files"
            :ui="treeUi"
            @activate="logActivation"
          >
            <template #icon="{ item, node }">
              <svg
                v-if="nodeIcon(item.kind, node.isExpanded) === 'file'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path d="M6 2h8l4 4v16H6z" />
                <path d="M14 2v5h5" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path :d="node.isExpanded ? 'M3 8h18l-2 11H5z M3 8V5h7l2 3' : 'M3 5h7l2 3h9v11H3z'" />
              </svg>
            </template>
          </Tree>
          <code :class="codePill">selected: {{ selected ?? "none" }}</code>
          <p :class="eventEntry">{{ lastEvent }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Propagated multiple selection</h3>
        <div :class="canvasCol">
          <Tree
            v-model="selectedPermissions"
            :items="permissions"
            item-key="id"
            :default-expanded="['workspace']"
            selection-mode="multiple"
            selection-propagation="both"
            aria-label="Workspace permissions"
            :ui="treeUi"
          >
            <template #indicator="{ node }">
              <span
                class="grid size-4 place-items-center rounded border border-border bg-background text-[10px] font-bold text-primary data-[checked=true]:border-primary"
                :data-checked="node.isSelected || undefined"
                aria-hidden="true"
              >
                {{ node.isIndeterminate ? "-" : node.isSelected ? "x" : "" }}
              </span>
            </template>
          </Tree>
          <code :class="codePill">selected: {{ selectedPermissions.join(", ") || "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Selection highlight scope</h3>
        <div :class="[canvasGrid, 'lg:grid-cols-3']">
          <div v-for="mode in highlightModes" :key="mode.id" class="grid content-start gap-2">
            <div>
              <p class="text-[13px] font-medium text-foreground">{{ mode.label }}</p>
              <p class="text-xs text-muted-foreground">{{ mode.description }}</p>
            </div>
            <Tree
              v-model="highlightSelections[mode.id]"
              :items="highlightItems"
              item-key="id"
              :default-expanded="['components']"
              :selection-highlight="mode.id"
              :aria-label="`${mode.label} selection`"
              :ui="treeUi"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Lazy API children</h3>
        <div :class="canvasCol">
          <Tree
            v-model:expanded="remoteExpanded"
            :items="remoteItems"
            item-key="id"
            :has-children="item => item.kind === 'folder'"
            :loading-keys="loadingKeys"
            aria-label="Remote services"
            :ui="treeUi"
            @expanded-change="loadChildren"
          >
            <template #loading="{ item }">
              Fetching children for {{ item.label }}...
            </template>
          </Tree>
          <code :class="codePill">loading: {{ loadingKeys.join(", ") || "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Virtualized results + disabled state</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <div class="grid gap-3">
            <Tree
              v-model="virtualSelection"
              :items="virtualItems"
              item-key="id"
              :virtualize="{ height: 220, itemHeight: 36, overscan: 6 }"
              aria-label="Virtualized results"
              :ui="treeUi"
            />
            <code :class="codePill">selected: {{ virtualSelection }}</code>
          </div>
          <Tree
            model-value="package"
            :items="files"
            item-key="id"
            disabled
            aria-label="Disabled project files"
            :ui="treeUi"
          />
        </div>
      </div>
    </div>
  </section>
</template>
