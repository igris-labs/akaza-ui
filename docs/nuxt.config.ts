import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "@nuxt/content",
    "nuxt-og-image",
    "nuxt-llms",
    "akaza-ui/nuxt",
    "nuxt-gtag",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  components: [
    { path: "~/components/prose", pathPrefix: false, global: true },
    { path: "~/components", extensions: ["vue"], ignore: ["prose/**", "ui/**"] },
  ],

  colorMode: { classSuffix: "", preference: "system", fallback: "light" },
  vite: { plugins: [tailwindcss()] },

  content: {
    build: {
      markdown: {
        highlight: false,
        toc: {
          searchDepth: 1,
        },
      },
    },
  },

  experimental: {
    asyncContext: true,
  },

  compatibilityDate: "2024-07-11",

  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },

  eslint: {
    config: {
      stylistic: false,
      formatters: false,
    },
  },

  icon: {
    provider: "none",
    clientBundle: {
      scan: { globInclude: ["app/**/*.{vue,ts}", "content/**/*.{md,yml}"] },
    },
  },

  llms: {
    domain: "https://akaza-ui.com/",
    title: "Akaza UI",
    description: "Headless, accessible Vue components with a Vue-native slots API.",
    full: {
      title: "Akaza UI Documentation",
      description:
        "Complete documentation for Akaza UI, including getting started and all component APIs.",
    },
    sections: [
      {
        title: "Getting Started",
        contentCollection: "docs",
        contentFilters: [{ field: "path", operator: "LIKE", value: "/getting-started%" }],
      },
      {
        title: "Composables",
        contentCollection: "docs",
        contentFilters: [{ field: "path", operator: "LIKE", value: "/composables%" }],
      },
      {
        title: "Components",
        contentCollection: "docs",
        contentFilters: [{ field: "path", operator: "LIKE", value: "/components%" }],
      },
      {
        title: "Builders",
        contentCollection: "docs",
        contentFilters: [{ field: "path", operator: "LIKE", value: "/builders%" }],
      },
    ],
  },
});
