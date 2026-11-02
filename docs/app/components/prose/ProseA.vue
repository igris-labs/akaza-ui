<script setup lang="ts">
defineProps<{ href?: string; target?: string }>();
</script>
<template>
  <NuxtLink
    :href="href"
    :target="target"
    class="decoration-border-accent font-medium text-highlighted underline underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-1 focus-visible:outline-ring motion-reduce:transition-none"
  >
    <slot />
  </NuxtLink>
</template>
