# Salem Tamil Roots – storefront (salemtamilroots_web)

The new customer website for **salemtamilroots.in**, built with Next.js. It replaces
[`salemtamilroots_frontend`](https://github.com/inaivuIT-Git/salemtamilroots_frontend) page by page
and talks to the same API in [`salemtamilroots_backend`](https://github.com/inaivuIT-Git/salemtamilroots_backend).
The two existing repos are not changed by this one.

## Milestone 1 (this version): look and feel

| Page | Path | Status |
|------|------|--------|
| Home | `/` (English), `/ta` (Tamil) | Done: offer banners, categories, best sellers, new arrivals, story, reviews |
| Product | `/products/{slug}` | Done: gallery, sizes, price and discount, stock, add to cart, description, reviews, related |
| Cart | `/cart` | Guest cart saved on the device; checkout comes in milestone 2 |
| Everything else | shop listing, sign-in, account, checkout, seller, admin | Still served by the current site; links point there |

## Stack

- Next.js 16 (App Router, server-rendered product pages for search engines), React 19, TypeScript
- Tailwind CSS 4 with the brand design system in `src/app/globals.css`
- next-intl for English / தமிழ் (`messages/en.json`, `messages/ta.json`)
- Fonts: Fraunces (headings), Poppins (body, as on the current site), Catamaran and Noto Sans Tamil (Tamil)

## Brand

Colours come from the logo and the current site: forest green `#084422` (primary), leaf greens,
cream `#F5F1E6` page colour and tan `#D4A373`. Turmeric gold `#E3A220` and kumkum red `#9B1C1C`,
already used in the Menmai posters, add the festive accent. Use the tokens (`bg-forest-800`,
`text-turmeric-500`, …), never raw hex values in components.

## Run it locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site opens at http://localhost:3101.

- To use the UAT API from your laptop, `API_BASE_URL=https://uat.salemtamilroots.in` must be reachable.
- Without API access, set `USE_SAMPLE_DATA=1`: pages then use `src/lib/sample-data.ts` and show a red
  "Sample data" bar. Never set it on UAT or production.

Checks before a pull request:

```bash
npm run typecheck
npm run build
```

## How it talks to the API

`src/lib/api.ts` is the only place that calls the API. It runs on the server, caches responses for
5 minutes and turns the API's two response shapes (`ApiResponse` and the double-wrapped
`ServiceResponse`) into the simple models in `src/lib/types.ts`. Image paths from the API
(`/assets/images/...`) are prefixed with `API_BASE_URL`.

Prices follow the current site and checkout: the discounted price shows only while a discount is
active; otherwise the MRP is the price.

## Deploying next to the current site

The app listens only on the server itself (`localhost:3101`) and nginx sends the rebuilt pages to it,
while every other address keeps going to the current frontend. See `deploy/`:

- `salemtamilroots-web.service`: systemd service
- `nginx-switchover.conf`: the nginx lines for the switch-over, and how to roll back

Start the server with `npm run start`. It uses `--hostname localhost`: with `--hostname 127.0.0.1`
Next.js 16 sends the language rewrite to itself and loops.

## Branches

Feature branches → `dev` → `uat` → `main`, as in the other two repos.
