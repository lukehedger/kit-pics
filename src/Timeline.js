import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import kits from "./kits.json";

const typeOrder = { Home: 0, Away: 1, Third: 2 };

const buildTimeline = () => {
  const byTeam = {};

  kits.forEach(kit => {
    if (!byTeam[kit.team]) byTeam[kit.team] = {};
    if (!byTeam[kit.team][kit.year]) byTeam[kit.team][kit.year] = [];
    byTeam[kit.team][kit.year].push(kit);
  });

  Object.keys(byTeam).forEach(team => {
    Object.keys(byTeam[team]).forEach(year => {
      byTeam[team][year].sort(
        (a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99)
      );
    });
  });

  return byTeam;
};

export default function Timeline() {
  const timeline = useMemo(() => buildTimeline(), []);

  const teams = useMemo(
    () => Object.keys(timeline).sort((a, b) => a.localeCompare(b)),
    [timeline]
  );

  const [selectedTeam, setSelectedTeam] = useState(teams[0]);

  const years = useMemo(
    () =>
      Object.keys(timeline[selectedTeam] || {}).sort(
        (a, b) => Number(a) - Number(b)
      ),
    [timeline, selectedTeam]
  );

  return (
    <>
      <Link style={{ textDecoration: "none" }} to="/">
        <h1>KIT PICS</h1>
      </Link>

      <div id="timeline">
        <div className="timeline-controls">
          <label htmlFor="team-select">Team</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
          >
            {teams.map(team => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <ol className="timeline-years">
          {years.map(year => (
            <li key={year} className="timeline-year">
              <span className="timeline-year-label">{year}</span>

              <div className="timeline-year-kits">
                {timeline[selectedTeam][year].map((kit, i) => (
                  <figure key={i} className="timeline-kit">
                    <img src={kit.src} alt={kit.alt} />
                    <figcaption>{kit.type}</figcaption>
                  </figure>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {years.length === 0 && (
          <p>No kits found for this team.</p>
        )}
      </div>

      <nav>
        <Link className="link" to="/about/">
          About
        </Link>
        |
        <Link className="link" to="/stats/">
          Stats
        </Link>
      </nav>
    </>
  );
}
