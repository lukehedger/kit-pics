import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

type GalleryKit = Pick<Kit, "alt" | "src" | "team">;

export type StatsData = {
  homeOrAway: string;
  likedKits: GalleryKit[];
  dislikedKits: GalleryKit[];
  mostLikedTeam: string | null;
  mostDislikedTeam: string | null;
  mostLikedYear: string | null;
  mostDislikedYear: string | null;
};

export const Stats: FC<{ stats: StatsData }> = ({ stats }) => (
  <Layout title="Stats - Kit Pics">
    <a style="text-decoration: none" href="/">
      <h1>KIT PICS</h1>
    </a>
    <div id="stats">
      <ul>
        <li>
          <span>Top team</span>
          <span>{stats.mostLikedTeam || "No kits liked yet!"}</span>
        </li>
        <li>
          <span>Bottom team</span>
          <span>{stats.mostDislikedTeam || "No kits disliked yet!"}</span>
        </li>
        <li>
          <span>Best year</span>
          <span>{stats.mostLikedYear || "No kits liked yet!"}</span>
        </li>
        <li>
          <span>Worst year</span>
          <span>{stats.mostDislikedYear || "No kits disliked yet!"}</span>
        </li>
        <li>
          <span>Home or Away?</span>
          <span>{stats.homeOrAway}</span>
        </li>
      </ul>

      <h4>Liked kits ({stats.likedKits.length})</h4>
      {stats.likedKits.length > 0 ? (
        <div class="kits-gallery">
          {stats.likedKits.map((kit) => (
            <img src={`/kits/${kit.src}`} alt={kit.alt} />
          ))}
        </div>
      ) : (
        <p>No kits liked yet!</p>
      )}

      <h4 style="opacity: 0.5">Disliked kits ({stats.dislikedKits.length})</h4>
      {stats.dislikedKits.length > 0 ? (
        <div class="kits-gallery">
          {stats.dislikedKits.map((kit) => (
            <img src={`/kits/${kit.src}`} alt={kit.alt} />
          ))}
        </div>
      ) : (
        <p style="opacity: 0.5">No kits disliked yet!</p>
      )}
    </div>
  </Layout>
);
