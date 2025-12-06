import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
};

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: sharedGlobals,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React Hooks - CRITICAL: Must be enabled
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn", // Re-enabled: Prevents stale closures

      // React Refresh
      "react-refresh/only-export-components": "off",

      // TypeScript - Gradually increasing strictness
      "@typescript-eslint/no-explicit-any": "warn", // Re-enabled: Promotes type safety
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }], // Re-enabled: Keeps code clean
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/ban-ts-comment": "warn", // Re-enabled: Prevents bypassing TS
      "@typescript-eslint/no-empty-object-type": "off",

      // General JavaScript
      "no-case-declarations": "warn",
      "prefer-const": "warn", // Re-enabled: Better code quality
      "no-useless-escape": "warn",
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: sharedGlobals,
    },
  },
  {
    files: ["tests/**/*.{ts,tsx,js,jsx,mjs}"],
    languageOptions: {
      globals: {
        ...sharedGlobals,
        ...globals.jest,
      },
    },
  },
  {
    files: ["supabase/functions/**/*.{ts,tsx}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.deno,
      },
    },
  },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
);
