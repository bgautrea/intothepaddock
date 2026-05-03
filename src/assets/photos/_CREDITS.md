# Photo credits

All photographs in this directory are sourced from **Wikimedia Commons** under
permissive licenses (typically CC BY 2.0, CC BY-SA 4.0, or CC0). Each row in
this file documents one photo: where it came from, its author, and its license.

## File-naming convention

| Folder | File | Slug match |
|---|---|---|
| `drivers/` | `<driver-slug>.jpg` | `src/content/drivers/<driver-slug>.md` |
| `teams/` | `<team-slug>.jpg` | `src/content/teams/<team-slug>.md` |
| `tracks/` | `<track-slug>.jpg` | `src/content/tracks/<track-slug>.md` |

Reference the photo from frontmatter:

```yaml
portrait: ../../assets/photos/drivers/max-verstappen.jpg
portraitCredit: 'Photo: Lukas Raich (CC BY-SA 4.0) via Wikimedia Commons'
```

## How to add a photo

1. Find a Commons-licensed image at `https://commons.wikimedia.org/`.
2. Confirm the license is one of: CC BY, CC BY-SA, or CC0. **Reject** anything
   marked "fair use," "non-commercial," or unclear.
3. Download the highest-resolution available; save as JPEG at <500 KB
   (use `jpegoptim --max=85` or similar).
4. Save to the matching folder using the slug naming convention above.
5. Add a row to the table below, then update the matching markdown file's
   frontmatter to point at the image and set `portraitCredit`.

## Credits

| File | Source URL | Author | License |
|---|---|---|---|
| _none yet_ | — | — | — |

<!--
When adding rows, copy this template:
| `drivers/max-verstappen.jpg` | https://commons.wikimedia.org/wiki/File:... | Lukas Raich | CC BY-SA 4.0 |
-->
