<script setup lang="ts">
import { ref } from "vue";
import { Rating } from "../../ui/rating";

const value = ref(3.5);
</script>

<template>
  <div class="grid gap-3">
    <Rating
      v-model="value"
      :step="0.5"
      hoverable
      clearable
    />
    <p class="text-xs text-muted-foreground">Rating: {{ value }} / 5</p>
  </div>
</template>
