<script setup lang="ts">
import Callout from "./Callout.vue";
defineProps<{ title?: string }>();
</script>
<template>
  <Callout
    color="success"
    :title="title"
  >
    <slot />
  </Callout>
</template>
