<script setup lang="ts">
import { Button as ExampleButton } from "../../ui/button";

import { Drawer } from "../../ui/drawer";
</script>

<template>
  <Drawer side="right">
    <template #trigger="{ toggle }">
      <ExampleButton @click="() => toggle()"> Open cart </ExampleButton>
    </template>

    <template #header="{ close, titleId }">
      <div class="flex items-center justify-between gap-4">
        <h2
          :id="titleId"
          class="text-sm font-semibold text-foreground"
        >
          Your cart
        </h2>
        <ExampleButton
          variant="ghost"
          shape="icon"
          aria-label="Close"
          @click="() => close()"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke-linecap="round"
            />
          </svg>
        </ExampleButton>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-3">
        <div
          v-for="item in [
            { name: 'Akaza UI Pro', price: '$49' },
            { name: 'Component Pack', price: '$19' },
          ]"
          :key="item.name"
          class="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div>
            <p class="text-sm font-medium text-foreground">
              {{ item.name }}
            </p>
            <p class="text-xs text-muted-foreground">Lifetime license</p>
          </div>
          <span class="text-sm font-semibold text-foreground">{{ item.price }}</span>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="w-full">
        <div class="mb-3 flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Total</span>
          <span class="font-semibold text-foreground">$68</span>
        </div>
        <ExampleButton
          class="w-full"
          @click="() => close()"
        >
          Checkout
        </ExampleButton>
      </div>
    </template>
  </Drawer>
</template>
