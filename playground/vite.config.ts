import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue(), ...(command === "serve" ? [vueDevTools()] : []), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "akaza-ui": fileURLToPath(
        new URL("../packages/akaza-ui/src/index.ts", import.meta.url),
      ),
    },
  },
}));
