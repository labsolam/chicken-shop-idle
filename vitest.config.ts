import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src/engine"),
      "@ui": resolve(__dirname, "src/ui"),
      "@types": resolve(__dirname, "src/types"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
