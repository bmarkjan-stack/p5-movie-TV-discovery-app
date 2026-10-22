# Movie & TV Finder

A React + TypeScript + Vite app for discovering movies and TV shows with the TMDB API.

## Features

- Movies **and** TV shows, switchable with a toggle
- Live search (debounced) with infinite scroll + a "Load more" button
- Genre, sort (popularity / rating / release date), minimum rating and year-range filters
- Shareable URLs: `/?type=tv&genre=18&sort=rating&q=...` survive refresh
- Details pages at `/movie/:id` and `/tv/:id`
- Favorites (saved in localStorage, movies and TV kept separate)
- Response caching, skeleton loaders, keyboard/screen-reader friendly UI

## Setup

```bash
npm install
cp .env.example .env    # then fill in ONE credential option
npm run dev
```

### Credentials (choose one in `.env`)

| Option | Variable | When to use |
| --- | --- | --- |
| 1 | `VITE_TMDB_PROXY_URL=/api/tmdb` + server-side `TMDB_READ_TOKEN` | Deployed sites. Token never reaches the browser. |
| 2 | `VITE_TMDB_READ_TOKEN` | Local dev. v4 token sent as a Bearer header. |
| 3 | `VITE_TMDB_API_KEY` | Legacy v3 key (ends up in the URL). |

Your existing `VITE_TMDB_API_KEY` keeps working. Get the v4 "API Read Access Token"
from TMDB → Settings → API.

### Using the serverless proxy (Vercel)

1. Push the repo to Vercel (the `api/tmdb.ts` file is picked up automatically).
2. In Vercel → Project Settings → Environment Variables, add `TMDB_READ_TOKEN`
   (no `VITE_` prefix) and `VITE_TMDB_PROXY_URL=/api/tmdb`.
3. Redeploy. To test locally, run `npx vercel dev` instead of `npm run dev`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project structure

```
api/tmdb.ts              Serverless TMDB proxy (Vercel)
src/services/            movieApi.ts (TMDB client), cache.ts, sortOptions.ts
src/hooks/               useDebounce, useInfiniteScroll, useDocumentMeta
src/context/             Favorites provider + hook
src/components/          Cards, grid, skeletons, search, filters, toggle
src/pages/               Home, Details (movie + tv), Favorites, NotFound
src/test/setup.ts        Vitest setup
```

This product uses the TMDB API but is not endorsed or certified by TMDB.
