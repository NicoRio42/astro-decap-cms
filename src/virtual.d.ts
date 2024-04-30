declare module "virtual:astro-decap-cms" {
  import type { CmsConfig } from "decap-cms-core";

  const virtualModule: { cmsConfig: CmsConfig; cmsScriptSrc: string };

  export default virtualModule;
}
