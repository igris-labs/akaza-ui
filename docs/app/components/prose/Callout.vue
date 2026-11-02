<script setup lang="ts">
import { computed } from "vue";

import { cn, tv } from "../../utils/ui";
const props = defineProps<{
  title?: string;
  color?: "info" | "success" | "warning" | "destructive";
  class?: string;
}>();
const callout = tv({
  base: "my-6 flex gap-3 rounded-lg border p-4 text-sm leading-6 [&_p]:my-0 [&_p+p]:mt-3",
  variants: {
    color: {
      info: "border-info/20 bg-info/5 text-foreground",
      success: "border-success/20 bg-success/5 text-foreground",
      warning: "border-warning/30 bg-warning/5 text-foreground",
      destructive: "border-destructive/20 bg-destructive/5 text-foreground",
    },
  },
  defaultVariants: { color: "info" },
});
const classes = computed(() => cn(callout({ color: props.color }), props.class));
const icons = {
  info: "lucide:info",
  success: "lucide:circle-check",
  warning: "lucide:triangle-alert",
  destructive: "lucide:circle-alert",
};
</script>
<template>
  <aside
    role="note"
    :class="classes"
  >
    <Icon
      :name="icons[color ?? 'info']"
      class="mt-0.5 size-4 shrink-0"
      aria-hidden="true"
    />
    <div class="min-w-0">
      <p
        v-if="title"
        class="mb-1 font-semibold text-highlighted"
      >
        {{ title }}
      </p>
      <slot />
    </div>
  </aside>
</template>
