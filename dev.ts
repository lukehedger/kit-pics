const port = Number(process.env.PORT ?? 3000);

const buildApp = async () => {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "browser",
    format: "esm",
    sourcemap: "inline",
  });
  if (!result.success) {
    const messages = result.logs.map((l) => l.message).join("\n");
    throw new Error(`Build failed: ${messages}`);
  }
  return await result.outputs[0]!.text();
};

const staticRoutes: Record<string, string> = {
  "/style.css": "./src/style.css",
  "/swipe-left.svg": "./src/swipe-left.svg",
  "/swipe-right.svg": "./src/swipe-right.svg",
};

const spaRoutes = new Set(["/", "/about", "/about/", "/stats", "/stats/"]);

const server = Bun.serve({
  port,
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.includes("..")) {
      return new Response("Forbidden", { status: 403 });
    }

    if (pathname === "/app.js") {
      try {
        const code = await buildApp();
        return new Response(code, {
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      } catch (err) {
        console.error(err);
        return new Response(String(err), { status: 500 });
      }
    }

    const staticSrc = staticRoutes[pathname];
    if (staticSrc) {
      return new Response(Bun.file(staticSrc));
    }

    const publicFile = Bun.file("./public" + pathname);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    if (spaRoutes.has(pathname)) {
      return new Response(Bun.file("./index.html"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`kit-pics dev server: http://localhost:${server.port}`);
