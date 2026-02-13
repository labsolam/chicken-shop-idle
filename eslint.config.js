import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * AGENT CONTEXT: Flat config format (ESLint v9+).
 * - typescript-eslint for type-aware linting
 * - eslint-config-prettier disables rules that conflict with Prettier
 * - Ignores dist/ and node_modules/
 */
export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
