# Akaza UI documentation

Nuxt Content documentation and a live component landing page, using IPEX's styled Akaza UI foundation. The `akaza-ui` dependency resolves to the current package in this workspace.

From the repository root:

```sh
pnpm install
pnpm dev:docs
```

Documentation lives in `content/`; existing routes and live examples are preserved. The app shell, search dialog, navigation, themes, page actions, and controls use Akaza UI through the copied IPEX wrappers in `app/components/ui/`. Shared semantic tokens live in `app/assets/css/main.css`. Markdown renderers live in `app/components/prose/`.

```sh
pnpm --dir docs lint
pnpm --dir docs typecheck
pnpm --dir docs build
pnpm --dir docs test
```

Browser tests start a local dev server automatically. Install Chromium with `pnpm --dir docs exec playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium browser. To test a running production build, set `DOCS_BASE_URL` to its URL.

Raw Markdown, LLM documentation, Open Graph images, and the existing MCP routes remain available. No Nuxt UI components, module, or theme stylesheet are used by the app.
