<script setup lang="ts">
defineProps<{ compact?: boolean }>();
const { footer } = useAppConfig();
const ecosystem = footer.columns.find((column) => column.label === "Ecosystem")?.children ?? [];
</script>
<template>
  <footer
    v-if="compact"
    class="space-y-4 border-t border-border/50 pt-5 text-xs text-muted-foreground"
  >
    <p>{{ footer.credits }} · {{ footer.tagline }}</p>
    <nav
      aria-label="Ecosystem"
      class="flex flex-wrap gap-x-4 gap-y-2"
    >
      <NuxtLink
        v-for="item in ecosystem"
        :key="item.to"
        :to="item.to"
        :target="item.target"
        rel="noreferrer"
        class="hover:text-foreground"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </footer>
  <footer
    v-else
    class="bg-muted px-5 py-12 sm:px-8"
  >
    <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.5fr_2fr]">
      <div>
        <NuxtLink
          to="/"
          class="text-2xl font-semibold tracking-tight"
        >
          Akaza UI
        </NuxtLink>
        <p class="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          {{ footer.description }}
        </p>
        <p class="mt-6 text-xs text-muted-foreground">{{ footer.credits }} · MIT licensed</p>
      </div>
      <nav
        aria-label="Footer"
        class="grid grid-cols-2 gap-8 sm:grid-cols-3"
      >
        <div
          v-for="column in footer.columns"
          :key="column.label"
        >
          <h2 class="text-sm font-medium">{{ column.label }}</h2>
          <ul class="mt-4 space-y-3">
            <li
              v-for="item in column.children"
              :key="item.to"
            >
              <NuxtLink
                :to="item.to"
                :target="item.target"
                :rel="item.target ? 'noreferrer' : undefined"
                class="text-sm text-muted-foreground hover:text-foreground"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>
