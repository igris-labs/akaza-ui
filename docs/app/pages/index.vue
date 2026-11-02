<script setup lang="ts">
import HomeFeatures from "../components/content/HomeFeatures.vue";
import PackageCommands from "../components/content/PackageCommands.vue";
import { Button } from "../components/ui/button";
definePageMeta({ layout: "marketing" });
const link = resolveComponent("NuxtLink");
useSeoMeta({
  titleTemplate: "",
  title: "Akaza UI · A Vue-native headless UI library",
  description:
    "Accessible, unstyled primitives built from scratch for Vue 3. Use v-model, named scoped slots, and the ui prop without React-style sub-component trees.",
});
defineOgImage("Docs", {
  title: "A Vue-native headless UI library.",
  description: "Accessible, unstyled primitives built from scratch for Vue 3.",
});
const installCommands = {
  pnpm: "pnpm add akaza-ui",
  npm: "npm install akaza-ui",
  yarn: "yarn add akaza-ui",
  bun: "bun add akaza-ui",
};
const principles = [
  {
    title: "Slots, not subcomponents.",
    description:
      "Use the Vue patterns you already know. State and actions come through scoped slots, without a tree of compound components.",
    code: "<template #trigger=\"{ isOpen }\">\n  {{ isOpen ? 'Close' : 'Open' }}\n</template>",
  },
  {
    title: "Behavior is the foundation.",
    description:
      "Keyboard navigation, focus management, and accessibility semantics are part of the component. Build your interface on top of them.",
    code: '<Dialog title="Make it yours">\n  <template #body>\n    Your content. Your layout.\n  </template>\n</Dialog>',
  },
  {
    title: "Your design stays yours.",
    description:
      "Akaza supplies structural CSS for interaction and positioning. Everything visual is up to you: Tailwind, plain CSS, or your own design system.",
    code: '<Button class="your-button">\n  Ship something good\n</Button>',
  },
];
const tabsSource = `<script setup lang="ts">
import { ref } from "vue"
import { Tabs } from "akaza-ui"

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "usage", label: "Usage" },
]
const active = ref("overview")
</${"script"}>

<template>
  <Tabs v-model="active" :items="tabs">
    <template #panel-overview>
      Accessible behavior, your styles.
    </template>
  </Tabs>
</template>`;
</script>
<template>
  <div
    class="mx-auto flex w-full max-w-360 flex-col gap-24 px-5 pb-24 sm:gap-36 sm:px-8 sm:pb-36 lg:gap-44"
  >
    <section
      class="mx-auto flex w-full flex-col items-center pt-14 text-center sm:pt-20"
      aria-labelledby="hero-title"
    >
      <h1
        id="hero-title"
        class="max-w-3xl text-[clamp(2rem,3.5vw,3rem)] leading-[1.08] font-semibold tracking-[-0.045em] text-balance text-highlighted mt-16"
      >
        A Vue-native headless UI library.
      </h1>
      <p class="mt-5 max-w-2xl text-base leading-7 text-pretty text-foreground sm:text-lg">
        Accessible, unstyled primitives built from scratch for Vue 3. Use
        <span class="whitespace-nowrap">v-model</span>, named scoped slots, and the ui prop without
        React-style sub-component trees.
      </p>
      <div class="mt-10 flex flex-wrap justify-center gap-3" data-ui>
        <Button :as="link" to="/getting-started" size="md">
          Get started<Icon name="tabler:arrow-right" class="size-4" aria-hidden="true" />
        </Button>
        <Button :as="link" to="/components" color="secondary" variant="soft" size="md">
          Browse components
        </Button>
      </div>
      <PackageCommands :commands="installCommands" class="mt-8! mb-0! w-full max-w-sm text-left" />
      <p class="mt-5 text-sm text-muted-foreground mb-16">
        Open source. MIT licensed. Made for Vue 3 & Nuxt.
      </p>
      <div
        class="mt-14 grid w-full items-start gap-4 rounded-2xl bg-muted/60 p-3 text-left sm:mt-20 sm:p-5 lg:grid-cols-2"
        data-testid="hero-showcase"
        data-ui
      >
        <HomeWorkbench class="bg-transparent! p-0!" />
        <DocsCode
          :code="tabsSource"
          filename="TabsDemo.vue"
          language="vue"
          class="my-0! h-full border-0"
        />
      </div>
    </section>

    <HomeFeatures />

    <section aria-labelledby="principles-title">
      <div class="grid gap-5 lg:grid-cols-2 lg:gap-16">
        <h2
          id="principles-title"
          class="max-w-md text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
        >
          A Vue API that feels like Vue.
        </h2>
        <p class="max-w-xl text-base leading-7 text-muted-foreground">
          No ports. No new component grammar. Just the building blocks for interfaces that work,
          with room to make them your own.
        </p>
      </div>
      <div class="mt-8 space-y-8 sm:space-y-12">
        <div
          v-for="principle in principles"
          :key="principle.title"
          class="grid items-center gap-5 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <h3 class="text-lg font-semibold tracking-tight">{{ principle.title }}</h3>
            <p class="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              {{ principle.description }}
            </p>
          </div>
          <div class="min-w-0" data-ui>
            <DocsCode
              :style="{ '--syntax-background': 'var(--muted)' }"
              :code="principle.code"
              language="vue"
              :header="false"
              class="my-0! border-0"
            />
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="components-title">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 id="components-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">
            Small parts. Real possibilities.
          </h2>
          <p class="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            From a single switch to a complete application layout. Try the components, then take a
            look at the API.
          </p>
        </div>
        <Button :as="link" to="/components" color="secondary" variant="outline">
          All components<Icon name="tabler:arrow-right" class="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div class="mt-6 grid gap-4 lg:grid-cols-2" data-ui>
        <div class="rounded-xl bg-muted/60 p-5 sm:p-6">
          <NuxtLink to="/components/accordion" class="text-sm font-medium hover:underline">
            Accordion ↗
          </NuxtLink>
          <div class="mt-6 flex min-h-64 items-center justify-center">
            <ExamplesAccordionDemo />
          </div>
        </div>
        <div class="rounded-xl bg-muted/60 p-5 sm:p-6">
          <NuxtLink to="/components/tabs" class="text-sm font-medium hover:underline">
            Tabs ↗
          </NuxtLink>
          <div class="mt-6 flex min-h-64 items-center justify-center"><ExamplesTabsDemo /></div>
        </div>
      </div>
      <div class="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-16">
        <h3 class="text-lg font-semibold tracking-tight">
          Headless at the core.<br />Styled when you want it.
        </h3>
        <p class="max-w-xl text-base leading-7 text-muted-foreground">
          Want a styled starting point?
          <a
            href="https://ipex.igrislabs.com"
            class="font-medium text-foreground underline underline-offset-4"
          >
            IPEX
          </a>
          builds on Akaza with Tailwind CSS. This documentation uses the same foundation.
          <a
            href="https://instruo.org"
            class="font-medium text-foreground underline underline-offset-4"
          >
            Instruo
          </a>
          puts it to work in everyday tools.
        </p>
      </div>
    </section>

    <div data-ui>
      <ExamplesFormDetailedForm
        class="border-0! bg-transparent! py-0! [&>div]:max-w-none! [&>div]:px-0!"
      />
    </div>

    <section
      class="rounded-xl bg-muted/50 px-6 py-10 text-center sm:px-10 sm:py-14"
      aria-labelledby="start-title"
    >
      <h2 id="start-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">
        Add Akaza UI to your project.
      </h2>
      <p class="mt-3 text-base leading-7 text-muted-foreground">
        Install the package, then choose a component.
      </p>
      <div class="mt-10 flex flex-wrap justify-center gap-3" data-ui>
        <Button :as="link" to="/getting-started/installation" size="md">
          Installation<Icon name="tabler:arrow-right" class="size-4" aria-hidden="true" />
        </Button>
        <Button
          as="a"
          href="https://github.com/igris-labs/akaza-ui"
          target="_blank"
          rel="noopener noreferrer"
          color="secondary"
          variant="outline"
          size="md"
        >
          <Icon name="tabler:brand-github" class="size-4" aria-hidden="true" />View source
        </Button>
      </div>
    </section>
  </div>
</template>
