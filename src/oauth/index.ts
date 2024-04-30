import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ redirect, locals, site }) => {
  const { env } = locals.runtime;

  const redirectUri = encodeURI(`${site?.toString()}oauth/callback`);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo+user&redirect_uri=${redirectUri}`;

  return redirect(authUrl);
};
