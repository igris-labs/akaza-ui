<script setup lang="ts">
import { PinInput } from "akaza-ui";
import { ref } from "vue";

const value = ref("");
const complete = ref(false);

const ui = {
  root: "gap-2",
  input: "size-11 rounded-lg border border-neutral-300 bg-white text-center font-mono text-lg text-neutral-900 outline-none focus:border-neutral-900 data-[akaza-invalid]:border-red-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100",
};
</script>

<template>
  <div class="grid gap-3">
    <div>
      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Verification code</p>
      <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Paste a six-digit code or enter one digit per cell.</p>
    </div>
    <PinInput
      v-model="value"
      :length="6"
      type="number"
      otp
      aria-label="Verification code"
      :ui="ui"
      @complete="complete = true"
      @value-change="complete = false"
    />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">
      {{ complete ? "Code complete" : `${value.length}/6 digits entered` }}
    </p>
  </div>
</template>
