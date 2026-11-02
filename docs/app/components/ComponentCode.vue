<script setup lang="ts">
import { Button } from "./ui/button";
const showCode = ref(false);
const id = useId();
</script>
<template>
  <div class="not-prose mb-8 overflow-hidden rounded-b-lg bg-muted/70">
    <div
      v-show="showCode"
      :id="id"
      class="[&_pre]:max-h-120 [&_pre]:overflow-auto [&>div]:my-0 [&>div]:rounded-none"
    >
      <slot />
    </div>
    <Button
      variant="ghost"
      class="w-full justify-center rounded-none py-3"
      :aria-expanded="showCode"
      :aria-controls="id"
      @click="showCode = !showCode"
    >
      <Icon
        :name="showCode ? 'lucide:chevron-up' : 'lucide:code'"
        class="size-4"
        aria-hidden="true"
      />{{ showCode ? "Hide code" : "Show code" }}
    </Button>
  </div>
</template>
