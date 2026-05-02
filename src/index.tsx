import { Hono } from "hono";
import { Home } from "./pages/home";
import { About } from "./pages/about";
import { Stats, buildStats, type StatsData } from "./pages/stats";
import { Timeline, buildTimeline } from "./pages/timeline";
import { getOrSetSession } from "./session";
import type { Bindings, Kit } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

async function loadNextCards(db: D1Database, sid: string): Promise<Kit[]> {
  const { results } = await db
    .prepare(
      `SELECT k.id, k.src, k.alt, k.team, k.year, k.type
       FROM kits k
       LEFT JOIN votes v ON v.kit_id = k.id AND v.session_id = ?
       WHERE v.id IS NULL
       ORDER BY RANDOM()
       LIMIT 10`,
    )
    .bind(sid)
    .all<Kit>();
  return results ?? [];
}

app.get("/", async (c) => {
  const sid = getOrSetSession(c);
  const cards = await loadNextCards(c.env.DB, sid);
  return c.html(<Home cards={cards} />);
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

  const stats: StatsData = buildStats(results ?? []);
  return c.html(<Stats stats={stats} />);
});

app.get("/timeline/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, src, alt, team, year, type FROM kits`,
  ).all<Kit>();

  const timeline = buildTimeline(results ?? []);
  const teams = Object.keys(timeline).sort((a, b) => a.localeCompare(b));
  const initialTeam = teams[0] ?? "";

  return c.html(
    <Timeline timeline={timeline} teams={teams} initialTeam={initialTeam} />,
  );
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

app.delete("/api/session", async (c) => {
  const sid = getOrSetSession(c);
  await c.env.DB.prepare(`DELETE FROM votes WHERE session_id = ?`)
    .bind(sid)
    .run();
  return c.json({ ok: true });
});

app.get("/api/cards", async (c) => {
  const sid = getOrSetSession(c);
  const cards = await loadNextCards(c.env.DB, sid);
  return c.json(cards);
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
