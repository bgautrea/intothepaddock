# Into the Paddock

An independent, educational guide to Formula 1 — drivers, teams, the car, race weekends, rules, tracks, and strategy. Lives at `intothepaddock.com`. Built for newcomers and casual fans leveling up.

The local working directory remains `f1fordummies/` (legacy from the working title). The public-facing brand and code identifiers are `intothepaddock` / "Into the Paddock".

## Conventions

### Local servers and visual mockups

When starting any local server for mockups, visuals, diagrams, or the brainstorming visual companion, always bind to `0.0.0.0` (not `localhost` / `127.0.0.1`). For the brainstorming companion specifically, use:

```bash
scripts/start-server.sh --project-dir /home/brian/f1fordummies --host 0.0.0.0
```

The Astro dev server is already pinned to `0.0.0.0:4321` in `astro.config.mjs` — `npm run dev` is sufficient.
