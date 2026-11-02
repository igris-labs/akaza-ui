<script setup lang="ts">
import ProseHeading from "./ProseHeading.vue";
defineProps<{ id?: string }>();
</script>
<template>
  <ProseHeading
    :id="id"
    :level="5"
  >
    <slot />
  </ProseHeading>
</template>
