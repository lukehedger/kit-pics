const deck = document.getElementById("deck");
const hint = document.getElementById("hint");

document.querySelectorAll("[data-hint]").forEach((el) => {
  el.addEventListener("click", () => {
    if (!hint) return;
    hint.hidden = false;
    setTimeout(() => (hint.hidden = true), 7000);
  });
});

function layoutInitial() {
  const cards = [...deck.querySelectorAll(".kit")];
  cards.forEach((card, i) => {
    const rot = (Math.random() * 20 - 10).toFixed(2);
    card.dataset.rot = rot;
    card.style.transform = `translate3d(0, ${i * -4}px, 0)`;
    const inner = card.firstElementChild;
    inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1)`;
    attachGestures(card);
  });
}

function attachGestures(card) {
  let startX = 0;
  let startTime = 0;
  let dragging = false;
  let pointerId = null;

  const onDown = (e) => {
    if (card.classList.contains("gone")) return;
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
    inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1.1)`;
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
      card.classList.add("gone");
      const flyX = (200 + window.innerWidth) * dir;
      const rot = Number(card.dataset.rot || 0) + dir * 10 * velocity;
      card.style.transform = `translate3d(${flyX}px, ${index * -4}px, 0)`;
      inner.style.transform = `perspective(1500px) rotateX(30deg) rotateY(${rot / 10}deg) rotateZ(${rot}deg) scale(1)`;
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

function checkDeckEmpty() {
  const remaining = [...deck.querySelectorAll(".kit")].filter(
    (c) => !c.classList.contains("gone"),
  );
  if (remaining.length === 0) {
    setTimeout(refillDeck, 600);
  }
}

async function refillDeck() {
  try {
    const res = await fetch("/api/cards");
    const cards = await res.json();
    deck.innerHTML = "";
    cards.forEach((kit, i) => {
      const el = document.createElement("div");
      el.className = "kit";
      el.dataset.kitId = String(kit.id);
      el.dataset.index = String(i);
      const inner = document.createElement("div");
      inner.style.backgroundImage = `url(/kits/${kit.src})`;
      const span = document.createElement("span");
      span.textContent = kit.alt;
      inner.appendChild(span);
      el.appendChild(inner);
      deck.appendChild(el);
    });
    layoutInitial();
  } catch {}
}

layoutInitial();
