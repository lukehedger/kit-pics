<p align='center'>
  <img src='https://user-images.githubusercontent.com/1913316/62823393-39223400-bb88-11e9-8e29-35add8660e80.png' width='256'/>
</p>

<h4 align="center">Swipe your way through all home and away kits from every Premier League season</h4>

<br>

<p align='center'>
  <img src='https://user-images.githubusercontent.com/1913316/62823411-6838a580-bb88-11e9-8bbf-c0129d8d3bcb.jpg' width='317'/>
</p>

## Stack

- [Cloudflare Workers](https://developers.cloudflare.com/workers/) runtime
- [Hono](https://hono.dev) with JSX for SSR pages and API routes
- [D1](https://developers.cloudflare.com/d1/) for the `kits` catalogue and per-session `votes`
- [R2](https://developers.cloudflare.com/r2/) for kit images (bucket `kit-pics-images`)
- Workers Assets for other static files in `public/`

## Local development

```sh
bun install
bun x wrangler d1 create kitpics                   # copy the database_id into wrangler.toml
bun x wrangler r2 bucket create kit-pics-images
bun run seed:local                                 # init schema + seed 1090 kits
./scripts/upload-r2.sh                             # upload PNGs from kits-source/ to R2
bun run dev
```

## Deploy

```sh
bun run seed:remote
./scripts/upload-r2.sh
bun run deploy
```

## Layout

- `src/index.tsx` — Hono app, routes, D1/R2 handlers
- `src/pages/` — SSR JSX pages (`home`, `about`, `stats`, `timeline`)
- `public/deck.js` — client-side swipe deck (pointer events, posts votes to `/api/votes`)
- `public/timeline.js` — client-side team selector for `/timeline/`
- `migrations/0001_init.sql` — D1 schema
- `scripts/generate-seed.mjs` — rebuilds `migrations/0002_seed_kits.sql` from `src/kits.json`
- `kits-source/` — source PNGs, uploaded to R2 (not bundled with the Worker)
