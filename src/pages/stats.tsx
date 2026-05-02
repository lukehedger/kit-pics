import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

type GalleryKit = Pick<Kit, "alt" | "src" | "team">;

type KitGroup = {
  label: string;
  kits: GalleryKit[];
};

export type StatsData = {
  homeOrAway: string;
  likedKits: GalleryKit[];
  dislikedKits: GalleryKit[];
  likedKitsByTeam: KitGroup[];
  likedKitsByYear: KitGroup[];
  mostLikedTeam: string | null;
  mostDislikedTeam: string | null;
  mostLikedYear: string | null;
  mostDislikedYear: string | null;
};

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

      <h4>Liked kits by team</h4>
      {stats.likedKitsByTeam.length > 0 ? (
        <Groups groups={stats.likedKitsByTeam} />
      ) : (
        <p>No kits liked yet!</p>
      )}

      <h4>Liked kits by season</h4>
      {stats.likedKitsByYear.length > 0 ? (
        <Groups groups={stats.likedKitsByYear} />
      ) : (
        <p>No kits liked yet!</p>
      )}

      <h4>Liked kits ({stats.likedKits.length})</h4>
      {stats.likedKits.length > 0 ? (
        <Gallery items={stats.likedKits} />
      ) : (
        <p>No kits liked yet!</p>
      )}

      <h4 style="opacity: 0.5">Disliked kits ({stats.dislikedKits.length})</h4>
      {stats.dislikedKits.length > 0 ? (
        <Gallery items={stats.dislikedKits} />
      ) : (
        <p style="opacity: 0.5">No kits disliked yet!</p>
      )}

      <button type="button" id="clear-session" class="clear-session">
        Clear session
      </button>
    </div>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.getElementById("clear-session")?.addEventListener("click", async () => {
            if (!confirm("Wipe all your likes and dislikes and start fresh?")) return;
            try {
              await fetch("/api/session", { method: "DELETE" });
            } catch {}
            window.location.href = "/";
          });
        `,
      }}
    />
  </Layout>
);
