// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/content",
    "nuxt-og-image",
    "nuxt-llms",
    "akaza-ui/nuxt",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  content: {
    build: {
      markdown: {
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
    provider: "iconify",
  },

  llms: {
    domain: "https://akaza-ui.com/",
    title: "Akaza UI",
    description: "Headless, accessible Vue components with a Vue-native slots API.",
    full: {
      title: "Akaza UI — Full Documentation",
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
        title: "Components",
        contentCollection: "docs",
        contentFilters: [{ field: "path", operator: "LIKE", value: "/components%" }],
      },
    ],
  },

});
