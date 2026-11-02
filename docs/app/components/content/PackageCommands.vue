<script setup lang="ts">
import type { PackageManager } from "../../utils/package-commands";
import { packageManagers } from "../../utils/package-commands";
import { Tabs } from "../ui/tabs";
import DocsCode from "./DocsCode.vue";

const props = defineProps<{ commands: Record<PackageManager, string> }>();
const active = useState<PackageManager>("docs-package-manager", () => "pnpm");
const packageIcons: Record<string, string> = {
  pnpm: "tabler:brand-pnpm",
  yarn: "tabler:brand-yarn",
  npm: "tabler:brand-npm",
};
const items = packageManagers.map((manager) => ({ value: manager, label: manager }));
</script>

<template>
  <Tabs
    v-model="active"
    :unmount-on-hide="false"
    :items="items"
    aria-label="Package manager"
    class="my-6 overflow-hidden rounded-lg border border-border/60 bg-(--syntax-background)"
    :ui="{
      root: 'gap-0',
      list: 'w-full rounded-none border-b border-border/50 bg-(--syntax-header) p-2',
      indicator: 'bg-foreground/8',
      tab: 'gap-2',
    }"
  >
    <template #tab="{ item }">
      <svg
        v-if="item.value === 'bun'"
        class="size-4 shrink-0 text-warning"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3c0 3-9 5-9 11a9 7 0 0 0 18 0c0-4-4-7-9-11Z" />
        <path d="M9 6c0 2-3 4-3 6m7-6 3 5M8 15h.01M16 15h.01M10 17c1 1 3 1 4 0" />
      </svg>
      <Icon
        v-else
        :name="packageIcons[item.value] ?? 'tabler:package'"
        class="size-4 shrink-0"
        :class="{
          'text-warning': item.value === 'pnpm',
          'text-info': item.value === 'yarn',
          'text-destructive': item.value === 'npm',
        }"
        aria-hidden="true"
      />
      {{ item.label }}
    </template>
    <template
      v-for="manager in packageManagers"
      :key="manager"
      #[`panel-${manager}`]
    >
      <DocsCode
        class="my-0! rounded-none border-0"
        :code="props.commands[manager]"
        language="sh"
        :header="false"
      />
    </template>
  </Tabs>
</template>
