# Race notes

Drop one Markdown file per race here, named `<season>-<track>.md` (e.g.
`2026-monaco.md`). The file is read by `scripts/draft-recap-prose.mjs`
and passed to the LLM as the **story scaffolding**: the things only a
human who watched the race would know (a first-lap incident, a strategy
gamble, a radio meltdown). The LLM has the timing data; you give it the
moments.

## Format

Loose. 3 to 5 bullets, free text. Whatever's in the file is dropped into
the LLM prompt under "my notes from watching the race." Example:

```markdown
- Verstappen got bumped at lights-out by Hamilton, never recovered
  pace and finished P5 after a long opening stint.
- Norris's middle stint was the fastest in the race; he was 0.3s/lap
  quicker than anyone else, and that's where the win was actually built.
- Russell's strategy fell apart at the safety car on lap 38; he'd
  just pitted, got passed by everyone who hadn't.
- Mandatory two-stop rule didn't change much; Monaco still Monaco'd.
```

## When to write notes

Right after you watch the race. The cron runs Mondays, so notes should
land Sunday night or Monday morning to be picked up automatically.

If a notes file is missing when cron runs, the workflow waits up to 5
days before drafting in degraded mode (LLM has data only, so the prose
is more clinical with no story scaffolding). The PR description gets a
marker so you know to add a hand-written take if you want one.

You can also trigger the workflow manually via Actions → Draft race
recap → Run workflow, with `force_draft_without_notes: true`.
