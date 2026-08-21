import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.ts"],
      // e2e/ holds the Playwright suite, which brings its own runner and a real
      // browser. Vitest would collect those specs and fail on `@playwright/test`.
      // Run them with `npm run e2e` instead.
      exclude: ["node_modules/**", "dist/**", "e2e/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "json-summary"],
        exclude: [
          "src/assets/**", //all static images (these cannot be tested and take up space in reports)
          "src/components/**/*.svg", //all inline SVG components (these cannot be tested and take up space in reports)
        ],
      },
    },
  }),
);
