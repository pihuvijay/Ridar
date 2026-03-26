import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: [ "js/recommended" ],
    rules: {
      "no-alert": "warn",
      "no-array-constructor": "warn",
      "no-caller": "warn",
      "no-catch-shadow": "warn",
      "no-eval": "warn",
      "no-extend-native": "warn",
      "no-extra-bind": "warn",
      "no-implied-eval": "warn",
      "no-iterator": "warn",
      "no-label-var": "warn",
      "no-labels": "warn",
      "no-lone-blocks": "warn",
      "no-loop-func": "warn",
      "no-multi-spaces": "warn",
      "no-multi-str": "warn",
      "no-native-reassign": "warn",
      "no-new": "warn",
      "no-new-func": "warn",
      "no-new-object": "warn",
      "no-new-wrappers": "warn",
      "no-octal-escape": "warn",
      "no-process-exit": "warn",
      "no-proto": "warn",
      "no-return-assign": "warn",
      "no-script-url": "warn",
      "no-sequences": "warn",
      "no-shadow": "warn",
      "no-shadow-restricted-names": "warn",
      "no-spaced-func": "warn",
      "no-trailing-spaces": "warn",
      "no-undef-init": "warn",
      "no-underscore-dangle": "warn",
      "no-unused-expressions": "warn",
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-empty": "warn",
      "no-use-before-define": "warn",
      "no-with": "warn",
      "camelcase": "warn",
      "comma-spacing": "warn",
      "consistent-return": "warn",
      "curly": ["warn", "all"],
      "dot-notation": ["warn", { "allowKeywords": true }],
      "eol-last": "warn",
      "no-extra-parens": ["warn", "functions"],
      "eqeqeq": "warn",
      "key-spacing": ["warn", { "beforeColon": false, "afterColon": true }],
      "new-cap": "warn",
      "new-parens": "warn",
      "quotes": ["warn", "double"],
      "semi": "warn",
      "semi-spacing": ["warn", { "before": false, "after": true }],
      "space-infix-ops": "warn",
      "keyword-spacing": "warn",
      "space-unary-ops": ["warn", { "words": true, "nonwords": false }],
      "strict": ["warn", "function"],
      "yoda": ["warn", "never"]

    },
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
    },
    settings: {
      react: {
        version: "20",
      },
    },
  },

]);