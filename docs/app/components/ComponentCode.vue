<script setup lang="ts">
import { ref } from 'vue'

const showCode = ref(false)
</script>

<template>
  <div class="not-prose mb-6 overflow-hidden rounded-b-xl border border-neutral-200 dark:border-neutral-800">
    <div class="border-b border-neutral-200 dark:border-neutral-800" v-show="showCode">
      <div class="[&_pre]:m-0 [&_pre]:rounded-none [&_pre]:max-h-96 [&_pre]:overflow-auto">
        <slot />
      </div>
    </div>
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      :icon="showCode ? 'i-lucide-chevron-up' : 'i-lucide-code'"
      :label="showCode ? 'Hide code' : 'Show code'"
      class="w-full justify-center rounded-none py-2.5 text-xs font-medium"
      @click="showCode = !showCode"
    />
  </div>
</template>
