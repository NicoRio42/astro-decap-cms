import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import decapCms from "astro-decap-cms";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    mdx(),
    sitemap(),
    decapCms({
      cmsConfig: {
        backend: { name: "gitlab", repo: "test/test" },
        media_folder: "./src/media",

        collections: [
          {
            name: "test",
            label: "Test",
            fields: [{ name: "toto", label: "Toto", widget: "string" }],
          },
        ],
      },
    }),
  ],
});
