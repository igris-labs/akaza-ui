<script setup lang="ts">
import { provideToastManager } from "akaza-ui";
provideToastManager();
const searchOpen = useState("docs-search-open", () => false);
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", href: "/favicon.ico" }],
});
useSeoMeta({
  titleTemplate: "%s · Akaza UI",
  ogSiteName: "Akaza UI",
  twitterCard: "summary_large_image",
});
</script>
<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="var(--foreground)" />
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <DocsSearch v-model:open="searchOpen" />
</template>
