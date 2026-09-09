import { describe, expect, test } from "bun:test";

import decapCMS from "../src/index.js";

function getVirtualOAuthModule(options) {
  let vitePlugin;

  const integration = decapCMS({
    cmsConfig: {},
    injectOAuthRoute: true,
    ...options,
  });

  integration.hooks["astro:config:setup"]({
    injectRoute() {},
    updateConfig(config) {
      [vitePlugin] = config.vite.plugins;
    },
  });

  const id = "virtual:astro-decap-cms-oauth";
  return vitePlugin.load(vitePlugin.resolveId(id));
}

function evaluateDefaultExport(source) {
  const exportPrefix = "export default ";
  expect(source.startsWith(exportPrefix)).toBe(true);
  return new Function(`return (${source.slice(exportPrefix.length)})`)();
}

describe("OAuth environment", () => {
  test("defaults to process.env when no callback is configured", () => {
    const source = getVirtualOAuthModule();
    const getEnvObjectFromRequestContext = evaluateDefaultExport(source);

    expect(getEnvObjectFromRequestContext({})).toBe(process.env);
  });

  test("uses the configured request context callback", () => {
    const source = getVirtualOAuthModule({
      getEnvObjectFromRequestContext: (context) => context.locals.runtime.env,
    });
    const getEnvObjectFromRequestContext = evaluateDefaultExport(source);
    const env = { GITHUB_CLIENT_ID: "client-id" };

    expect(
      getEnvObjectFromRequestContext({ locals: { runtime: { env } } })
    ).toBe(env);
  });
});
