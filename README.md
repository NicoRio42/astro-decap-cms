# Yet another Astro Decap CMS integration

Astro Decap is an Astro integration to simplify the usage of [Deacap CMS](https://decapcms.org/) in your Astro projects.

Features:

- Automatically mount the Decap CMS admin dashboard on the /admin route
- Define your Decap CMS config with Javascript instead of YAML, for better type safety and code reusability
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) compatible, by providing your own cms script src

Roadmap:

- Automatic generation of astro content collections schemas
- OAuth endpoints to use Decap CMS without Netlify Identity.

## Installation

```bash
npx astro add astro-decap

```

Or manually install.

```bash
npm install astro-decap
```

And add the integration to your `astro.config.mjs` file.

```js
import { defineConfig } from "astro/config";
import decapCms from "astro-decap";

export default defineConfig({
    ...,
    integrations: [decapCms()],
});
```

## Usage

Define your Decap CMS config ([see reference](https://decapcms.org/docs/configuration-options/)):

```js
import { defineConfig } from "astro/config";
import decapCms from "astro-decap";

export default defineConfig({
    ...,
    integrations: [decapCms({
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
    })],
});
```

You can provide a custom `cmsScriptSrc` option, for exemple if you want to use Sveltia CMS instead of Decap CMS:

```js
import { defineConfig } from "astro/config";
import decapCms from "astro-decap";

export default defineConfig({
    ...,
    integrations: [decapCms({
      cmsConfig: {...},
      cmsScriptSrc: "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"
    })],
});
```
