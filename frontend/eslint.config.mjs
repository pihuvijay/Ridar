import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: globals.browser } 
  },
  
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  {
    rules: {
      "no-console": "warn",              // allow logs but warn
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "no-unused-vars": "off",           // turn off base rule (TS handles this)
    },
  },
]);
