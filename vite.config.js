import { resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./powa/static/js", import.meta.url)),
    },
  },
  build: {
    manifest: true,
    outDir: resolve(__dirname, "powa/static/dist"),
    rollupOptions: {
      input: "/powa/static/js/main.js",
      output: {
        manualChunks: {
          // Split external library from transpiled code.
          d3: ["d3"],
          grafana: ["@grafana/data"],
          lodash: ["lodash"],
          vue: ["vue"],
          vuetify: ["vuetify"],
          luxon: ["luxon"],
          highlight: ["highlight.js"],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: [
          '@import "./powa/static/styles/variables"',
          '@import "./powa/static/styles/main"',
          "", // end with new line
        ].join("\n"),
      },
    },
  },
});
