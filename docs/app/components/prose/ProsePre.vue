<script setup lang="ts">
import { computed } from "vue";

import { packageCommands } from "../../utils/package-commands";
import DocsCode from "../content/DocsCode.vue";
import PackageCommands from "../content/PackageCommands.vue";

defineOptions({ inheritAttrs: false });
const props = defineProps<{
  code?: string;
  language?: string;
  filename?: string;
  highlights?: number[];
  meta?: string;
  class?: string;
}>();
const shellLanguage = /^(?:sh|bash|shell|shellscript|zsh|console|shellsession)$/;
const commands = computed(() =>
  shellLanguage.test(props.language ?? "") ? packageCommands(props.code ?? "") : null,
);
</script>

<template>
  <PackageCommands
    v-if="commands"
    :commands="commands"
  />
  <DocsCode
    v-else
    :code="code ?? ''"
    :filename="filename"
    :language="language"
    :pre-class="$props.class"
    :pre-attrs="$attrs"
  />
</template>
