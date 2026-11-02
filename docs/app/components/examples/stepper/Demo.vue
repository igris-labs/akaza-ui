<script setup lang="ts">
import { ref } from "vue";
import { Stepper } from "../../ui/stepper";

const value = ref(1);
const items = [
  { value: 1, title: "Account", description: "Identity", content: "Add account details." },
  { value: 2, title: "Workspace", description: "Settings", content: "Configure the workspace." },
  { value: 3, title: "Review", description: "Confirm", content: "Review and submit." },
];
</script>

<template>
  <Stepper
    v-model="value"
    :items="items"
    show-controls
  />
</template>
