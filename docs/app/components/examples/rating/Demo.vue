<script setup lang="ts">
import { Rating } from "akaza-ui";
import { ref } from "vue";

const value = ref(3.5);
const ui = {
  root: "gap-1 text-3xl leading-none",
  item: "size-8",
  base: "text-neutral-300 dark:text-neutral-700",
  fill: "text-neutral-900 dark:text-white",
  fillIcon: "text-3xl leading-none",
  radio: "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
};
</script>

<template>
  <div class="grid gap-3">
    <Rating v-model="value" :step="0.5" hoverable clearable :ui="ui" />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">Rating: {{ value }} / 5</p>
  </div>
</template>
