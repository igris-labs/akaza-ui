export default defineAppConfig({
  ui: {
    colors: {
      neutral: "zinc",
    },
    footer: {
      slots: {
        root: "border-t border-default",
        left: "text-sm text-muted",
      },
    },
  },
  seo: {
    siteName: "Akaza UI Docs",
  },
  header: {
    title: "Akaza UI",
    to: "/",
    logo: {
      alt: "",
      light: "/logo-light.svg",
      dark: "/logo-dark.svg",
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/igris-labs/akaza-ui",
        target: "_blank",
        "aria-label": "GitHub",
      },
    ],
  },
  footer: {
    credits: `© ${new Date().getFullYear()} Akaza UI`,
    description: "A Vue-native headless UI library built from scratch for Vue 3. Accessible, unstyled, and slot-based.",
    tagline: "Built for Vue. Not ported to it.",
    colorMode: true,
    columns: [
      {
        label: "Documentation",
        children: [
          {
            label: "Getting Started",
            to: "/getting-started",
          },
          {
            label: "Styling",
            to: "/getting-started/styling",
          },
          {
            label: "Components",
            to: "/components",
          },
          {
            label: "Usage",
            to: "/getting-started/usage",
          },
          {
            label: "Playground",
            to: "https://playground.akaza-ui.com/",
            target: "_blank",
          },
        ],
      },
      {
        label: "Ecosystem",
        children: [
          {
            label: "Inspira UI",
            to: "https://inspira-ui.com",
            target: "_blank",
          },
          {
            label: "Inspira UI Pro",
            to: "https://pro.inspira-ui.com",
            target: "_blank",
          },
        ],
      },
      {
        label: "Created by",
        children: [
          {
            label: "Rahul Vashishtha",
            to: "https://rahulv.dev",
            target: "_blank",
          },
          {
            label: "Igris Labs",
            to: "https://github.com/igris-labs",
            target: "_blank",
          },
        ],
      },
    ],
    links: [
      {
        icon: "i-simple-icons-x",
        to: "https://x.com/rahulv_dev",
        target: "_blank",
        "aria-label": "Akaza UI on X",
      },
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/igris-labs/akaza-ui",
        target: "_blank",
        "aria-label": "Akaza UI on GitHub",
      },
    ],
  },
  toc: {
    title: "Table of Contents",
    bottom: {
      title: "Community",
      edit: "https://github.com/igris-labs/akaza-ui",
      links: [
        {
          icon: "i-lucide-star",
          label: "Star on GitHub",
          to: "https://github.com/igris-labs/akaza-ui",
          target: "_blank",
        },
      ],
    },
  },
});
