import { mkdir, rm, cp } from "node:fs/promises";

const outdir = "./build";

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  naming: "app.js",
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await Bun.write(outdir + "/index.html", await Bun.file("./index.html").text());
await Bun.write(outdir + "/style.css", await Bun.file("./src/style.css").text());
await cp("./src/swipe-left.svg", outdir + "/swipe-left.svg");
await cp("./src/swipe-right.svg", outdir + "/swipe-right.svg");
await cp("./public", outdir, { recursive: true });

console.log(`Built to ${outdir}`);
