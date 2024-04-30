import virtual from "vite-plugin-virtual";

const DEFAULT_CMS_SCRIPT_SRC =
  "https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js";

/**
 * @param {import("./types.js").DecapCmsIntegrationOptions} param0
 * @returns {import("astro").AstroIntegration}
 */
export default function decapCMS({
  cmsConfig,
  cmsScriptSrc = DEFAULT_CMS_SCRIPT_SRC,
}) {
  return {
    name: "astro-decap-cms",
    hooks: {
      "astro:config:setup": async ({ injectRoute, updateConfig, config }) => {
        /** @type {import("decap-cms-core").CmsConfig} */
        const modifiedCmsConfig = {
          ...cmsConfig,
          load_config_file: false,
          backend: { ...cmsConfig.backend, base_url: config.site?.toString() },
        };

        const virtualModule = {
          cmsConfig: modifiedCmsConfig,
          cmsScriptSrc,
        };

        updateConfig({
          vite: {
            plugins: [
              virtual({
                "virtual:astro-decap-cms": virtualModule,
              }),
            ],
          },
        });

        injectRoute({
          pattern: "/admin",
          entrypoint: "astro-decap/src/admin.astro",
        });

        injectRoute({
          pattern: "/oauth",
          entrypoint: "astro-decap/src/oauth/index.ts",
        });

        injectRoute({
          pattern: "/oauth/callback",
          entrypoint: "astro-decap/src/oauth/callback.ts",
        });
      },
    },
  };
}
