import { renderApp } from "./App.ts";
import { renderAbout } from "./About.ts";
import { renderStats } from "./Stats.ts";

type Route = (root: HTMLElement) => void | (() => void);

const routes: Array<[RegExp, Route]> = [
  [/^\/about\/?$/, renderAbout],
  [/^\/stats\/?$/, renderStats],
  [/^\/?$/, renderApp],
];

let cleanup: (() => void) | void;

const render = () => {
  const root = document.getElementById("root");
  if (!root) return;
  if (typeof cleanup === "function") cleanup();
  root.innerHTML = "";
  const path = window.location.pathname;
  for (const [pattern, route] of routes) {
    if (pattern.test(path)) {
      cleanup = route(root);
      return;
    }
  }
  cleanup = renderApp(root);
};

export const navigate = (to: string) => {
  if (to === window.location.pathname) return;
  window.history.pushState({}, "", to);
  render();
};

window.addEventListener("popstate", render);

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement | null;
  const link = target?.closest("a[data-link]") as HTMLAnchorElement | null;
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href) return;
  e.preventDefault();
  navigate(href);
});

render();
