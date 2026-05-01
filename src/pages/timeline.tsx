import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

export type TimelineData = Record<string, Record<string, Kit[]>>;

type Props = {
  timeline: TimelineData;
  teams: string[];
  initialTeam: string;
};

const YearsForTeam: FC<{ yearMap: Record<string, Kit[]> }> = ({ yearMap }) => {
  const years = Object.keys(yearMap).sort((a, b) => Number(a) - Number(b));
  if (years.length === 0) return <p>No kits found for this team.</p>;
  return (
    <ol class="timeline-years">
      {years.map((year) => (
        <li class="timeline-year">
          <span class="timeline-year-label">{year}</span>
          <div class="timeline-year-kits">
            {yearMap[year]!.map((kit) => (
              <figure class="timeline-kit">
                <img src={`/kits/${kit.src}`} alt={kit.alt} />
                <figcaption>{kit.type}</figcaption>
              </figure>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
};

export const Timeline: FC<Props> = ({ timeline, teams, initialTeam }) => {
  const jsonData = JSON.stringify(timeline).replace(/</g, "\\u003c");
  return (
    <Layout title="Timeline - Kit Pics">
      <a style="text-decoration: none" href="/">
        <h1>KIT PICS</h1>
      </a>
      <div id="timeline">
        <div class="timeline-controls">
          <label for="team-select">Team</label>
          <select id="team-select">
            {teams.map((team) => (
              <option value={team} selected={team === initialTeam}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div id="timeline-content">
          {teams.length > 0 ? (
            <YearsForTeam yearMap={timeline[initialTeam] ?? {}} />
          ) : (
            <p>No kits found.</p>
          )}
        </div>
      </div>
      <nav>
        <a class="link" href="/about/">
          About
        </a>
        |
        <a class="link" href="/stats/">
          Stats
        </a>
      </nav>
      <script
        id="timeline-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: jsonData }}
      />
      <script type="module" src="/timeline.js"></script>
    </Layout>
  );
};
