import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ redirect, locals, url }) => {
  const { env } = locals.runtime;

  const redirectUri = encodeURI(`${url.toString()}/callback`);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user&redirect_uri=${redirectUri}`;

  return redirect(authUrl);
};
