import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ redirect, locals }) => {
  const { env } = locals.runtime;

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user`;

  return redirect(authUrl);
};
