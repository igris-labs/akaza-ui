<script setup lang="ts">
import { ref } from "vue";
import { PinInput } from "../../ui/pin-input";

const value = ref("");
const complete = ref(false);
</script>

<template>
  <div class="grid gap-3">
    <div>
      <p class="text-sm font-medium text-foreground">Verification code</p>
      <p class="mt-1 text-xs text-muted-foreground">
        Paste a six-digit code or enter one digit per cell.
      </p>
    </div>
    <PinInput
      v-model="value"
      :length="6"
      type="number"
      otp
      aria-label="Verification code"
      @complete="complete = true"
      @value-change="complete = false"
    />
    <p class="text-xs text-muted-foreground">
      {{ complete ? "Code complete" : `${value.length}/6 digits entered` }}
    </p>
  </div>
</template>
