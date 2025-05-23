import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  // Ignore build and dependency directories
  { ignores: ["**/.next/**", "**/node_modules/**", "**/coverage/**"] },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { "unused-imports": unusedImports },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tsPlugin, "unused-imports": unusedImports },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        // tsconfigRootDir must be project root; use process.cwd()
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: globals.browser
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }]
    }
  }
]);