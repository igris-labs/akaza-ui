<script setup lang="ts">
import Callout from "./Callout.vue";
defineProps<{ title?: string }>();
</script>
<template>
  <Callout
    color="warning"
    :title="title"
  >
    <slot />
  </Callout>
</template>
