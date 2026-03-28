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
    credits: `© ${new Date().getFullYear()} - Igris Labs`,
    colorMode: false,
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
