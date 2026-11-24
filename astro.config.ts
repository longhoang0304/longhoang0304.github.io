import { defineConfig } from "astro/config";

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://longhoang.me",
  integrations: [sitemap()],
  base: "/",
  trailingSlash: "ignore",
  markdown: {
    // Code is colored for both themes at build time; Prose shows the dark colors in dark mode.
    shikiConfig: {
      themes: { light: "everforest-light", dark: "everforest-dark" },
    },
  },
});