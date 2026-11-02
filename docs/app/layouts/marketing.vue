<template>
  <div class="min-h-dvh">
    <a
      href="#main-content"
      class="sr-only fixed left-4 top-4 z-50 bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
    >
      Skip to content
    </a>
    <div class="sticky top-0 z-30"><AppHeader /></div>
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
