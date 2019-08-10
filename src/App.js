import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSprings, animated, interpolate } from "react-spring";
import { useGesture } from "react-with-gesture";

import kits from "./kits.json";

const getCards = () => {
  const dislikedKits =
    JSON.parse(localStorage.getItem("kitpics/dislikedKits")) || [];
  const likedKits = JSON.parse(localStorage.getItem("kitpics/likedKits")) || [];

  return kits
    .map((kit, index) => ({
      ...kit,
      id: index
    }))
    .filter((value, index) => {
      return likedKits.indexOf(index) < 0;
    })
    .filter((value, index) => {
      return dislikedKits.indexOf(index) < 0;
    })
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);
};

const to = i => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100
});

const from = i => ({ x: 0, y: -1000, rot: 0, scale: 1.5 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r /
    10}deg) rotateZ(${r}deg) scale(${s})`;

function Deck() {
  const [gone] = useState(() => new Set());
  const [cards, setCards] = useState(() => getCards());

  const [springs, set] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i)
  }));

  const bind = useGesture(
    ({
      args: [index, cardID],
      down,
      delta: [xDelta],
      distance,
      direction: [xDir],
      velocity
    }) => {
      const trigger = velocity > 0.2;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) gone.add(index);
      set(i => {
        if (index !== i) return;
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0;
        const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0);
        const scale = down ? 1.1 : 1;

        if (isGone && dir === -1) {
          const dislikedKits =
            JSON.parse(localStorage.getItem("kitpics/dislikedKits")) || [];

          localStorage.setItem(
            "kitpics/dislikedKits",
            JSON.stringify([...dislikedKits, cardID])
          );

          window.mixpanel.track("Disliked kit", kits[cardID]);
        }

        if (isGone && dir === 1) {
          const likedKits =
            JSON.parse(localStorage.getItem("kitpics/likedKits")) || [];

          localStorage.setItem(
            "kitpics/likedKits",
            JSON.stringify([...likedKits, cardID])
          );

          window.mixpanel.track("Liked kit", kits[cardID]);
        }

        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 }
        };
      });

      if (!down && gone.size === cards.length) {
        setTimeout(() => gone.clear() || set(i => to(i)), 600);
        setCards(getCards());
      }
    }
  );
  return springs.map(({ x, y, rot, scale }, i) => (
    <animated.div
      className="kit"
      key={i}
      style={{
        transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`)
      }}
    >
      <animated.div
        {...bind(i, cards[i].id)}
        style={{
          transform: interpolate([rot, scale], trans),
          backgroundImage: `url(${cards[i].src})`
        }}
      >
        <span>{cards[i].alt}</span>
      </animated.div>
    </animated.div>
  ));
}

export default function App() {
  const [showHint, setShowHint] = useState("hidden");

  return (
    <>
      <h1>KIT PICS</h1>

      {showHint === "visible" && (
        <div className="hint">
          Try swiping or dragging the kits! Right for a like, left for dislike.
        </div>
      )}

      <div
        className="swipe swipe-left"
        onClick={() => setShowHint("visible")}
      />
      <div
        className="swipe swipe-right"
        onClick={() => setShowHint("visible")}
      />

      <Deck />

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
