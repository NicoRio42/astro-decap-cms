# Yet another Astro Decap CMS integration

Astro Decap is an Astro integration to simplify the usage of [Decap CMS](https://decapcms.org/) in your Astro projects.

The integration loads Decap CMS 3.16.0 by default. You can override the CMS
bundle with the `cmsScriptSrc` integration option.

Features:

- Automatically mount the Decap CMS admin dashboard on the /admin route
- Define your Decap CMS config with Javascript instead of YAML, for better type safety and code reusability
- Github OAuth endpoints to use Decap CMS without Netlify Identity.

Roadmap:

- Automatic generation of astro content collections schemas
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) compatible, by providing your own cms script src

## Installation

```bash
bunx astro add astro-decap
```

Or manually install.

```bash
bun add astro-decap
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
bunx astro add cloudflare
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
      getEnvObjectFromRequestContext: async () =>
        (await import("cloudflare:workers")).env,
    })],
});
```

The Cloudflare example uses the runtime environment API introduced with Astro 6.
For another adapter, return its environment object from the callback instead.

### Step 3: Register a new Github OAuth application

[Register a new OAuth application](https://github.com/settings/applications/new) on GitHub ([details](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)) with the following properties:

- Application name: whatever you want
- Homepage URL: whatever you want
- Application description: (can be left empty)
- Authorization callback URL: `<YOUR_WEBSITE_URL>/oauth/callback`

Once registered, click on the **Generate a new client secret** button. The app’s **Client ID** and **Client Secret** will be displayed. We’ll use them in Step 4 below.

#### Step 4: Add environment variables to your host

Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables to your host. For exemple, on Cloudflare, on the Cloudflare dashboard, select **Settings** > **Variables**, and add the following Environment Variables to your worker ([details](https://developers.cloudflare.com/workers/platform/environment-variables/#environment-variables-via-the-dashboard)):

## Publishing to npm

The [`publish.yml`](.github/workflows/publish.yml) GitHub Actions workflow stages
the package on npm when a GitHub Release is published. It uses [npm trusted
publishing](https://docs.npmjs.com/trusted-publishers/) with OpenID Connect
(OIDC), so no npm access token is stored in GitHub. A maintainer must review and
approve the staged package with two-factor authentication before it becomes
public.

### Configure trusted publishing

First, commit this workflow and push it to the repository's default branch. The
package must already exist on npm before a trusted publisher can be added. As an
npm package owner, open **Packages > astro-decap > Settings > Trusted Publisher**,
select **GitHub Actions**, and enter:

- Organization or user: `NicoRio42`
- Repository: `astro-decap-cms`
- Workflow filename: `publish.yml`
- Environment name: leave blank
- Allowed actions: leave `npm publish` disabled; `npm stage publish` is enabled
  automatically

The workflow filename is case-sensitive and must be entered without the
`.github/workflows/` prefix. No `NPM_TOKEN` repository secret is needed. The
workflow uses a GitHub-hosted runner and grants only `contents: read` and
`id-token: write`, the latter of which lets npm authenticate the workflow via
OIDC.

After confirming that trusted publishing works, open the package's **Settings >
Publishing access** and select **Require two-factor authentication and disallow
tokens**. Trusted publishing continues to work with that setting.

### Publish a release

1. Update `version` in `package.json` to a version that has not been published.
2. Commit and push the change to GitHub.
3. Create a GitHub Release whose tag is `v` followed by the package version,
   for example `v0.4.0`.
4. Publish the release. GitHub Actions will build the package and submit it to
   npm's staging area.
5. Open the **Staged Packages** tab on npmjs.com, review the package, and approve
   it with two-factor authentication. You can also review and approve it from
   the command line with `npm stage view <stage-id>` and
   `npm stage approve <stage-id>`.

The workflow stops before staging if the release tag does not exactly match the
version in `package.json`. Once approved, successful trusted publishes from
a public repository automatically include npm provenance attestations. See the
[npm staged publishing documentation](https://docs.npmjs.com/staged-publishing/)
for additional review commands.

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
