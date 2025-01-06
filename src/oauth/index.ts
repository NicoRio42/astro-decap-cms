import type { APIRoute } from "astro";
import virtualModule from "virtual:astro-decap-cms-oauth";

export const prerender = false;

export const GET: APIRoute = (context) => {
  const env = virtualModule.getEnvObjectFromRequestContext(context);

  const redirectUri = encodeURI(`${context.site?.toString()}oauth/callback`);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user&redirect_uri=${redirectUri}`;

  return context.redirect(authUrl);
};
