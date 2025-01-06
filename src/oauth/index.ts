/*
Adapted https://github.com/sveltia/sveltia-cms-auth/tree/main for Astro JS
*/

import type { APIRoute } from "astro";
import virtualModule from "virtual:astro-decap-cms";
import { escapeRegExp, outputHTML, supportedProviders } from "./utils.js";

export const prerender = false;

export const GET: APIRoute = (context) => {
  console.log(virtualModule);
  const env = virtualModule.getEnvObjectFromRequestContext(context);
  const { url } = context.request;
  const { origin, searchParams } = new URL(url);
  const { provider, site_id: domain } = Object.fromEntries(searchParams);

  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  const {
    ALLOWED_DOMAINS,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_HOSTNAME = "github.com",
    GITLAB_CLIENT_ID,
    GITLAB_CLIENT_SECRET,
    GITLAB_HOSTNAME = "gitlab.com",
  } = env;

  // Check if the domain is whitelisted
  if (
    ALLOWED_DOMAINS &&
    !ALLOWED_DOMAINS.split(/,/).some((str) =>
      // Escape the input, then replace a wildcard for regex
      (domain ?? "").match(
        new RegExp(`^${escapeRegExp(str.trim()).replace("\\*", ".+")}$`)
      )
    )
  ) {
    return outputHTML({
      provider,
      error: "Your domain is not allowed to use the authenticator.",
      errorCode: "UNSUPPORTED_DOMAIN",
    });
  }

  // Generate a random string for CSRF protection
  const csrfToken = globalThis.crypto.randomUUID().replaceAll("-", "");
  let authURL = "";

  // GitHub
  if (provider === "github") {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return outputHTML({
        provider,
        error: "OAuth app client ID or secret is not configured.",
        errorCode: "MISCONFIGURED_CLIENT",
      });
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: "repo,user",
      state: csrfToken,
    });

    authURL = `https://${GITHUB_HOSTNAME}/login/oauth/authorize?${params.toString()}`;
  }

  // GitLab
  if (provider === "gitlab") {
    if (!GITLAB_CLIENT_ID || !GITLAB_CLIENT_SECRET) {
      return outputHTML({
        provider,
        error: "OAuth app client ID or secret is not configured.",
        errorCode: "MISCONFIGURED_CLIENT",
      });
    }

    const params = new URLSearchParams({
      client_id: GITLAB_CLIENT_ID,
      redirect_uri: `${origin}/callback`,
      response_type: "code",
      scope: "api",
      state: csrfToken,
    });

    authURL = `https://${GITLAB_HOSTNAME}/oauth/authorize?${params.toString()}`;
  }

  // Redirect to the authorization server
  return new Response("", {
    status: 302,
    headers: {
      Location: authURL,
      // Cookie expires in 10 minutes; Use `SameSite=Lax` to make sure the cookie is sent by the
      // browser after redirect
      "Set-Cookie":
        `csrf-token=${provider}_${csrfToken}; ` +
        `HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
    },
  });
};
