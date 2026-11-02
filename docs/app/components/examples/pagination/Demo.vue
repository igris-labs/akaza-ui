<script setup lang="ts">
import { ref } from "vue";
import { Pagination } from "../../ui/pagination";

const page = ref(7);
</script>

<template>
  <div class="grid gap-3">
    <Pagination
      v-model="page"
      :total="240"
      :items-per-page="10"
      show-edges
      show-first-last
    />
    <p class="text-xs text-muted-foreground">Page {{ page }} of 24</p>
  </div>
</template>
