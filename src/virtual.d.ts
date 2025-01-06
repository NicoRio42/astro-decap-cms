declare module "virtual:astro-decap-cms" {
  const virtualModule: {
    cmsConfig: import("./types.ts").CmsConfig;
    cmsScriptSrc: string;
    getEnvObjectFromRequestContext: import("./types.ts").GetEnvObjectFromRequestContext;
  };

  export default virtualModule;
}
