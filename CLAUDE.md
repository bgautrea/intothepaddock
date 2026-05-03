# F1 for Dummies

An educational website covering Formula 1: drivers, teams, cars, parts, history, etc. Inspired by the visual style of ethereallearning.com.

## Conventions

### Local servers and visual mockups

When starting any local server for mockups, visuals, diagrams, or the brainstorming visual companion, always bind to `0.0.0.0` (not `localhost` / `127.0.0.1`). For the brainstorming companion specifically, use:

```bash
scripts/start-server.sh --project-dir /home/brian/f1fordummies --host 0.0.0.0
```
