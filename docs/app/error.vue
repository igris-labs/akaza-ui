<script setup lang="ts">
import type { NuxtError } from "#app";
defineProps<{ error: NuxtError }>();
useHead({ htmlAttrs: { lang: "en" } });
useSeoMeta({ title: "Page unavailable · Akaza UI" });
</script>
<template>
  <main
    class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-8 text-center text-foreground"
  >
    <p class="text-sm text-muted-foreground">{{ error.statusCode }}</p>
    <h1 class="text-4xl font-semibold tracking-tight">
      {{ error.statusCode === 404 ? "Page not found" : "Something went wrong" }}
    </h1>
    <p class="max-w-md text-muted-foreground">
      {{
        error.statusCode === 404
          ? "The page may have moved. Find your way back to the documentation."
          : "Try loading the page again."
      }}
    </p>
    <button
      class="rounded-md bg-primary px-5 py-3 text-primary-foreground"
      @click="clearError({ redirect: '/getting-started' })"
    >
      Back to documentation
    </button>
  </main>
</template>
