<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { Button } from "../ui/button";
import CodeFileIcon from "./CodeFileIcon.vue";

const props = withDefaults(
  defineProps<{
    code: string;
    header?: boolean;
    filename?: string;
    language?: string;
    preClass?: string;
    preAttrs?: Record<string, unknown>;
  }>(),
  { header: true },
);
const status = ref("Copy code");
const language = computed(() => {
  if (props.language) return props.language;
  const extension = props.filename?.split(".").at(-1);
  return (
    ({ ts: "ts", vue: "vue", css: "css", json: "json" } as Record<string, string>)[
      extension ?? ""
    ] ?? "vue"
  );
});
const { data: highlighted } = await useAsyncData(
  `code:${useId()}`,
  async () => {
    const { highlightCode } = await import("../../utils/highlight");
    return highlightCode(props.code, language.value);
  },
  { watch: [() => props.code, language] },
);
watch(
  () => props.code,
  () => {
    status.value = "Copy code";
  },
);
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
    status.value = "Copied";
  } catch {
    status.value = "Select and copy the code below";
  }
}
</script>

<template>
  <div
    class="group/code relative my-6 min-w-0 overflow-hidden rounded-lg border border-border/60 bg-(--syntax-background) text-sm syntax-highlight"
  >
    <div
      :class="
        header === false
          ? 'absolute top-2 right-2 z-20'
          : 'flex min-h-10 items-center justify-between gap-3 border-b border-border/50 bg-(--syntax-header) px-4'
      "
    >
      <span
        v-if="header !== false"
        class="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
      >
        <CodeFileIcon
          v-if="filename"
          :filename="filename"
        />
        <span class="truncate">{{ filename ?? language }}</span>
      </span>
      <Button
        variant="ghost"
        size="xs"
        shape="icon"
        :aria-label="status"
        class="text-muted-foreground hover:text-highlighted"
        @click="copy"
      >
        <Icon
          :name="status === 'Copied' ? 'lucide:check' : 'lucide:copy'"
          class="size-3.5"
          aria-hidden="true"
        />
      </Button>
      <span
        class="sr-only"
        role="status"
      >{{ status === "Copy code" ? "" : status }}</span>
    </div>
    <pre
      tabindex="0"
      :aria-label="filename ? `${filename} source code` : `${language} source code`"
      data-tab-motion
      v-bind="preAttrs"
      :class="header === false && 'pr-12'"
      class="m-0 max-h-120 overflow-auto bg-transparent px-5 py-5 font-mono text-[13px] leading-6 text-(--syntax-foreground)"
    ><code v-if="highlighted" v-html="highlighted" /><code v-else>{{ code }}</code></pre>
  </div>
</template>
