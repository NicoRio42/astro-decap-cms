import virtual from "vite-plugin-virtual";

const DEFAULT_CMS_SCRIPT_SRC =
  "https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js";

/**
 * @param {import("./types.js").DecapCmsIntegrationOptions} astroDecapConfig
 * @returns {import("astro").AstroIntegration}
 */
export default function decapCMS(astroDecapConfig) {
  return {
    name: "astro-decap-cms",
    hooks: {
      "astro:config:setup": async ({ injectRoute, updateConfig }) => {
        const {
          cmsConfig,
          cmsScriptSrc = DEFAULT_CMS_SCRIPT_SRC,
          injectOAuthRoute,
        } = astroDecapConfig;

        /** @type {import("./types.js").CmsConfig} */
        const modifiedCmsConfig = {
          ...cmsConfig,
          load_config_file: false,
          toto: "toto",
        };

        const virtualModule = {
          cmsConfig: modifiedCmsConfig,
          cmsScriptSrc,
          getEnvObjectFromRequestContext: injectOAuthRoute
            ? astroDecapConfig.getEnvObjectFromRequestContext
            : () => {
                {
                }
              },
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

        if (!injectOAuthRoute) return;

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
