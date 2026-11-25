import { defineConfig } from "vitest/config";

// The parser is plain TypeScript, so tests don't need Astro's Vite config.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
