<script setup lang="ts">
import { computed } from "vue";

import { cn, tv } from "../../utils/ui";

const props = defineProps<{ level: 1 | 2 | 3 | 4 | 5 | 6; id?: string; class?: string }>();
const heading = tv({
  base: "relative scroll-mt-20 font-semibold tracking-tight text-balance text-highlighted first:mt-0",
  variants: {
    level: {
      1: "mt-12 mb-6 text-[2rem] leading-10",
      2: "mt-12 mb-5 text-xl leading-7",
      3: "mt-8 mb-4 text-lg leading-7",
      4: "mt-6 mb-3 text-base leading-6",
      5: "mt-5 mb-3 text-sm leading-6",
      6: "mt-5 mb-3 text-sm leading-6 text-toned",
    },
  },
});
const classes = computed(() => cn(heading({ level: props.level }), props.class));
</script>
<template>
  <component
    :is="`h${level}`"
    :id="id"
    :class="classes"
  >
    <a
      v-if="id"
      :href="`#${id}`"
      class="group rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <span
        class="absolute top-0 -left-6 hidden items-center pr-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none lg:inline-flex"
        aria-hidden="true"
      >#</span>
      <slot /> </a><slot v-else />
  </component>
</template>
