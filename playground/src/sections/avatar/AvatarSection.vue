<script setup lang="ts">
import { Avatar } from "akaza-ui";
</script>

<template>
  <section id="avatar">
    <h2 class="text-lg font-semibold mb-1">Avatar</h2>
    <p class="text-sm mb-6 text-muted-foreground">Image display with fallback for broken or missing images.</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent">
      <Avatar
        src="https://avatars.githubusercontent.com/u/1000?v=4"
        alt="User avatar"
        class="w-10 h-10 rounded-full overflow-hidden bg-muted"
      >
        <template #fallback>
          <span class="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">JD</span>
        </template>
      </Avatar>
      <Avatar
        src="https://broken-image.example/404"
        alt="Broken image"
        class="w-10 h-10 rounded-full overflow-hidden bg-muted"
      >
        <template #fallback>
          <span class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">AB</span>
        </template>
      </Avatar>
      <Avatar class="w-10 h-10 rounded-full overflow-hidden bg-muted">
        <template #fallback>
          <span class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">CX</span>
        </template>
      </Avatar>
    </div>
  </section>
</template>
