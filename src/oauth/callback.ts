import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect, locals }) => {
  const { env } = locals.runtime;

  const data = {
    code: url.searchParams.get("code"),
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
  };

  let script;

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Decap-CMS-Oauth",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();

    const content = {
      token: body.access_token,
      provider: "github",
    };

    script = `
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:${content.provider}:success:${JSON.stringify(
      content
    )}',
            message.origin
          );

          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        window.opener.postMessage("authorizing:${content.provider}", "*");
      </script>
    `;

    return new Response(script, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.log(err);
    return redirect("/?error=😡");
  }
};
