import { defineConfig } from "vite";

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
  base: "/ts-page-template/",

  plugins: [],

  resolve: {
    alias: [{ find: /^@\/(.*)/, replacement: resolve(__dirname, "$1") }],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "TsPageTemplate",
      fileName: "template",
      formats: ["es", "cjs"],
    },
  },
});
