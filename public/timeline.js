const dataEl = document.getElementById("timeline-data");
const data = dataEl ? JSON.parse(dataEl.textContent || "{}") : {};
const select = document.getElementById("team-select");
const content = document.getElementById("timeline-content");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderYears(yearMap) {
  const years = Object.keys(yearMap).sort((a, b) => Number(a) - Number(b));
  if (years.length === 0) return "<p>No kits found for this team.</p>";
  return `
    <ol class="timeline-years">
      ${years
        .map(
          (year) => `
        <li class="timeline-year">
          <span class="timeline-year-label">${esc(year)}</span>
          <div class="timeline-year-kits">
            ${yearMap[year]
              .map(
                (kit) => `
              <figure class="timeline-kit">
                <img src="/kits/${esc(kit.src)}" alt="${esc(kit.alt)}" />
                <figcaption>${esc(kit.type)}</figcaption>
              </figure>
            `,
              )
              .join("")}
          </div>
        </li>
      `,
        )
        .join("")}
    </ol>
  `;
}

if (select && content) {
  select.addEventListener("change", () => {
    content.innerHTML = renderYears(data[select.value] || {});
  });
}
