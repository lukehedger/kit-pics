#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const kits = JSON.parse(readFileSync(join(root, "src/kits.json"), "utf8"));

const esc = (s) => s.replace(/'/g, "''");

const chunks = [];
chunks.push("-- Generated from src/kits.json by scripts/generate-seed.mjs");
chunks.push("DELETE FROM kits;");

const batchSize = 200;
for (let i = 0; i < kits.length; i += batchSize) {
  const batch = kits.slice(i, i + batchSize);
  const values = batch
    .map((kit, j) => {
      const id = i + j;
      const filename = kit.src.replace(/^\/kits\//, "");
      return `(${id}, '${esc(filename)}', '${esc(kit.alt)}', '${esc(kit.team)}', '${esc(kit.year)}', '${esc(kit.type)}')`;
    })
    .join(",\n  ");
  chunks.push(
    `INSERT INTO kits (id, src, alt, team, year, type) VALUES\n  ${values};`,
  );
}

writeFileSync(
  join(root, "migrations/0002_seed_kits.sql"),
  chunks.join("\n\n") + "\n",
);

console.log(`Wrote migrations/0002_seed_kits.sql (${kits.length} kits)`);
