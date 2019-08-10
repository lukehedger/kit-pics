import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Link style={{ textDecoration: "none" }} to="/">
        <h1>KIT PICS</h1>
      </Link>

      <p className="about">
        Swipe your way through all home and away kits from every Premier League
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
