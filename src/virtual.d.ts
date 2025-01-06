declare module "virtual:astro-decap-cms" {
  const virtualModule: {
    cmsConfig: import("./types.ts").CmsConfig;
    cmsScriptSrc: string;
  };

  export default virtualModule;
}

declare module "virtual:astro-decap-cms-oauth" {
  const virtualModule: import("./types.ts").GetEnvObjectFromRequestContext;

  export default virtualModule;
}
