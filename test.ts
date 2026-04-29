export {};

const port = Number(process.env.PORT ?? 3131);

const buildApp = async () => {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    target: "browser",
    format: "esm",
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
    if (pathname.includes("..")) return new Response("Forbidden", { status: 403 });
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

const base = `http://localhost:${server.port}`;

const pageErrors: string[] = [];

await using view = new Bun.WebView({
  width: 420,
  height: 760,
  console: (type, ...args) => {
    if (type === "error" || type === "warn") {
      pageErrors.push(`[${type}] ${args.map(String).join(" ")}`);
    }
  },
});

const failures: string[] = [];

const installErrorHook = async () => {
  await view.evaluate(`(() => {
    window.__pageErrors = [];
    window.addEventListener("error", (e) => window.__pageErrors.push(String(e.message ?? e)));
    window.addEventListener("unhandledrejection", (e) => window.__pageErrors.push("unhandled: " + String(e.reason)));
  })()`);
};

const collectInPageErrors = async () => {
  const errs = (await view.evaluate("window.__pageErrors || []")) as string[];
  return errs;
};

const waitFor = async (expr: string, label: string, timeoutMs = 5000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await view.evaluate(expr);
    if (ok) return;
    await Bun.sleep(50);
  }
  throw new Error(`timeout waiting for ${label}`);
};

const check = (cond: boolean, msg: string) => {
  if (!cond) failures.push(msg);
  console.log(`${cond ? "ok" : "FAIL"}  ${msg}`);
};

const run = async (name: string, fn: () => Promise<void>) => {
  console.log(`\n# ${name}`);
  try {
    await fn();
  } catch (err) {
    failures.push(`${name}: ${(err as Error).message}`);
    console.log(`FAIL  ${name}: ${(err as Error).message}`);
  }
};

await run("home route renders deck", async () => {
  await view.navigate(`${base}/`);
  await installErrorHook();
  await waitFor(
    "document.querySelector('h1')?.textContent === 'KIT PICS'",
    "h1 KIT PICS",
  );
  await waitFor(
    "document.querySelectorAll('#deck .kit').length > 0",
    "deck populated with .kit elements",
  );
  const linkCount = (await view.evaluate(
    "document.querySelectorAll('nav a[data-link]').length",
  )) as number;
  check(linkCount === 2, `nav renders 2 data-link anchors (got ${linkCount})`);
  check((await collectInPageErrors()).length === 0, "no in-page errors on /");
});

await run("about route renders copy", async () => {
  await view.navigate(`${base}/about/`);
  await installErrorHook();
  await waitFor(
    "document.querySelector('p.about')?.textContent?.includes('1,090 kits')",
    "about copy present",
  );
  check((await collectInPageErrors()).length === 0, "no in-page errors on /about/");
});

await run("stats route renders empty state", async () => {
  await view.navigate(`${base}/stats/`);
  await installErrorHook();
  await waitFor("!!document.getElementById('stats')", "#stats container present");
  const topTeam = (await view.evaluate(
    "document.querySelector('#stats ul li:nth-child(1) span:last-child')?.textContent",
  )) as string;
  check(
    topTeam === "No kits liked yet!",
    `empty stats shows no-likes placeholder (got ${JSON.stringify(topTeam)})`,
  );
  check((await collectInPageErrors()).length === 0, "no in-page errors on /stats/");
});

await run("seeded votes flow through to stats page", async () => {
  await view.navigate(`${base}/`);
  await installErrorHook();
  await view.evaluate(`(() => {
    localStorage.setItem("kitpics/likedKits", JSON.stringify([0, 1, 2]));
    localStorage.setItem("kitpics/dislikedKits", JSON.stringify([3]));
  })()`);
  await view.navigate(`${base}/stats/`);
  await installErrorHook();
  await waitFor("!!document.getElementById('stats')", "#stats container present");
  const topTeam = (await view.evaluate(
    "document.querySelector('#stats ul li:nth-child(1) span:last-child')?.textContent",
  )) as string;
  check(
    topTeam !== "No kits liked yet!" && (topTeam?.length ?? 0) > 0,
    `top team populated after seeded likes (got ${JSON.stringify(topTeam)})`,
  );
  const likedImgs = (await view.evaluate(
    "document.querySelectorAll('.kits-gallery')[0]?.querySelectorAll('img').length ?? 0",
  )) as number;
  check(likedImgs === 3, `liked gallery has 3 images (got ${likedImgs})`);
  const dislikedImgs = (await view.evaluate(
    "document.querySelectorAll('.kits-gallery')[1]?.querySelectorAll('img').length ?? 0",
  )) as number;
  check(dislikedImgs === 1, `disliked gallery has 1 image (got ${dislikedImgs})`);
  check(
    (await collectInPageErrors()).length === 0,
    "no in-page errors on seeded /stats/",
  );
});

await run("clicking nav Stats link performs SPA navigation", async () => {
  await view.navigate(`${base}/`);
  await installErrorHook();
  await waitFor(
    "document.querySelectorAll('#deck .kit').length > 0",
    "deck populated",
  );
  await view.click('nav a[data-link][href="/stats/"]');
  await waitFor(
    "window.location.pathname === '/stats/' && !!document.getElementById('stats')",
    "SPA navigated to /stats/ and rendered",
  );
  check(
    (await collectInPageErrors()).length === 0,
    "no in-page errors after SPA nav",
  );
});

if (pageErrors.length) {
  console.log(`\nconsole.error / console.warn captured during test:`);
  for (const e of pageErrors) console.log(`  ${e}`);
  for (const e of pageErrors) failures.push(`console: ${e}`);
}

server.stop(true);

if (failures.length) {
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`\nall checks passed`);
