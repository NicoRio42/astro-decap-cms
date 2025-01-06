/*
Adapted https://github.com/sveltia/sveltia-cms-auth/tree/main for Astro JS
*/

import type { APIRoute } from "astro";
import virtualModule from "virtual:astro-decap-cms";
import { outputHTML, supportedProviders } from "./utils.js";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const env = virtualModule.getEnvObjectFromRequestContext(context);
  const { url, headers } = context.request;
  const { origin, searchParams } = new URL(url);
  const { code, state } = Object.fromEntries(searchParams);

  const [, provider, csrfToken] =
    headers.get("Cookie")?.match(/\bcsrf-token=([a-z-]+?)_([0-9a-f]{32})\b/) ??
    [];

  if (!provider || !supportedProviders.includes(provider)) {
    return outputHTML({
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    });
  }

  if (!code || !state) {
    return outputHTML({
      provider,
      error: "Failed to receive an authorization code. Please try again later.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
    });
  }

  if (!csrfToken || state !== csrfToken) {
    return outputHTML({
      provider,
      error: "Potential CSRF attack detected. Authentication flow aborted.",
      errorCode: "CSRF_DETECTED",
    });
  }

  const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_HOSTNAME = "github.com",
    GITLAB_CLIENT_ID,
    GITLAB_CLIENT_SECRET,
    GITLAB_HOSTNAME = "gitlab.com",
  } = env;

  let tokenURL = "";
  let requestBody = {};

  // GitHub
  if (provider === "github") {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return outputHTML({
        provider,
        error: "OAuth app client ID or secret is not configured.",
        errorCode: "MISCONFIGURED_CLIENT",
      });
    }

    tokenURL = `https://${GITHUB_HOSTNAME}/login/oauth/access_token`;
    requestBody = {
      code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
    };
  }

  if (provider === "gitlab") {
    if (!GITLAB_CLIENT_ID || !GITLAB_CLIENT_SECRET) {
      return outputHTML({
        provider,
        error: "OAuth app client ID or secret is not configured.",
        errorCode: "MISCONFIGURED_CLIENT",
      });
    }

    tokenURL = `https://${GITLAB_HOSTNAME}/oauth/token`;
    requestBody = {
      code,
      client_id: GITLAB_CLIENT_ID,
      client_secret: GITLAB_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: `${origin}/callback`,
    };
  }

  let response;
  let token = "";
  let error = "";

  try {
    response = await fetch(tokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch {
    //
  }

  if (!response) {
    return outputHTML({
      provider,
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    });
  }

  try {
    ({ access_token: token, error } = await response.json());
  } catch {
    return outputHTML({
      provider,
      error: "Server responded with malformed data. Please try again later.",
      errorCode: "MALFORMED_RESPONSE",
    });
  }

  return outputHTML({ provider, token, error });
};
