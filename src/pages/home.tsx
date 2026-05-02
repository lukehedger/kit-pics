import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { Kit } from "../types";

type Props = { cards: Kit[] };

export const Home: FC<Props> = ({ cards }) => (
  <Layout>
    <h1>KIT PICS</h1>
    {cards.length > 0 ? (
      <>
        <div class="hint" id="hint" hidden>
          Try swiping or dragging the kits! Right for a like, left for dislike.
        </div>
        <div class="swipe swipe-left" data-hint></div>
        <div class="swipe swipe-right" data-hint></div>
      </>
    ) : null}
    <div id="deck">
      {cards.length > 0 ? (
        cards.map((kit, i) => (
          <div class="kit" data-index={i} data-kit-id={kit.id}>
            <div style={`background-image: url(/kits/${kit.src})`}>
              <span>{kit.alt}</span>
            </div>
          </div>
        ))
      ) : (
        <div class="empty-state">
          <h2>All done!</h2>
          <p>You've rated every kit.</p>
          <a class="empty-cta" href="/stats/">
            See your picks
          </a>
        </div>
      )}
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
