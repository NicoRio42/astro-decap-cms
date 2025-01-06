/*
Adapted https://github.com/sveltia/sveltia-cms-auth/tree/main for Astro JS
*/

/**
 * List of supported OAuth providers.
 */
export const supportedProviders = ["github", "gitlab"];
/**
 * Escape the given string for safe use in a regular expression.
 * @param {string} str - Original string.
 * @returns {string} Escaped string.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
 */
export const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const outputHTML = ({
  provider = "unknown",
  token,
  error,
  errorCode,
}: {
  provider?: string;
  token?: string;
  error?: string;
  errorCode?: string;
}): Response => {
  const state = error ? "error" : "success";
  const content = error ? { provider, error, errorCode } : { provider, token };

  return new Response(
    `
      <!doctype html><html><body><script>
        (() => {
          window.addEventListener('message', ({ data, origin }) => {
            if (data === 'authorizing:${provider}') {
              window.opener?.postMessage(
                'authorization:${provider}:${state}:${JSON.stringify(content)}',
                origin
              );
            }
          });
          window.opener?.postMessage('authorizing:${provider}', '*');
        })();
      </script></body></html>
    `,
    {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        // Delete CSRF token
        "Set-Cookie": `csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure`,
      },
    }
  );
};
