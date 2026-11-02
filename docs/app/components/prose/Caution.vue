<script setup lang="ts">
import Callout from "./Callout.vue";
defineProps<{ title?: string }>();
</script>
<template>
  <Callout
    color="destructive"
    :title="title"
  >
    <slot />
  </Callout>
</template>
