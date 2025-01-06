# Yet another Astro Decap CMS integration

Astro Decap is an Astro integration to simplify the usage of [Deacap CMS](https://decapcms.org/) in your Astro projects.

Features:

- Automatically mount the Decap CMS admin dashboard on the /admin route
- Define your Decap CMS config with Javascript instead of YAML, for better type safety and code reusability
- Github OAuth endpoints to use Decap CMS without Netlify Identity.

Roadmap:

- Automatic generation of astro content collections schemas
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) compatible, by providing your own cms script src

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
    integrations: [decapCms({...})],
});
```

## Usage

### Configuring Decap CMS

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

### Github OAuth endpoints

The Astro Decap integration can setup API endpoints to let your admin users log in to your admin dashboard with Github OAuth (without Netlify Identity).

#### Step 1: Add Astro Adapter with server capabilities

You have to install an Astro Adapter with server capabilities (Cloudflare, Vercel...):

```bash
npx astro add cloudflare
```

#### Step 2: Update Astro Decap config

Set the `injectOAuthRoute` option to `true` in your Astro Decap config object. You also have to provide a `getEnvObjectFromRequestContext` callback: it will be used in the OAuth API endpoints to access `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables. Check your adapter's documentation to defined how you can get environment variables from request context object.

```js
import { defineConfig } from "astro/config";
import decapCms from "astro-decap";

export default defineConfig({
    ...,
    integrations: [decapCms({
      cmsConfig: {...},
      injectOAuthRoute: true,
      getEnvObjectFromRequestContext: ({ locals }) => locals.runtime.env,
    })],
});
```

### Step 3: Register a new Github OAuth application

[Register a new OAuth application](https://github.com/settings/applications/new) on GitHub ([details](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)) with the following properties:

- Application name: whatever you want
- Homepage URL: whatever you want
- Application description: (can be left empty)
- Authorization callback URL: `<YOUR_WEBSITE_URL>/oauth/callback`

Once registered, click on the **Generate a new client secret** button. The app’s **Client ID** and **Client Secret** will be displayed. We’ll use them in Step 4 below.

#### Step 4: Add environment variables to your host

Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables to your host. For exemple, on Cloudflare, on the Cloudflare dashboard, select **Settings** > **Variables**, and add the following Environment Variables to your worker ([details](https://developers.cloudflare.com/workers/platform/environment-variables/#environment-variables-via-the-dashboard)):

<!-- You can provide a custom `cmsScriptSrc` option, for exemple if you want to use Sveltia CMS instead of Decap CMS:

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
``` -->
