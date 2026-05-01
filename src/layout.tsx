import type { FC } from "hono/jsx";

type Props = {
  title?: string;
  description?: string;
  children: unknown;
};

export const Layout: FC<Props> = ({
  title = "Kit Pics",
  description = "Swipe your way through all home and away kits from every Premier League season",
  children,
}) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
      />
      <meta name="theme-color" content="#6fcf97" />
      <meta name="description" content={description} />
      <meta property="og:url" content="https://kit.pics/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://kit.pics/og-image.jpg" />
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="stylesheet"
        href="https://www.unpkg.com/normalize.css@8.0.1/normalize.css"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Luckiest+Guy&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/style.css" />
      <title>{title}</title>
    </head>
    <body>
      <div id="root">{children}</div>
      <script type="module" src="/tread.js"></script>
    </body>
  </html>
);
