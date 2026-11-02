<script setup lang="ts">
defineProps<{ src?: string; alt?: string; width?: string | number; height?: string | number }>();
</script>
<template>
  <img
    :src="src"
    :alt="alt ?? ''"
    :width="width"
    :height="height"
    class="my-6 block h-auto w-full rounded-lg border border-border"
    loading="lazy"
  >
</template>
