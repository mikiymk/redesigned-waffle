import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  unicorn.configs["flat/recommended"],
  vitest.configs.recommended,
  jsdoc.configs["flat/recommended-typescript"],
  prettier,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: "./",
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/consistent-type-imports": "error",

      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",

      "jsdoc/require-jsdoc": "off",
    },
  },
);
