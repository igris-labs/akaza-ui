<script setup lang="ts">
import Callout from "./Callout.vue";
defineProps<{ title?: string }>();
</script>
<template>
  <Callout
    color="info"
    :title="title"
  >
    <slot />
  </Callout>
</template>
