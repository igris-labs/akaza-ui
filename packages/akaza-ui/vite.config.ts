import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      outDir: "dist/types",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: {
        "akaza-ui": resolve(__dirname, "src/index.ts"),
        nuxt: resolve(__dirname, "src/nuxt.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue", "@nuxt/kit"],
      output: {
        // Keep color conversions removable from applications importing unrelated controls.
        manualChunks(id) {
          if (id.includes("/node_modules/culori/")) return "color-conversion";
        },
        globals: {
          vue: "Vue",
        },
        preserveModules: false,
      },
    },
    sourcemap: true,
    minify: false,
  },
});
