<script setup lang="ts">
import { Button } from "../../ui/button";
async function handleSave() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
</script>
<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button>Primary</Button>
    <Button
      color="secondary"
      variant="soft"
    >
      Secondary
    </Button>
    <Button variant="ghost">Ghost</Button>
    <Button color="destructive">Danger</Button>
    <Button
      loading-auto
      @click="handleSave"
    >
      Save<template #loading>Saving…</template>
    </Button>
    <Button disabled>Disabled</Button>
  </div>
</template>
