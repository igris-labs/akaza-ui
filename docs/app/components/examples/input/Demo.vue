<script setup lang="ts">
import { ref } from "vue";
import { Input } from "../../ui/input";

const value = ref("Akaza");
</script>

<template>
  <div class="grid max-w-sm gap-3">
    <Input
      v-model="value"
      placeholder="Project name"
      class="h-9"
    />
    <Input
      invalid
      placeholder="Invalid state"
      class="h-9"
    />
    <p class="text-xs text-muted-foreground">Value: {{ value }}</p>
  </div>
</template>
