const DEFAULT_CMS_SCRIPT_SRC =
  "https://unpkg.com/decap-cms@3.16.0/dist/decap-cms.js";

const VIRTUAL_MODULE_PREFIX = "\0astro-decap-cms:";

/**
 * @param {Record<string, unknown>} modules
 */
function virtualModules(modules) {
  return {
    name: "astro-decap-cms:virtual-modules",
    enforce: /** @type {const} */ ("pre"),
    resolveId(/** @type {string} */ id) {
      return Object.hasOwn(modules, id) ? `${VIRTUAL_MODULE_PREFIX}${id}` : null;
    },
    load(/** @type {string} */ id) {
      if (!id.startsWith(VIRTUAL_MODULE_PREFIX)) return null;

      const moduleId = id.slice(VIRTUAL_MODULE_PREFIX.length);
      if (!Object.hasOwn(modules, moduleId)) return null;

      const module = modules[moduleId];
      return typeof module === "string"
        ? module
        : `export default ${JSON.stringify(module)}`;
    },
  };
}

/**
 * @param {string[]} dependencies
 */
function optimizeServerDependencies(dependencies) {
  return {
    name: "astro-decap-cms:optimize-server-dependencies",
    configEnvironment(/** @type {string} */ name) {
      if (name !== "ssr") return;

      return {
        optimizeDeps: {
          include: dependencies,
        },
      };
    },
  };
}

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
        };

        const virtualModule = {
          cmsConfig: modifiedCmsConfig,
          cmsScriptSrc,
        };

        updateConfig({
          vite: {
            plugins: [
              virtualModules(
                injectOAuthRoute
                  ? {
                      "virtual:astro-decap-cms": virtualModule,
                      "virtual:astro-decap-cms-oauth": `export default ${astroDecapConfig.getEnvObjectFromRequestContext.toString()}`,
                    }
                  : {
                      "virtual:astro-decap-cms": virtualModule,
                    }
              ),
              ...(injectOAuthRoute
                ? [
                    optimizeServerDependencies([
                      "astro-decap/src/oauth/index.ts",
                      "astro-decap/src/oauth/callback.ts",
                    ]),
                  ]
                : []),
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
