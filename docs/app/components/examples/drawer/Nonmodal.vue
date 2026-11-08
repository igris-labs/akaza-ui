<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../ui/button";
import { Drawer } from "../../ui/drawer";

const open = ref(false);
const issue = ref("Login stalls");
const draft = ref("");
</script>

<template>
  <div class="grid w-full max-w-sm gap-3">
    <label class="grid gap-2 text-sm font-medium text-foreground">
      Quick capture
      <input
        v-model="draft"
        class="h-9 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Add an issue"
      >
    </label>
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="item in ['Login stalls', 'Search is slow']"
        :key="item"
        variant="outline"
        @click="
          issue = item;
          open = true;
        "
      >
        {{ item }}
      </Button>
    </div>
    <Drawer
      v-model="open"
      :modal="false"
      :swipe-to-close="false"
      title="Issue preview"
      width="xs"
    >
      <template #body>
        <p>{{ issue }}</p>
      </template>
      <template #footer="{ close }">
        <Button
          variant="outline"
          @click="close"
        >
          Close preview
        </Button>
      </template>
    </Drawer>
  </div>
</template>
