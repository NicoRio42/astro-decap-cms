import virtual from "vite-plugin-virtual";

/**
 *
 * @param {{cmsConfig: import('decap-cms-core').CmsConfig}} param0
 * @returns {import("astro").AstroIntegration}
 */
export default function decapCMS({ cmsConfig }) {
  return {
    name: "astro-decap-cms",
    hooks: {
      "astro:config:setup": async ({ injectRoute, config, updateConfig }) => {
        const newConfig = {
          vite: {
            plugins: [
              ...(config.vite?.plugins || []),
              virtual({
                "virtual:astro-decap-cms-config": {
                  ...cmsConfig,
                  load_config_file: false,
                },
              }),
            ],
          },
        };

        updateConfig(newConfig);

        injectRoute({
          pattern: "/admin",
          entrypoint: "astro-decap-cms/src/admin.astro",
        });
      },
    },
  };
}
