import { expect, test } from "bun:test";
import { createServer } from "node:net";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const demoRoot = path.join(repositoryRoot, "demo");
const viteCache = path.join(demoRoot, "node_modules", ".vite");

async function getAvailablePort() {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not reserve a port for the Astro dev server");
  }

  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );

  return address.port;
}

async function waitForServer(logs, hasExited) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (hasExited()) {
      throw new Error(`Astro exited before it started.\n${logs()}`);
    }

    if (/Local\s+http:\/\/127\.0\.0\.1:/i.test(logs())) return;

    await Bun.sleep(50);
  }

  throw new Error(`Timed out waiting for Astro to start.\n${logs()}`);
}

async function collectOutput(stream, append) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    append(decoder.decode(value, { stream: true }));
  }

  append(decoder.decode());
}

test(
  "Cloudflare dev survives requests to injected routes with a cold Vite cache",
  async () => {
    const astroPackage = await Bun.file(
      path.join(demoRoot, "node_modules", "astro", "package.json")
    ).json();
    const vitePackage = await Bun.file(
      path.join(demoRoot, "node_modules", "vite", "package.json")
    ).json();
    expect(astroPackage.version).toMatch(/^7\./);
    expect(vitePackage.version).toMatch(/^8\./);

    await rm(viteCache, { recursive: true, force: true });

    const port = await getAvailablePort();
    const astroCli = path.join(
      repositoryRoot,
      "node_modules",
      "astro",
      "bin",
      "astro.mjs"
    );
    let output = "";
    let exited = false;
    const astroProcess = Bun.spawn(
      ["node", astroCli, "dev", "--host", "127.0.0.1", "--port", `${port}`],
      {
        cwd: demoRoot,
        env: {
          ...process.env,
          ASTRO_DEV_BACKGROUND: "1",
          ASTRO_TELEMETRY_DISABLED: "1",
        },
        stdout: "pipe",
        stderr: "pipe",
      }
    );
    const appendOutput = (chunk) => {
      output += chunk;
    };
    const stdout = collectOutput(astroProcess.stdout, appendOutput);
    const stderr = collectOutput(astroProcess.stderr, appendOutput);
    void astroProcess.exited.then(() => {
      exited = true;
    });

    try {
      await waitForServer(
        () => output,
        () => exited
      );

      const baseUrl = `http://127.0.0.1:${port}`;
      const responses = await Promise.all([
        fetch(`${baseUrl}/admin`),
        fetch(`${baseUrl}/oauth?provider=github&site_id=127.0.0.1`, {
          redirect: "manual",
        }),
        fetch(`${baseUrl}/oauth/callback?code=test&state=test`, {
          redirect: "manual",
        }),
      ]);

      expect(responses[0].status).toBe(200);
      expect([200, 302]).toContain(responses[1].status);
      expect(responses[2].status).toBe(200);
      await Promise.all(responses.map((response) => response.text()));
      await Bun.sleep(1_000);

      const followUpResponse = await fetch(`${baseUrl}/admin`);
      expect(followUpResponse.status).toBe(200);
      await followUpResponse.text();
      await Bun.sleep(100);

      expect(exited).toBe(false);
      // Cloudflare can perform one initial framework optimization. The
      // regression is a cascade or late discovery of this plugin's routes.
      const optimizerReloads =
        output.match(/optimized dependencies changed\. reloading/gi) ?? [];
      expect(optimizerReloads.length).toBeLessThanOrEqual(1);
      expect(output).not.toMatch(/dependency optimized:[^\n]*astro-decap/i);
      expect(output).not.toMatch(/deps_ssr/i);
    } finally {
      if (!exited) astroProcess.kill();
      await astroProcess.exited;
      await Promise.all([stdout, stderr]);
    }
  },
  45_000
);
