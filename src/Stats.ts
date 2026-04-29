import kitsData from "./kits.json";

interface Kit {
  src: string;
  alt: string;
  team: string;
  year: string;
  type: string;
}

const kits = kitsData as Kit[];

interface GalleryItem {
  alt: string;
  src: string;
  team: string;
}

interface Stats {
  homeOrAway: string;
  dislikedKits: GalleryItem[];
  likedKits: GalleryItem[];
  mostDislikedTeam: string | undefined;
  mostDislikedYear: string | undefined;
  mostLikedTeam: string | undefined;
  mostLikedYear: string | undefined;
}

const readIds = (key: string): number[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

const topKey = (counts: Record<string, number>): string | undefined => {
  const keys = Object.keys(counts);
  if (keys.length === 0) return undefined;
  return keys.sort((a, b) => counts[b] - counts[a])[0];
};

const getStats = (): Stats => {
  const dislikedIds = readIds("kitpics/dislikedKits");
  const likedIds = readIds("kitpics/likedKits");

  const dislikedKitsGallery: GalleryItem[] = [];
  const likedKitsGallery: GalleryItem[] = [];

  const dislikedTeams: Record<string, number> = {};
  const likedTeams: Record<string, number> = {};
  const dislikedYears: Record<string, number> = {};
  const likedYears: Record<string, number> = {};

  let awayKits = 0;
  let homeKits = 0;

  for (const id of dislikedIds) {
    const kit = kits[id];
    if (!kit) continue;
    dislikedKitsGallery.push({ alt: kit.alt, src: kit.src, team: kit.team });
    dislikedTeams[kit.team] = (dislikedTeams[kit.team] ?? 0) + 1;
    dislikedYears[kit.year] = (dislikedYears[kit.year] ?? 0) + 1;
  }

  for (const id of likedIds) {
    const kit = kits[id];
    if (!kit) continue;
    likedKitsGallery.push({ alt: kit.alt, src: kit.src, team: kit.team });
    likedTeams[kit.team] = (likedTeams[kit.team] ?? 0) + 1;
    likedYears[kit.year] = (likedYears[kit.year] ?? 0) + 1;
    if (kit.type === "Home") homeKits += 1;
    else if (kit.type === "Away") awayKits += 1;
  }

  dislikedKitsGallery.sort((a, b) => (a.team > b.team ? 1 : -1));
  likedKitsGallery.sort((a, b) => (a.team > b.team ? 1 : -1));

  return {
    homeOrAway: homeKits > awayKits ? "Home" : "Away",
    dislikedKits: dislikedKitsGallery,
    likedKits: likedKitsGallery,
    mostDislikedTeam: topKey(dislikedTeams),
    mostDislikedYear: topKey(dislikedYears),
    mostLikedTeam: topKey(likedTeams),
    mostLikedYear: topKey(likedYears),
  };
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const galleryMarkup = (items: GalleryItem[]) =>
  items
    .map(
      (kit) =>
        `<img src="${escapeAttr(kit.src)}" alt="${escapeAttr(kit.alt)}" />`,
    )
    .join("");

export const renderStats = (root: HTMLElement) => {
  const stats = getStats();

  root.innerHTML = `
    <a href="/" data-link style="text-decoration: none">
      <h1>KIT PICS</h1>
    </a>

    <div id="stats">
      <ul>
        <li>
          <span>Top team</span>
          <span>${stats.mostLikedTeam ?? "No kits liked yet!"}</span>
        </li>
        <li>
          <span>Bottom team</span>
          <span>${stats.mostDislikedTeam ?? "No kits disliked yet!"}</span>
        </li>
        <li>
          <span>Best year</span>
          <span>${stats.mostLikedYear ?? "No kits liked yet!"}</span>
        </li>
        <li>
          <span>Worst year</span>
          <span>${stats.mostDislikedYear ?? "No kits disliked yet!"}</span>
        </li>
        <li>
          <span>Home or Away?</span>
          <span>${stats.homeOrAway}</span>
        </li>
      </ul>

      <h4>Liked kits (${stats.likedKits.length})</h4>

      ${
        stats.likedKits.length > 0
          ? `<div class="kits-gallery">${galleryMarkup(stats.likedKits)}</div>`
          : `<p>No kits liked yet!</p>`
      }

      <h4 style="opacity: 0.5">
        Disliked kits (${stats.dislikedKits.length})
      </h4>

      ${
        stats.dislikedKits.length > 0
          ? `<div class="kits-gallery">${galleryMarkup(stats.dislikedKits)}</div>`
          : `<p style="opacity: 0.5">No kits disliked yet!</p>`
      }
    </div>
  `;
};
