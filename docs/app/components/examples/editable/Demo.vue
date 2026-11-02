<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";
import { Editable } from "../../ui/editable";

const value = ref("Quarterly planning notes");
const status = ref("Click the value or press Enter to edit it.");

function onSubmit(nextValue: string, details: AkazaChangeEventDetails) {
  status.value = `Submitted by ${details.reason}: ${nextValue || "(empty)"}`;
}

function onCancel(value: string) {
  status.value = `Canceled. Kept: ${value || "(empty)"}`;
}
</script>

<template>
  <div class="grid gap-3">
    <Editable
      v-model="value"
      activation-mode="click"
      submit-mode="none"
      select-on-focus
      @submit="onSubmit"
      @cancel="onCancel"
    />
    <div class="grid gap-1 text-xs text-muted-foreground">
      <p>{{ status }}</p>
      <p>
        Committed value: <code>{{ value }}</code>
      </p>
    </div>
  </div>
</template>
