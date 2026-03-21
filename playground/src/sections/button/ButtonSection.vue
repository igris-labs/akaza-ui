<script setup lang="ts">
import { ref } from "vue";
import { Button } from "akaza-ui";

const clickCount = ref(0);
const isLoading = ref(false);

function simulateLoad() {
  isLoading.value = true;
  setTimeout(() => (isLoading.value = false), 2000);
}

async function asyncSave() {
  await new Promise<void>((res) => setTimeout(res, 2000));
}

async function asyncFail() {
  await new Promise<void>((_, rej) => setTimeout(rej, 2000));
}
</script>

<template>
  <section id="button">
    <h2 class="text-lg font-semibold mb-1">Button</h2>
    <p class="text-sm mb-6 text-muted-foreground">
      Polymorphic button with disabled, focusable-when-disabled, and loading support.
    </p>
    <div class="rounded-lg border p-6 flex flex-wrap gap-3 bg-accent">
      <Button
        class="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        @click="clickCount++"
      >
        Click me ({{ clickCount }})
      </Button>

      <Button
        disabled
        class="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground opacity-40 cursor-not-allowed"
      >
        Disabled
      </Button>

      <Button
        disabled
        :focusable-when-disabled="true"
        class="px-4 py-1.5 rounded-md text-sm font-medium border border-border bg-background text-muted-foreground opacity-60 cursor-not-allowed"
      >
        Focusable + Disabled (Tab here)
      </Button>

      <Button
        :loading="isLoading"
        class="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 [&_.akaza-button-spinner]:animate-spin"
        @click="simulateLoad"
      >
        Load (2s)
      </Button>

      <Button
        :loading="isLoading"
        class="px-4 py-1.5 rounded-md text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors flex items-center gap-2 [&_.akaza-button-spinner]:animate-spin"
        @click="simulateLoad"
      >
        <template #loading>
          <svg
            class="animate-spin w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving…
        </template>
        Custom loader
      </Button>

      <Button
        as="a"
        href="#button"
        class="px-4 py-1.5 rounded-md text-sm font-medium text-foreground transition-colors underline"
      >
        As anchor
      </Button>

      <Button
        loading-auto
        :on-click="asyncSave"
        class="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 [&_.akaza-button-spinner]:animate-spin"
      >
        Auto Load (2s)
      </Button>

      <Button
        loading-auto
        :on-click="asyncFail"
        class="px-4 py-1.5 rounded-md text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors flex items-center gap-2 [&_.akaza-button-spinner]:animate-spin"
      >
        Auto Load (fails)
      </Button>
    </div>
  </section>
</template>
