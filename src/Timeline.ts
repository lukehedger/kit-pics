import kitsData from "./kits.json";

interface Kit {
  src: string;
  alt: string;
  team: string;
  year: string;
  type: string;
}

const kits = kitsData as Kit[];

const typeOrder: Record<string, number> = { Home: 0, Away: 1, Third: 2 };
const rank = (type: string) =>
  type in typeOrder ? typeOrder[type] : 99;

type TimelineData = Record<string, Record<string, Kit[]>>;

const buildTimeline = (): TimelineData => {
  const byTeam: TimelineData = {};
  for (const kit of kits) {
    if (!byTeam[kit.team]) byTeam[kit.team] = {};
    if (!byTeam[kit.team][kit.year]) byTeam[kit.team][kit.year] = [];
    byTeam[kit.team][kit.year].push(kit);
  }
  for (const team in byTeam) {
    for (const year in byTeam[team]) {
      byTeam[team][year].sort((a, b) => rank(a.type) - rank(b.type));
    }
  }
  return byTeam;
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const yearsMarkup = (yearMap: Record<string, Kit[]>) => {
  const years = Object.keys(yearMap).sort((a, b) => Number(a) - Number(b));
  if (years.length === 0) return `<p>No kits found for this team.</p>`;
  return `
    <ol class="timeline-years">
      ${years
        .map(
          (year) => `
        <li class="timeline-year">
          <span class="timeline-year-label">${escapeText(year)}</span>
          <div class="timeline-year-kits">
            ${yearMap[year]
              .map(
                (kit) => `
              <figure class="timeline-kit">
                <img src="${escapeAttr(kit.src)}" alt="${escapeAttr(kit.alt)}" />
                <figcaption>${escapeText(kit.type)}</figcaption>
              </figure>
            `,
              )
              .join("")}
          </div>
        </li>
      `,
        )
        .join("")}
    </ol>
  `;
};

export const renderTimeline = (root: HTMLElement): (() => void) => {
  const timeline = buildTimeline();
  const teams = Object.keys(timeline).sort((a, b) => a.localeCompare(b));
  const initialTeam = teams[0] ?? "";

  root.innerHTML = `
    <a href="/" data-link style="text-decoration: none">
      <h1>KIT PICS</h1>
    </a>

    <div id="timeline">
      <div class="timeline-controls">
        <label for="team-select">Team</label>
        <select id="team-select">
          ${teams
            .map(
              (team) =>
                `<option value="${escapeAttr(team)}">${escapeText(team)}</option>`,
            )
            .join("")}
        </select>
      </div>

      <div id="timeline-content">
        ${teams.length ? yearsMarkup(timeline[initialTeam]) : `<p>No kits found.</p>`}
      </div>
    </div>

    <nav>
      <a class="link" href="/about/" data-link>About</a>
      |
      <a class="link" href="/stats/" data-link>Stats</a>
    </nav>
  `;

  const select = root.querySelector<HTMLSelectElement>("#team-select");
  const content = root.querySelector<HTMLDivElement>("#timeline-content");

  const onChange = () => {
    if (!select || !content) return;
    content.innerHTML = yearsMarkup(timeline[select.value] ?? {});
  };

  select?.addEventListener("change", onChange);

  return () => {
    select?.removeEventListener("change", onChange);
  };
};
