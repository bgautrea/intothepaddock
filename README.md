# Into the Paddock

An independent, educational guide to Formula 1 — drivers, teams, the car, race weekends, rules, tracks, and strategy. Built for newcomers and casual fans leveling up.

Production: **[intothepaddock.com](https://intothepaddock.com)** (deploying soon).

## Stack

- [Astro](https://astro.build/) (static output) with MDX content
- Live data via [jolpica-f1](https://github.com/jolpica/jolpica-f1) (community continuation of the Ergast API), with committed JSON snapshots in `data/snapshots/` as a fallback
- Self-hosted fonts (Barlow Condensed, Inter, JetBrains Mono) via Fontsource
- Containerized with Caddy (`Dockerfile`), deployed to DigitalOcean Kubernetes (manifests in `deploy/`)
- CI: GitHub Actions for image build/push and daily snapshot refresh

## Local development

```sh
npm install
npm run dev          # binds 0.0.0.0:4321 — open from any device on the network
npm run build        # static output in dist/
npm run preview      # serve dist/ at 0.0.0.0:4321
```

## Refreshing live data manually

```sh
npm run refresh-snapshots   # writes data/snapshots/*.json from jolpica
```

CI runs this daily at 06:00 UTC and pushes any changes to `main`, which triggers a redeploy.

## Project layout

- `src/pages/` — one file per route. Hub + detail for drivers, teams, tracks; single-topic pages for the car, race weekend, rules, strategy.
- `src/content/` — Markdown / MDX content for drivers, teams, tracks, and the four single-topic deep-dives. Schemas in `src/content.config.ts`.
- `src/components/` — UI primitives (`Hero`, `KerbDivider`, `EntityCard`, `StepCard`, `StatBlock`, `JargonTip`, `AnalogyCallout`, etc.) and the live `NextRaceCountdown` island.
- `src/styles/` — design tokens (`tokens.css`), kerb-stripe utilities (`kerb.css`), global resets (`global.css`).
- `src/lib/jolpica.ts` — typed wrappers around the jolpica API with snapshot fallback.
- `data/snapshots/` — committed jolpica responses (driver standings, constructor standings, season schedule).
- `deploy/` — Kubernetes manifests + Caddyfile.
- `.github/workflows/` — `build-and-deploy.yml`, `refresh-snapshots.yml`.

## Deployment notes

Before the first cluster apply, fill in:

- `deploy/deployment.yaml`: replace `REPLACE_DOCKERHUB_USERNAME` with your Docker Hub username
- GitHub repo secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `DIGITALOCEAN_ACCESS_TOKEN`, `DO_CLUSTER_NAME`

Bootstrap once:

```sh
kubectl apply -f deploy/namespace.yaml
kubectl apply -f deploy/
```

CI takes over from there.

## License & attribution

Independent fan project. Not affiliated with Formula 1, FIA, FOM, or any team. Driver / car photography is sourced from Wikimedia Commons under the contributors' chosen licenses; full credits ship with the v1 launch.
