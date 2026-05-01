import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

type Props = { cards: Kit[] };

export const Home: FC<Props> = ({ cards }) => (
  <Layout>
    <h1>KIT PICS</h1>
    <div class="hint" id="hint" hidden>
      Try swiping or dragging the kits! Right for a like, left for dislike.
    </div>
    <div class="swipe swipe-left" data-hint></div>
    <div class="swipe swipe-right" data-hint></div>
    <div id="deck">
      {cards.map((kit, i) => (
        <div class="kit" data-index={i} data-kit-id={kit.id}>
          <div style={`background-image: url(/kits/${kit.src})`}>
            <span>{kit.alt}</span>
          </div>
        </div>
      ))}
    </div>
    <nav>
      <a class="link" href="/about/">
        About
      </a>
      |
      <a class="link" href="/stats/">
        Stats
      </a>
      |
      <a class="link" href="/timeline/">
        Timeline
      </a>
    </nav>
    <script type="module" src="/deck.js"></script>
  </Layout>
);
