<script setup lang="ts">
definePageMeta({ layout: "docs" });

const route = useRoute();
const trailingSlash = /\/$/;

const path = computed(() => route.path.replace(trailingSlash, "") || "/");

const { data: page } = await useAsyncData(
  () => `page:${path.value}`,
  () => queryCollection("docs").path(path.value).first(),
);

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });

const { data: surround } = await useAsyncData(
  () => `surround:${path.value}`,
  () => queryCollectionItemSurroundings("docs", path.value),
);

useSeoMeta({
  title: () => page.value?.seo?.title || page.value?.title,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
});

defineOgImage("Docs", { title: page.value.title, description: page.value.description });

const editUrl = computed(
  () =>
    `https://github.com/igris-labs/akaza-ui/edit/main/docs/content/${page.value?.stem}.${page.value?.extension}`,
);
</script>
<template>
  <div
    v-if="page"
    class="grid min-h-[calc(100dvh-3.5rem)] grid-cols-1 xl:-ml-60 xl:w-[calc(100%+15rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)]"
  >
    <div class="hidden xl:block" aria-hidden="true" />
    <article class="min-w-0 px-5 pt-12 pb-24 sm:px-8 xl:px-0">
      <div class="mx-auto max-w-168" data-docs-article>
        <header class="mb-10">
          <h1 class="text-[2rem] leading-10 font-semibold tracking-tight text-highlighted">
            {{ page.title }}
          </h1>
          <p class="mt-3 max-w-150 text-[15px] leading-7 text-muted-foreground">
            {{ page.description }}
          </p>
          <div class="mt-5 flex flex-wrap gap-2">
            <NuxtLink
              v-for="item in page.links"
              :key="item.to"
              :to="item.to"
              :target="item.target"
              class="rounded-md bg-muted px-3 py-2 text-sm hover:bg-secondary"
            >
              {{ item.label }}
            </NuxtLink>
            <PageHeaderLinks />
          </div>
        </header>
        <ContentRenderer
          :value="page"
          class="docs-prose min-w-0 text-[15px] leading-7"
          data-testid="docs-prose"
        />
        <nav aria-label="Guide pages" class="mt-14 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-if="surround?.[0]"
            :to="surround[0].path"
            class="rounded-lg bg-muted p-5 hover:bg-secondary"
          >
            <span class="block text-xs text-muted-foreground">← Previous</span>
            <span class="mt-2 block font-medium">{{ surround[0].title }}</span>
          </NuxtLink>
          <NuxtLink
            v-if="surround?.[1]"
            :to="surround[1].path"
            class="rounded-lg bg-muted p-5 text-right hover:bg-secondary sm:col-start-2"
          >
            <span class="block text-xs text-muted-foreground">Next →</span>
            <span class="mt-2 block font-medium">{{ surround[1].title }}</span>
          </NuxtLink>
        </nav>
        <a
          :href="editUrl"
          target="_blank"
          rel="noreferrer"
          class="mt-8 inline-flex text-sm text-muted-foreground hover:text-foreground"
        >
          Edit this page on GitHub ↗
        </a>
        <AppFooter compact class="mt-8" />
      </div>
    </article>
    <div class="hidden min-w-0 pt-12 xl:block xl:pl-24">
      <DocsToc :links="page.body?.toc?.links ?? []" />
    </div>
  </div>
</template>
