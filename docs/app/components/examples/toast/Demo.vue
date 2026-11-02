<script setup lang="ts">
import type { ToastType } from "akaza-ui";

import { useToast } from "akaza-ui";
import { computed } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { Toast } from "../../ui/toast";

const toast = useToast();
const openCount = computed(() => toast.toasts.value.filter((item) => item.state === "open").length);
const types: Array<{ label: string; type: ToastType }> = [
  { label: "Standard", type: "status" },
  { label: "Success", type: "success" },
  { label: "Info", type: "info" },
  { label: "Warning", type: "warning" },
  { label: "Alert", type: "alert" },
  { label: "Error", type: "error" },
];

function show(type: ToastType) {
  toast.add({
    title: `${type.slice(0, 1).toUpperCase()}${type.slice(1)} notification`,
    description: `This toast exposes type="${type}" to custom content.`,
    type,
    duration: type === "error" || type === "alert" ? 0 : 5000,
  });
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <ExampleButton
      v-for="item in types"
      :key="item.type"
      type="button"
      @click="show(item.type)"
    >
      {{ item.label }}
    </ExampleButton>
    <span class="rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
      Open: {{ openCount }}
    </span>
  </div>

  <Toast />
</template>
