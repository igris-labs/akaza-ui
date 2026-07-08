<template>
  <section
    class="relative isolate overflow-hidden bg-white px-4 py-20 text-neutral-950 dark:bg-black dark:text-white sm:px-6 md:py-28 lg:px-8 min-h-screen -mt-16"
  >
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        class="absolute inset-x-0 top-0 h-128 bg-[radial-gradient(circle_at_50%_0%,rgba(24,24,27,0.08),transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_48%)]"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_72%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)]"
      />
    </div>

    <div
      class="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(26rem,0.75fr)] md:items-center lg:gap-14 pt-32"
    >
      <div class="motion-safe:animate-[akaza-hero-rise_800ms_cubic-bezier(0.32,0.72,0,1)_both]">
        <h1
          class="max-w-4xl text-5xl font-semibold tracking-[-0.052em] text-balance text-neutral-950 dark:text-white sm:text-6xl md:text-7xl"
        >
          Unstyled <span class="text-neutral-500 dark:text-neutral-400">Vue</span> components for
          accessible user interfaces.
        </h1>

        <p
          class="mt-7 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400 sm:text-xl sm:leading-9"
        >
          Headless UI primitives with a Vue-native slots API. Bring your own styles — keyboard
          navigation and ARIA are handled for you.
        </p>

        <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <NuxtLink
            to="/getting-started"
            class="group inline-flex w-full items-center justify-between gap-4 rounded-full bg-neutral-950 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] dark:bg-white dark:text-neutral-950 sm:w-auto"
          >
            Get started
            <span
              class="grid size-8 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 dark:bg-neutral-950/10"
            >
              →
            </span>
          </NuxtLink>

          <NuxtLink
            to="/components"
            class="group inline-flex w-full items-center justify-between gap-4 rounded-full bg-neutral-50 py-2.5 pl-6 pr-2.5 text-sm font-medium text-neutral-950 ring-1 ring-black/8 transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98] dark:bg-white/[0.06] dark:text-white dark:ring-white/10 dark:hover:bg-white/[0.09] sm:w-auto"
          >
            Browse components
            <span
              class="grid size-8 place-items-center rounded-full bg-neutral-950/5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 dark:bg-white/10"
            >
              →
            </span>
          </NuxtLink>
        </div>
      </div>

      <div
        class="motion-safe:animate-[akaza-hero-rise_900ms_cubic-bezier(0.32,0.72,0,1)_120ms_both]"
      >
        <div
          class="rounded-[1.75rem] bg-neutral-950/[0.035] p-1.5 ring-1 ring-black/5 dark:bg-white/4.5 dark:ring-white/10"
        >
          <div
            class="overflow-hidden rounded-[1.4rem] bg-neutral-950 text-neutral-200 ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10"
          >
            <div class="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full bg-red-400/80" />
                <span class="size-2 rounded-full bg-yellow-400/80" />
                <span class="size-2 rounded-full bg-emerald-400/80" />
              </div>
              <span class="font-mono text-xs text-neutral-500">TabsDemo.vue</span>
            </div>

            <pre class="overflow-x-auto p-5 text-[13px] leading-6 sm:text-sm">
            <code>
<span class="text-pink-300">&lt;script</span> <span class="text-emerald-300">setup</span> <span class="text-sky-300">lang</span>=<span class="text-amber-200">"ts"</span><span class="text-pink-300">&gt;</span>
<span class="text-violet-300">import</span> { <span class="text-sky-200">ref</span> } <span class="text-violet-300">from</span> <span class="text-amber-200">"vue"</span>;
<span class="text-violet-300">import</span> { <span class="text-sky-200">Tabs</span> } <span class="text-violet-300">from</span> <span class="text-amber-200">"akaza-ui"</span>;

<span class="text-violet-300">const</span> <span class="text-sky-200">tabs</span> = [
  { <span class="text-emerald-300">value</span>: <span class="text-amber-200">"overview"</span>, <span class="text-emerald-300">label</span>: <span class="text-amber-200">"Overview"</span> },
  { <span class="text-emerald-300">value</span>: <span class="text-amber-200">"usage"</span>, <span class="text-emerald-300">label</span>: <span class="text-amber-200">"Usage"</span> },
  { <span class="text-emerald-300">value</span>: <span class="text-amber-200">"api"</span>, <span class="text-emerald-300">label</span>: <span class="text-amber-200">"API"</span> },
];
<span class="text-violet-300">const</span> <span class="text-sky-200">active</span> = <span class="text-sky-200">ref</span>(<span class="text-amber-200">"overview"</span>);
<span class="text-pink-300">&lt;/script&gt;</span>

<span class="text-pink-300">&lt;template&gt;</span>
  <span class="text-pink-300">&lt;Tabs</span>
    <span class="text-sky-300">:items</span>=<span class="text-amber-200">"tabs"</span>
    <span class="text-sky-300">v-model</span>=<span class="text-amber-200">"active"</span>
    <span class="text-sky-300">:ui</span>=<span class="text-amber-200">"{ tab: 'px-4 py-2 text-sm' }"</span>
  <span class="text-pink-300">&gt;</span>
    <span class="text-pink-300">&lt;template</span> <span class="text-sky-300">#panel-overview</span><span class="text-pink-300">&gt;</span><span class="text-neutral-100">Welcome to Akaza UI.</span><span class="text-pink-300">&lt;/template&gt;</span>
    <span class="text-pink-300">&lt;template</span> <span class="text-sky-300">#panel-usage</span><span class="text-pink-300">&gt;</span><span class="text-neutral-100">Import and use any component.</span><span class="text-pink-300">&lt;/template&gt;</span>
    <span class="text-pink-300">&lt;template</span> <span class="text-sky-300">#panel-api</span><span class="text-pink-300">&gt;</span><span class="text-neutral-100">Full TypeScript API docs.</span><span class="text-pink-300">&lt;/template&gt;</span>
  <span class="text-pink-300">&lt;/Tabs&gt;</span>
<span class="text-pink-300">&lt;/template&gt;</span></code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes akaza-hero-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 2rem, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
