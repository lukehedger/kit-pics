export const renderAbout = (root: HTMLElement) => {
  root.innerHTML = `
    <a href="/" data-link style="text-decoration: none">
      <h1>KIT PICS</h1>
    </a>

    <p class="about">
      Swipe your way through all home and away kits from every Premier League
      season from 1992 to 2018 - that's 1,090 kits!
    </p>

    <p class="about">
      Originally conceived on That Peter Crouch Podcast. Piss off Carl.
    </p>

    <p class="about">
      <span aria-label="football" role="img">⚽️</span>
    </p>
  `;
};
