import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "**/*.min.js"],
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
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
  {
    files: ["supabase/functions/**/*.ts"],
    languageOptions: {
      globals: {
        Deno: "readonly",
        Response: "readonly",
        Request: "readonly",
        console: "readonly",
        crypto: "readonly",
        fetch: "readonly",
      },
    },
  },
];
