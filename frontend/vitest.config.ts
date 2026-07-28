import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "src/assets/**",  //all static images (these cannot be tested and take up space in reports)
          'src/components/**/*.svg', //all inline SVG components (these cannot be tested and take up space in reports)
        ]
      },
    },
  }),
);
