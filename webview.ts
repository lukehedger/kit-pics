import { Webview } from "webview-bun";

const port = Number(process.env.PORT ?? 3030);

const buildApp = async () => {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "browser",
    format: "esm",
    minify: false,
  });
  if (!result.success) {
    throw new Error("Build failed: " + result.logs.map((l) => l.message).join("\n"));
  }
  return await result.outputs[0]!.text();
};

const staticRoutes: Record<string, string> = {
  "/style.css": "./src/style.css",
  "/swipe-left.svg": "./src/swipe-left.svg",
  "/swipe-right.svg": "./src/swipe-right.svg",
};

const spaRoutes = new Set(["/", "/about", "/about/", "/stats", "/stats/"]);

const bundled = await buildApp();

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.includes("..")) {
      return new Response("Forbidden", { status: 403 });
    }

    if (pathname === "/app.js") {
      return new Response(bundled, {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    const staticSrc = staticRoutes[pathname];
    if (staticSrc) return new Response(Bun.file(staticSrc));

    const publicFile = Bun.file("./public" + pathname);
    if (await publicFile.exists()) return new Response(publicFile);

    if (spaRoutes.has(pathname)) {
      return new Response(Bun.file("./index.html"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

const url = `http://localhost:${server.port}`;
console.log(`kit-pics webview serving at ${url}`);

const webview = new Webview();
webview.title = "Kit Pics";
webview.size = { width: 420, height: 760, hint: 0 };
webview.navigate(url);
webview.run();

server.stop();
process.exit(0);
