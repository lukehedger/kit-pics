import kitsData from "./kits.json";

interface Kit {
  src: string;
  alt: string;
  team: string;
  year: string;
  type: string;
}

interface IndexedKit extends Kit {
  id: number;
}

const kits = kitsData as Kit[];

const DECK_SIZE = 10;
const TRIGGER_VELOCITY = 0.2;
const ENTER_DURATION = 700;
const RESET_DURATION = 400;
const FLY_DURATION = 600;
const ENTER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const shuffle = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const readIds = (key: string): number[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

const writeIds = (key: string, ids: number[]) => {
  localStorage.setItem(key, JSON.stringify(ids));
};

const getCards = (): IndexedKit[] => {
  const disliked = readIds("kitpics/dislikedKits");
  const liked = readIds("kitpics/likedKits");
  const unseen = kits
    .map<IndexedKit>((kit, id) => ({ ...kit, id }))
    .filter((k) => !liked.includes(k.id) && !disliked.includes(k.id));
  return shuffle(unseen).slice(0, DECK_SIZE);
};

interface CardState {
  kit: IndexedKit;
  i: number;
  rot: number;
  y: number;
  outer: HTMLDivElement;
  inner: HTMLDivElement;
  gone: boolean;
  detach: () => void;
}

const innerTransform = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const outerTransform = (x: number, y: number) => `translate3d(${x}px, ${y}px, 0)`;

const createDeck = (host: HTMLElement) => {
  let cards: CardState[] = [];
  let gone = new Set<number>();
  let pendingDeal: ReturnType<typeof setTimeout> | null = null;

  const applyResting = (c: CardState) => {
    c.outer.style.transform = outerTransform(0, c.y);
    c.inner.style.transform = innerTransform(c.rot, 1);
  };

  const enter = (c: CardState) => {
    c.outer.style.transition = "none";
    c.inner.style.transition = "none";
    c.outer.style.transform = outerTransform(0, -1000);
    c.inner.style.transform = innerTransform(0, 1.5);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const delay = c.i * 100;
        const t = `transform ${ENTER_DURATION}ms ${ENTER_EASING} ${delay}ms`;
        c.outer.style.transition = t;
        c.inner.style.transition = t;
        applyResting(c);
      });
    });
  };

  const resetCard = (c: CardState) => {
    const t = `transform ${RESET_DURATION}ms ${ENTER_EASING}`;
    c.outer.style.transition = t;
    c.inner.style.transition = t;
    applyResting(c);
  };

  const dragCard = (c: CardState, xDelta: number) => {
    c.outer.style.transition = "none";
    c.inner.style.transition = "none";
    c.outer.style.transform = outerTransform(xDelta, c.y);
    c.inner.style.transform = innerTransform(xDelta / 100 + c.rot, 1.1);
  };

  const flyOff = (c: CardState, dir: number, xDelta: number, velocity: number) => {
    c.gone = true;
    c.inner.style.pointerEvents = "none";
    const x = (200 + window.innerWidth) * dir;
    const rot = xDelta / 100 + dir * 10 * velocity;
    const t = `transform ${FLY_DURATION}ms ${ENTER_EASING}`;
    c.outer.style.transition = t;
    c.inner.style.transition = t;
    c.outer.style.transform = outerTransform(x, c.y);
    c.inner.style.transform = innerTransform(rot, 1);
  };

  const attachGesture = (c: CardState) => {
    let isDown = false;
    let startX = 0;
    let startT = 0;
    let lastX = 0;
    let lastT = 0;
    let xDelta = 0;
    let pointerId = -1;

    const onDown = (e: PointerEvent) => {
      if (c.gone) return;
      isDown = true;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startT = lastT = performance.now();
      xDelta = 0;
      try {
        c.inner.setPointerCapture(pointerId);
      } catch {}
      c.outer.style.transition = "none";
      c.inner.style.transition = "none";
      c.inner.style.transform = innerTransform(c.rot, 1.1);
    };

    const onMove = (e: PointerEvent) => {
      if (!isDown || c.gone) return;
      xDelta = e.clientX - startX;
      lastX = e.clientX;
      lastT = performance.now();
      dragCard(c, xDelta);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      try {
        c.inner.releasePointerCapture(pointerId);
      } catch {}

      const dt = Math.max(1, lastT - startT);
      const velocity = Math.abs(xDelta) / dt;
      const dir = xDelta < 0 ? -1 : 1;
      const trigger = velocity > TRIGGER_VELOCITY;

      if (trigger) {
        gone.add(c.i);
        const key = dir === -1 ? "kitpics/dislikedKits" : "kitpics/likedKits";
        const ids = readIds(key);
        ids.push(c.kit.id);
        writeIds(key, ids);
        flyOff(c, dir, xDelta, velocity);

        if (gone.size === cards.length && !pendingDeal) {
          pendingDeal = setTimeout(() => {
            pendingDeal = null;
            deal();
          }, FLY_DURATION);
        }
      } else {
        resetCard(c);
      }
    };

    c.inner.addEventListener("pointerdown", onDown);
    c.inner.addEventListener("pointermove", onMove);
    c.inner.addEventListener("pointerup", onUp);
    c.inner.addEventListener("pointercancel", onUp);

    c.detach = () => {
      c.inner.removeEventListener("pointerdown", onDown);
      c.inner.removeEventListener("pointermove", onMove);
      c.inner.removeEventListener("pointerup", onUp);
      c.inner.removeEventListener("pointercancel", onUp);
    };
  };

  const deal = () => {
    for (const c of cards) c.detach();
    host.innerHTML = "";
    gone = new Set<number>();

    const next = getCards();
    cards = next.map((kit, i) => {
      const outer = document.createElement("div");
      outer.className = "kit";
      const inner = document.createElement("div");
      inner.style.backgroundImage = `url(${kit.src})`;
      const label = document.createElement("span");
      label.textContent = kit.alt;
      inner.appendChild(label);
      outer.appendChild(inner);
      host.appendChild(outer);

      const state: CardState = {
        kit,
        i,
        rot: -10 + Math.random() * 20,
        y: i * -4,
        outer,
        inner,
        gone: false,
        detach: () => {},
      };
      attachGesture(state);
      enter(state);
      return state;
    });
  };

  const destroy = () => {
    if (pendingDeal) clearTimeout(pendingDeal);
    for (const c of cards) c.detach();
    host.innerHTML = "";
    cards = [];
  };

  return { deal, destroy };
};

export const renderApp = (root: HTMLElement): (() => void) => {
  root.innerHTML = `
    <h1>KIT PICS</h1>
    <div class="hint" hidden>
      Try swiping or dragging the kits! Right for a like, left for dislike.
    </div>
    <div class="swipe swipe-left" data-hint-toggle></div>
    <div class="swipe swipe-right" data-hint-toggle></div>
    <div id="deck"></div>
    <nav>
      <a class="link" href="/about/" data-link>About</a>
      |
      <a class="link" href="/stats/" data-link>Stats</a>
    </nav>
  `;

  const hint = root.querySelector<HTMLDivElement>(".hint")!;
  const showHint = () => {
    if (!hint.hasAttribute("hidden")) return;
    hint.removeAttribute("hidden");
  };
  const hintToggles = root.querySelectorAll<HTMLDivElement>("[data-hint-toggle]");
  hintToggles.forEach((el) => el.addEventListener("click", showHint));

  const deckEl = root.querySelector<HTMLDivElement>("#deck")!;
  const deck = createDeck(deckEl);
  deck.deal();

  return () => {
    deck.destroy();
    hintToggles.forEach((el) => el.removeEventListener("click", showHint));
  };
};
