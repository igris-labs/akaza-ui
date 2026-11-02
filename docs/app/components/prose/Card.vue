<script setup lang="ts">
defineProps<{ title?: string; to?: string; icon?: string }>();
</script>
<template>
  <NuxtLink
    :to="to"
    class="block rounded-lg bg-muted p-5 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
  >
    <span class="flex items-center justify-between gap-3 font-medium text-highlighted">{{ title
    }}<Icon
      name="lucide:arrow-up-right"
      class="size-4"
      aria-hidden="true"
    /></span>
    <div class="mt-2 text-sm leading-6 text-muted-foreground [&>p]:my-0"><slot /></div>
  </NuxtLink>
</template>
