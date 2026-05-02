const deck = document.getElementById("deck");
const hint = document.getElementById("hint");

const HINT_KEY = "kitpics-hint-seen";
const HINT_MS = 7000;

function showHint() {
  if (!hint) return;
  hint.hidden = false;
  setTimeout(() => (hint.hidden = true), HINT_MS);
}

if (hint) {
  try {
    if (!localStorage.getItem(HINT_KEY)) {
      showHint();
      localStorage.setItem(HINT_KEY, "1");
    }
  } catch {
    showHint();
  }
}

document.querySelector(".swipe-left")?.addEventListener("click", () => {
  voteTopCard("dislike");
});
document.querySelector(".swipe-right")?.addEventListener("click", () => {
  voteTopCard("like");
});

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLElement) {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    voteTopCard("dislike");
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    voteTopCard("like");
  }
});

function layoutInitial() {
  const cards = [...deck.querySelectorAll(".kit")];
  cards.forEach((card, i) => {
    const rot = (Math.random() * 20 - 10).toFixed(2);
    card.dataset.rot = rot;
    card.dataset.index = String(i);
    card.style.transform = `translate3d(0, ${i * -4}px, 0)`;
    const inner = card.firstElementChild;
    inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1)`;
    attachGestures(card);

    card.style.animationDelay = `${i * 70}ms`;
    card.classList.add("drop-in");
    card.addEventListener(
      "animationend",
      () => {
        card.classList.remove("drop-in");
        card.style.animationDelay = "";
      },
      { once: true },
    );
  });
}

function topCard() {
  const cards = [...deck.querySelectorAll(".kit")].filter(
    (c) => !c.classList.contains("gone"),
  );
  return cards.length > 0 ? cards[cards.length - 1] : null;
}

function flyOff(card, dir) {
  const index = Number(card.dataset.index || 0);
  card.classList.add("gone");
  const flyX = window.innerWidth * 1.5 * dir;
  card.style.transform = `translate3d(${flyX}px, ${index * -4}px, 0)`;
}

function voteTopCard(vote) {
  const card = topCard();
  if (!card) return;
  if (card.classList.contains("drop-in")) {
    card.classList.remove("drop-in");
    card.style.animationDelay = "";
  }
  const dir = vote === "like" ? 1 : -1;
  flyOff(card, dir);
  recordVote(Number(card.dataset.kitId), vote).catch(() => {});
  checkDeckEmpty();
}

function attachGestures(card) {
  let startX = 0;
  let startTime = 0;
  let dragging = false;
  let pointerId = null;

  const onDown = (e) => {
    if (card.classList.contains("gone")) return;
    if (card.classList.contains("drop-in")) {
      card.classList.remove("drop-in");
      card.style.animationDelay = "";
    }
    pointerId = e.pointerId;
    card.setPointerCapture(pointerId);
    startX = e.clientX;
    startTime = performance.now();
    dragging = true;
    card.classList.add("dragging");
  };

  const onMove = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const rot = Number(card.dataset.rot || 0) + dx / 10;
    const index = Number(card.dataset.index || 0);
    card.style.transform = `translate3d(${dx}px, ${index * -4}px, 0)`;
    const inner = card.firstElementChild;
    inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1)`;
  };

  const onUp = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    card.classList.remove("dragging");
    const dx = e.clientX - startX;
    const dt = Math.max(1, performance.now() - startTime);
    const velocity = Math.abs(dx) / dt;
    const trigger = velocity > 0.2 || Math.abs(dx) > 120;
    const dir = dx < 0 ? -1 : 1;
    const index = Number(card.dataset.index || 0);
    const inner = card.firstElementChild;

    if (trigger) {
      flyOff(card, dir);
      recordVote(
        Number(card.dataset.kitId),
        dir === 1 ? "like" : "dislike",
      ).catch(() => {});
      checkDeckEmpty();
    } else {
      const rot = Number(card.dataset.rot || 0);
      card.style.transform = `translate3d(0, ${index * -4}px, 0)`;
      inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1)`;
    }
  };

  card.addEventListener("pointerdown", onDown);
  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerup", onUp);
  card.addEventListener("pointercancel", onUp);
}

async function recordVote(kitId, vote) {
  await fetch("/api/votes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kitId, vote }),
  });
}

let refilling = false;

function checkDeckEmpty() {
  const remaining = [...deck.querySelectorAll(".kit")].filter(
    (c) => !c.classList.contains("gone"),
  );
  if (remaining.length === 0 && !refilling) {
    refilling = true;
    refillDeck().finally(() => {
      refilling = false;
    });
  }
}

async function refillDeck() {
  let cards;
  try {
    const [res] = await Promise.all([
      fetch("/api/cards"),
      new Promise((r) => setTimeout(r, 300)),
    ]);
    if (!res.ok) throw new Error(`status ${res.status}`);
    cards = await res.json();
  } catch {
    deck.innerHTML = "";
    showRefillError();
    return;
  }
  deck.innerHTML = "";
  if (cards.length === 0) {
    showEmptyState();
    return;
  }
  cards.forEach((kit) => {
    const el = document.createElement("div");
    el.className = "kit";
    el.dataset.kitId = String(kit.id);
    const inner = document.createElement("div");
    inner.style.backgroundImage = `url(/kits/${kit.src})`;
    const span = document.createElement("span");
    span.textContent = kit.alt;
    inner.appendChild(span);
    el.appendChild(inner);
    deck.appendChild(el);
  });
  layoutInitial();
}

function showEmptyState() {
  document.querySelectorAll(".swipe").forEach((el) => el.remove());
  const empty = document.createElement("div");
  empty.className = "empty-state";
  const h2 = document.createElement("h2");
  h2.textContent = "All done!";
  const p = document.createElement("p");
  p.textContent = "You've rated every kit.";
  const a = document.createElement("a");
  a.className = "empty-cta";
  a.href = "/stats/";
  a.textContent = "See your picks";
  empty.appendChild(h2);
  empty.appendChild(p);
  empty.appendChild(a);
  deck.appendChild(empty);
}

function showRefillError() {
  const err = document.createElement("div");
  err.className = "empty-state";
  const h2 = document.createElement("h2");
  h2.textContent = "Couldn't load";
  const p = document.createElement("p");
  p.textContent = "Check your connection and try again.";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "empty-cta";
  btn.textContent = "Retry";
  btn.addEventListener("click", () => {
    err.remove();
    checkDeckEmpty();
  });
  err.appendChild(h2);
  err.appendChild(p);
  err.appendChild(btn);
  deck.appendChild(err);
}

layoutInitial();
