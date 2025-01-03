import mdx from "@astrojs/mdx";
import decapCms from "astro-decap";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-decap-cms.pages.dev",
  output: "hybrid",
  integrations: [
    mdx(),
    sitemap(),
    decapCms({
      cmsConfig: {
        backend: {
          name: "github",
          repo: "NicoRio42/astro-decap-cms",
          branch: "main",
          site_domain: "astro-decap-cms.pages.dev",
          base_url: "https://astro-decap-cms.pages.dev",
          auth_endpoint: "oauth",
        },
        media_folder: "public",
        public_folder: "/",
        collections: [
          {
            label: "Blog posts",
            name: "blog",
            folder: "demo/src/content/blog",
            fields: [
              {
                name: "title",
                label: "Title",
                widget: "string",
              },
              {
                name: "description",
                label: "Description",
                widget: "text",
              },
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
              {
                name: "body",
                widget: "markdown",
              },
            ],
          },
        ],
      },
    }),
  ],
  adapter: cloudflare({ platformProxy: { enabled: true } }),
});
