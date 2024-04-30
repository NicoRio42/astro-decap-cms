import mdx from "@astrojs/mdx";
import decapCms from "astro-decap";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    mdx(),
    sitemap(),
    decapCms({
      cmsConfig: {
        local_backend: import.meta.env.MODE === "development",
        backend: { name: "gitlab", repo: "test/test" },
        media_folder: "public",
        public_folder: "/",

        collections: [
          {
            label: "Blog posts",
            name: "blog",
            folder: "src/content/blog",
            fields: [
              { name: "title", label: "Title", widget: "string" },
              { name: "description", label: "Description", widget: "text" },
              {
                name: "pubDate",
                label: "Publication date",
                widget: "datetime",
              },
              {
                name: "updatedDate",
                label: "Updated date",
                widget: "datetime",
                required: false,
              },
              {
                name: "heroImage",
                label: "Hero image",
                widget: "image",
                required: false,
              },
              { name: "body", widget: "markdown" },
            ],
          },
        ],
      },
    }),
  ],
});
