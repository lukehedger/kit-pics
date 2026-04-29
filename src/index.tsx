import { Hono } from "hono";
import { Home } from "./pages/home";
import { About } from "./pages/about";
import { Stats, type StatsData } from "./pages/stats";
import { getOrSetSession } from "./session";
import type { Bindings, Kit } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const sid = getOrSetSession(c);
  const { results } = await c.env.DB.prepare(
    `SELECT k.id, k.src, k.alt, k.team, k.year, k.type
     FROM kits k
     LEFT JOIN votes v ON v.kit_id = k.id AND v.session_id = ?
     WHERE v.id IS NULL
     ORDER BY RANDOM()
     LIMIT 10`,
  )
    .bind(sid)
    .all<Kit>();
  return c.html(<Home cards={results ?? []} />);
});

app.get("/about/", (c) => c.html(<About />));

app.get("/stats/", async (c) => {
  const sid = getOrSetSession(c);
  const { results } = await c.env.DB.prepare(
    `SELECT k.id, k.src, k.alt, k.team, k.year, k.type, v.vote
     FROM votes v JOIN kits k ON k.id = v.kit_id
     WHERE v.session_id = ?
     ORDER BY v.created_at DESC`,
  )
    .bind(sid)
    .all<Kit & { vote: "like" | "dislike" }>();

  const rows = results ?? [];
  const stats = buildStats(rows);
  return c.html(<Stats stats={stats} />);
});

app.post("/api/votes", async (c) => {
  const sid = getOrSetSession(c);
  const body = await c.req.json<{ kitId: number; vote: "like" | "dislike" }>();
  if (
    typeof body.kitId !== "number" ||
    (body.vote !== "like" && body.vote !== "dislike")
  ) {
    return c.json({ error: "invalid body" }, 400);
  }
  await c.env.DB.prepare(
    `INSERT INTO votes (session_id, kit_id, vote) VALUES (?, ?, ?)
     ON CONFLICT (session_id, kit_id) DO UPDATE SET vote = excluded.vote`,
  )
    .bind(sid, body.kitId, body.vote)
    .run();
  return c.json({ ok: true });
});

app.get("/api/cards", async (c) => {
  const sid = getOrSetSession(c);
  const { results } = await c.env.DB.prepare(
    `SELECT k.id, k.src, k.alt, k.team, k.year, k.type
     FROM kits k
     LEFT JOIN votes v ON v.kit_id = k.id AND v.session_id = ?
     WHERE v.id IS NULL
     ORDER BY RANDOM()
     LIMIT 10`,
  )
    .bind(sid)
    .all<Kit>();
  return c.json(results ?? []);
});

app.get("/kits/:filename", async (c) => {
  const filename = c.req.param("filename");
  const object = await c.env.KITS.get(filename);
  if (!object) return c.notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

export default app;

function buildStats(
  rows: Array<Kit & { vote: "like" | "dislike" }>,
): StatsData {
  const liked = rows.filter((r) => r.vote === "like");
  const disliked = rows.filter((r) => r.vote === "dislike");

  const topKey = (
    items: Array<Kit & { vote: "like" | "dislike" }>,
    key: "team" | "year",
  ): string | null => {
    const counts: Record<string, number> = {};
    for (const r of items) counts[r[key]] = (counts[r[key]] ?? 0) + 1;
    let best: string | null = null;
    let max = 0;
    for (const k of Object.keys(counts)) {
      if (counts[k] > max) {
        max = counts[k];
        best = k;
      }
    }
    return best;
  };

  const homeKits = liked.filter((k) => k.type === "Home").length;
  const awayKits = liked.filter((k) => k.type === "Away").length;

  return {
    homeOrAway: homeKits >= awayKits ? "Home" : "Away",
    likedKits: liked.map((k) => ({ alt: k.alt, src: k.src, team: k.team })),
    dislikedKits: disliked.map((k) => ({
      alt: k.alt,
      src: k.src,
      team: k.team,
    })),
    mostLikedTeam: topKey(liked, "team"),
    mostDislikedTeam: topKey(disliked, "team"),
    mostLikedYear: topKey(liked, "year"),
    mostDislikedYear: topKey(disliked, "year"),
  };
}
