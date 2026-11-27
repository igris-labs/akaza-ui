<script setup lang="ts">
defineProps<{ fitContent?: boolean }>();
</script>

<template>
  <div
    data-ui
    :class="{ 'min-h-56': !fitContent }"
    class="not-prose my-6 mb-0 flex items-center justify-center rounded-t-lg bg-muted/70 p-5 sm:p-8"
  >
    <slot />
  </div>
</template>
