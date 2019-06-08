import React from "react";

import kits from "./kits.json";

export default function About() {
  console.log(kits.length);

  return (
    <>
      <h1>KIT PICS</h1>

      <p className="about">
        Swipe your way through all home and away kits from each Premier League
        season from 1992 to 2018 - that's 1,090 kits!
      </p>

      <p className="about">
        Originally conceived on That Peter Crouch Podcast. Piss off Carl.
      </p>

      <p className="about">
        <span aria-label="football" role="img">
          ⚽️
        </span>
      </p>
    </>
  );
}
