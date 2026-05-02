import type { FC } from "hono/jsx";
import { Layout } from "../layout";

export const About: FC = () => (
  <Layout title="About - Kit Pics">
    <a style="text-decoration: none" href="/">
      <h1>KIT PICS</h1>
    </a>
    <p class="about">
      Swipe your way through all home and away kits from every Premier League
      season from 1992 to 2018 - that's 1,090 kits!
    </p>
    <p class="about">
      <span aria-label="football" role="img">
        ⚽️
      </span>
    </p>
  </Layout>
);
