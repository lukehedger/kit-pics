import React, { useState } from "react";

import kits from "./kits.json";

const getStats = () => {
  const dislikedKits =
    JSON.parse(localStorage.getItem("kitpics/dislikedKits")) || [];
  const likedKits = JSON.parse(localStorage.getItem("kitpics/likedKits")) || [];

  const dislikedKitsGallery = [];
  const likedKitsGallery = [];

  const dislikedTeams = {};
  const likedTeams = {};
  const dislikedYears = {};
  const likedYears = {};

  let awayKits = 0;
  let homeKits = 0;

  dislikedKits.map(kitID => {
    const kit = kits[kitID];

    dislikedKitsGallery.push({
      alt: kit.alt,
      src: kit.src,
      team: kit.team
    });

    if (!dislikedTeams[kit.team]) {
      dislikedTeams[kit.team] = 1;
    } else {
      dislikedTeams[kit.team] += 1;
    }

    if (!dislikedYears[kit.year]) {
      dislikedYears[kit.year] = 1;
    } else {
      dislikedYears[kit.year] += 1;
    }

    if (kit.type === "Home") {
      homeKits += 1;
    } else if (kit.type === "Away") {
      awayKits += 1;
    }

    return true;
  });

  likedKits.map(kitID => {
    const kit = kits[kitID];

    likedKitsGallery.push({
      alt: kit.alt,
      src: kit.src,
      team: kit.team
    });

    if (!likedTeams[kit.team]) {
      likedTeams[kit.team] = 1;
    } else {
      likedTeams[kit.team] += 1;
    }

    if (!likedYears[kit.year]) {
      likedYears[kit.year] = 1;
    } else {
      likedYears[kit.year] += 1;
    }

    return true;
  });

  dislikedKitsGallery.sort((a, b) => a.team > b.team);
  likedKitsGallery.sort((a, b) => a.team > b.team);

  const homeOrAway = homeKits > awayKits ? "Home" : "Away";

  const mostDislikedTeam = Object.keys(dislikedTeams).sort(
    (a, b) => dislikedTeams[a] < dislikedTeams[b]
  )[0];

  const mostLikedTeam = Object.keys(likedTeams).sort(
    (a, b) => likedTeams[a] < likedTeams[b]
  )[0];

  const mostDislikedYear = Object.keys(dislikedYears).sort(
    (a, b) => dislikedYears[a] < dislikedYears[b]
  )[0];

  const mostLikedYear = Object.keys(likedYears).sort(
    (a, b) => likedYears[a] < likedYears[b]
  )[0];

  return {
    homeOrAway: homeOrAway,
    dislikedKits: dislikedKitsGallery,
    likedKits: likedKitsGallery,
    mostDislikedTeam: mostDislikedTeam,
    mostDislikedYear: mostDislikedYear,
    mostLikedTeam: mostLikedTeam,
    mostLikedYear: mostLikedYear
  };
};

export default function App() {
  const [stats] = useState(() => getStats());

  return (
    <>
      <h1>KIT PICS</h1>

      <div id="stats">
        <ul>
          <li>
            <span>Top team</span>

            <span>{stats.mostLikedTeam}</span>
          </li>

          <li>
            <span>Bottom team</span>

            <span>{stats.mostDislikedTeam}</span>
          </li>

          <li>
            <span>Best year</span>

            <span>{stats.mostLikedYear}</span>
          </li>

          <li>
            <span>Worst year</span>

            <span>{stats.mostDislikedYear}</span>
          </li>

          <li>
            <span>Home or Away?</span>

            <span>{stats.homeOrAway}</span>
          </li>
        </ul>

        <h4>Liked kits</h4>

        <div className="kits-gallery">
          {stats.likedKits.map((kit, i) => {
            return <img key={i} src={kit.src} alt={kit.alt} />;
          })}
        </div>

        <h4 style={{ opacity: 0.5 }}>Disliked kits</h4>

        <div className="kits-gallery">
          {stats.dislikedKits.map((kit, i) => {
            return <img key={i} src={kit.src} alt={kit.alt} />;
          })}
        </div>
      </div>
    </>
  );
}
