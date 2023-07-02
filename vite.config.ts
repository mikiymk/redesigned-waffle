import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { default as merge } from "deepmerge";
import { defineConfig } from "vite";
import { default as solidPlugin } from "vite-plugin-solid";

import type { UserConfig } from "vite";

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-disable-next-line import/no-unused-modules
export default defineConfig(({ mode }) => {
  const common: UserConfig = {
    base: "/ts-page-template/",

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    plugins: [solidPlugin(), vanillaExtractPlugin()],

    resolve: {
      alias: [{ find: /^@\/(.*)/, replacement: resolve(__dirname, "$1") }],
    },
  };

  if (mode === "lib") {
    const libraryConfig: UserConfig = {
      build: {
        lib: {
          entry: resolve(__dirname, "lib/main.ts"),
          name: "TsPageTemplate",
          fileName: "template",
          formats: ["es", "cjs"],
        },
      },
    };

    return merge(common, libraryConfig);
  }

  const pagesConfig: UserConfig = {
    build: {
      outDir: "pages",
    },
  };

  return merge(common, pagesConfig);
});
