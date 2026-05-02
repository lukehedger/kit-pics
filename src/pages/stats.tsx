import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

type GalleryKit = Pick<Kit, "alt" | "src" | "team">;

type KitGroup = {
  label: string;
  kits: GalleryKit[];
};

export type StatsData = {
  homeOrAway: string | null;
  likedKits: GalleryKit[];
  dislikedKits: GalleryKit[];
  likedKitsByTeam: KitGroup[];
  likedKitsByYear: KitGroup[];
  mostLikedTeam: string | null;
  mostDislikedTeam: string | null;
  mostLikedYear: string | null;
  mostDislikedYear: string | null;
};

type VotedKit = Kit & { vote: "like" | "dislike" };

export function buildStats(rows: VotedKit[]): StatsData {
  const liked = rows.filter((r) => r.vote === "like");
  const disliked = rows.filter((r) => r.vote === "dislike");

  const topKey = (items: VotedKit[], key: "team" | "year"): string | null => {
    const counts: Record<string, number> = {};
    for (const r of items) counts[r[key]] = (counts[r[key]] ?? 0) + 1;
    let best: string | null = null;
    let max = 0;
    for (const k of Object.keys(counts)) {
      if (counts[k]! > max) {
        max = counts[k]!;
        best = k;
      }
    }
    return best;
  };

  const homeKits = liked.filter((k) => k.type === "Home").length;
  const awayKits = liked.filter((k) => k.type === "Away").length;

  const likedByTeam: Record<string, GalleryKit[]> = {};
  const likedByYear: Record<string, GalleryKit[]> = {};
  for (const k of liked) {
    const item = { alt: k.alt, src: k.src, team: k.team };
    (likedByTeam[k.team] ??= []).push(item);
    (likedByYear[k.year] ??= []).push(item);
  }

  const likedKitsByTeam = Object.keys(likedByTeam)
    .sort()
    .map((team) => ({ label: team, kits: likedByTeam[team]! }));
  const likedKitsByYear = Object.keys(likedByYear)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ label: year, kits: likedByYear[year]! }));

  const homeOrAway =
    liked.length === 0 ? null : homeKits >= awayKits ? "Home" : "Away";

  return {
    homeOrAway,
    likedKits: liked.map((k) => ({ alt: k.alt, src: k.src, team: k.team })),
    dislikedKits: disliked.map((k) => ({
      alt: k.alt,
      src: k.src,
      team: k.team,
    })),
    likedKitsByTeam,
    likedKitsByYear,
    mostLikedTeam: topKey(liked, "team"),
    mostDislikedTeam: topKey(disliked, "team"),
    mostLikedYear: topKey(liked, "year"),
    mostDislikedYear: topKey(disliked, "year"),
  };
}

const Gallery: FC<{ items: GalleryKit[] }> = ({ items }) => (
  <div class="kits-gallery">
    {items.map((kit) => (
      <img src={`/kits/${kit.src}`} alt={kit.alt} />
    ))}
  </div>
);

const Groups: FC<{ groups: KitGroup[] }> = ({ groups }) => (
  <>
    {groups.map((group) => (
      <div class="kits-group">
        <p class="kits-group-label">
          {group.label} ({group.kits.length})
        </p>
        <Gallery items={group.kits} />
      </div>
    ))}
  </>
);

const NO_LIKES = "No kits liked yet!";
const NO_DISLIKES = "No kits disliked yet!";

export const Stats: FC<{ stats: StatsData }> = ({ stats }) => (
  <Layout title="Stats - Kit Pics">
    <a style="text-decoration: none" href="/">
      <h1>KIT PICS</h1>
    </a>
    <div id="stats">
      <ul>
        <li>
          <span>Most liked team</span>
          <span>{stats.mostLikedTeam || NO_LIKES}</span>
        </li>
        <li>
          <span>Most disliked team</span>
          <span>{stats.mostDislikedTeam || NO_DISLIKES}</span>
        </li>
        <li>
          <span>Most liked year</span>
          <span>{stats.mostLikedYear || NO_LIKES}</span>
        </li>
        <li>
          <span>Most disliked year</span>
          <span>{stats.mostDislikedYear || NO_DISLIKES}</span>
        </li>
        <li>
          <span>Home or Away?</span>
          <span>{stats.homeOrAway || NO_LIKES}</span>
        </li>
      </ul>

      <h4>Liked kits by team</h4>
      {stats.likedKitsByTeam.length > 0 ? (
        <Groups groups={stats.likedKitsByTeam} />
      ) : (
        <p>{NO_LIKES}</p>
      )}

      <h4>Liked kits by season</h4>
      {stats.likedKitsByYear.length > 0 ? (
        <Groups groups={stats.likedKitsByYear} />
      ) : (
        <p>{NO_LIKES}</p>
      )}

      <h4>Liked kits ({stats.likedKits.length})</h4>
      {stats.likedKits.length > 0 ? (
        <Gallery items={stats.likedKits} />
      ) : (
        <p>{NO_LIKES}</p>
      )}

      <h4 style="opacity: 0.5">Disliked kits ({stats.dislikedKits.length})</h4>
      {stats.dislikedKits.length > 0 ? (
        <Gallery items={stats.dislikedKits} />
      ) : (
        <p style="opacity: 0.5">{NO_DISLIKES}</p>
      )}

      <button type="button" id="clear-session" class="clear-session">
        Clear session
      </button>
    </div>
    <script type="module" src="/stats.js"></script>
  </Layout>
);
