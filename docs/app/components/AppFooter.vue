<script setup lang="ts">
const { footer } = useAppConfig();

interface FooterLink {
  label: string;
  to: string;
  target?: string;
}

function getLinkTarget(link: FooterLink) {
  return link.target;
}

function isExternal(link: FooterLink) {
  return link.target === "_blank";
}
</script>

<template>
  <UFooter
    class="bg-background"
    :ui="{
      top: 'border-b border-default py-0',
      container: 'py-6 lg:py-6',
      center: 'text-sm text-dimmed',
    }"
  >
    <template #top>
      <UContainer class="grid gap-12 py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div class="lg:col-span-5">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-3 text-highlighted"
          >
            <UColorModeImage
              light="/logo-light.svg"
              dark="/logo-dark.svg"
              alt=""
              class="size-6 shrink-0 object-contain"
            />
            <span class="text-base font-semibold">Akaza UI</span>
          </NuxtLink>

          <p class="mt-6 max-w-sm text-sm leading-6 text-muted">
            {{ footer.description }}
          </p>
        </div>

        <nav
          aria-label="Footer"
          class="grid gap-8 sm:grid-cols-3 lg:col-span-7"
        >
          <div
            v-for="column in footer.columns"
            :key="column.label"
          >
            <h2 class="text-sm font-semibold text-highlighted">
              {{ column.label }}
            </h2>

            <ul class="mt-5 border-t border-default">
              <li
                v-for="link in column.children"
                :key="link.label"
                class="border-b border-default"
              >
                <ULink
                  :to="link.to"
                  :target="getLinkTarget(link)"
                  class="group flex min-h-11 items-center justify-between gap-3 text-sm text-muted transition-colors hover:text-highlighted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span>{{ link.label }}</span>
                  <UIcon
                    :name="isExternal(link) ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'"
                    class="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    :class="{
                      'group-hover:-translate-y-0.5': isExternal(link),
                    }"
                    aria-hidden="true"
                  />
                </ULink>
              </li>
            </ul>
          </div>
        </nav>
      </UContainer>
    </template>

    <template #left>
      {{ footer.credits }}
    </template>

    {{ footer.tagline }}

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
